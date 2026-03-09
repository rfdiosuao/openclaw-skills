/**
 * 飞书多 Agent 管理器
 * 
 * 功能：
 * 1. 主 Agent 自主创建子 Agent（动态添加新 Agent）
 * 2. 用户在 UI 界面直接配置多个飞书 Bot 凭证
 * 3. 自动生成路由规则（bindings）
 * 4. 支持 Agent 人设文件模板生成
 * 
 * @packageDocumentation
 */

import { SessionContext } from '@openclaw/core';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// 类型定义
// ============================================================================

interface AgentConfig {
  id: string;
  name: string;
  workspace: string;
  agentDir?: string;
  default?: boolean;
  model?: {
    primary: string;
  };
}

interface FeishuAccount {
  appId: string;
  appSecret: string;
}

interface OpenClawConfig {
  agents: {
    defaults?: {
      model?: {
        primary: string;
      };
      compaction?: {
        mode: string;
      };
    };
    list: AgentConfig[];
  };
  channels: {
    feishu: {
      enabled: boolean;
      accounts: Record<string, FeishuAccount>;
    };
  };
  bindings: Array<{
    agentId: string;
    match: {
      channel: string;
      accountId: string;
      peer?: {
        kind: 'direct' | 'group';
        id: string;
      };
    };
  }>;
  tools: {
    agentToAgent: {
      enabled: boolean;
      allow: string[];
    };
  };
}

interface CreateAgentParams {
  agentId: string;
  agentName: string;
  feishuAppId: string;
  feishuAppSecret: string;
  isDefault?: boolean;
  workspacePath?: string;
  model?: string;
}

interface CredentialUpdateParams {
  agentId: string;
  appId: string;
  appSecret: string;
}

// ============================================================================
// 工具函数
// ============================================================================

/**
 * 读取 openclaw.json 配置文件
 */
function readOpenClawConfig(configPath: string): OpenClawConfig {
  const content = fs.readFileSync(configPath, 'utf-8');
  return JSON.parse(content);
}

/**
 * 写入 openclaw.json 配置文件
 */
function writeOpenClawConfig(configPath: string, config: OpenClawConfig): void {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
}

/**
 * 创建 Agent 工作区目录结构
 */
function createAgentWorkspace(workspacePath: string): void {
  const dirs = [
    workspacePath,
    path.join(workspacePath, 'memory'),
  ];
  
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}

/**
 * 生成 SOUL.md 模板
 */
function generateSoulTemplate(agentId: string, agentName: string, role: string = '通用助理'): string {
  return `# SOUL.md - ${agentName}

你是用户的${role}，专注于为用户提供专业协助。

## 核心职责
1. 响应用户消息，提供高质量回复
2. 记录重要信息到工作区记忆文件
3. 与其他 Agent 协作完成复杂任务

## 工作准则
1. 回答简洁清晰，主动提供帮助
2. 涉及外部操作先确认再执行
3. 记录用户偏好和重要决策到 MEMORY.md

## 协作方式
- 需要协助时通过 sessions_send 联系其他 Agent
- 收到协作请求后及时响应
- 任务完成后主动反馈结果
`;
}

/**
 * 生成 AGENTS.md 模板
 */
function generateAgentsTemplate(existingAgents: AgentConfig[]): string {
  const agentRows = existingAgents.map(agent => {
    return `| **${agent.id}** | ${agent.name} | 专业领域 | 🤖 |`;
  }).join('\n');

  return `## OP 团队成员（所有 Agent 协作通讯录）

${agentRows}

## 协作协议

1. 使用 \`sessions_send\` 工具进行跨 Agent 通信
2. 收到协作请求后 10 分钟内给出明确响应
3. 任务完成后主动向发起方反馈结果
4. 涉及用户决策的事项必须上报 main 或用户本人
`;
}

/**
 * 生成 USER.md 模板
 */
function generateUserTemplate(): string {
  return `# USER.md - 关于你的用户

_学习并记录用户信息，提供更好的个性化服务。_

- **姓名:** [待填写]
- **称呼:** [待填写]
- **时区:** Asia/Shanghai
- **备注:** [记录用户偏好、习惯等]

---

随着与用户的互动，逐步完善这些信息。
`;
}

/**
 * 验证飞书凭证格式
 */
function validateFeishuCredentials(appId: string, appSecret: string): { valid: boolean; error?: string } {
  if (!appId.startsWith('cli_')) {
    return { valid: false, error: 'App ID 必须以 cli_ 开头' };
  }
  
  if (appId.length < 10) {
    return { valid: false, error: 'App ID 长度过短' };
  }
  
  if (appSecret.length !== 32) {
    return { valid: false, error: 'App Secret 必须是 32 位字符串' };
  }
  
  return { valid: true };
}

// ============================================================================
// 核心功能
// ============================================================================

/**
 * 创建新 Agent
 */
async function createAgent(ctx: SessionContext, params: CreateAgentParams): Promise<{ success: boolean; error?: string }> {
  const configPath = '/home/node/.openclaw/openclaw.json';
  
  try {
    // 1. 验证飞书凭证
    const validation = validateFeishuCredentials(params.feishuAppId, params.feishuAppSecret);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }
    
    // 2. 读取现有配置
    const config = readOpenClawConfig(configPath);
    
    // 3. 检查 Agent ID 是否已存在
    if (config.agents.list.some(a => a.id === params.agentId)) {
      return { success: false, error: `Agent ID "${params.agentId}" 已存在` };
    }
    
    // 4. 确定工作区路径
    const workspacePath = params.workspacePath || `/home/node/.openclaw/workspace/${params.agentId}`;
    const agentDirPath = `/home/node/.openclaw/agents/${params.agentId}/agent`;
    
    // 5. 创建 Agent 配置
    const newAgent: AgentConfig = {
      id: params.agentId,
      name: params.agentName,
      workspace: workspacePath,
      agentDir: agentDirPath,
      ...(params.isDefault ? { default: true } : {}),
      ...(params.model ? { model: { primary: params.model } } : {}),
    };
    
    // 6. 添加到 agents.list
    config.agents.list.push(newAgent);
    
    // 7. 添加飞书账号
    config.channels.feishu.accounts[params.agentId] = {
      appId: params.feishuAppId,
      appSecret: params.feishuAppSecret,
    };
    
    // 8. 添加路由规则
    config.bindings.push({
      agentId: params.agentId,
      match: {
        channel: 'feishu',
        accountId: params.agentId,
      },
    });
    
    // 9. 添加到 agentToAgent 白名单
    if (!config.tools.agentToAgent.allow.includes(params.agentId)) {
      config.tools.agentToAgent.allow.push(params.agentId);
    }
    
    // 10. 写入配置
    writeOpenClawConfig(configPath, config);
    
    // 11. 创建工作区目录
    createAgentWorkspace(workspacePath);
    fs.mkdirSync(agentDirPath, { recursive: true });
    
    // 12. 生成 Agent 人设文件
    const soulPath = path.join(workspacePath, 'SOUL.md');
    const agentsPath = path.join(workspacePath, 'AGENTS.md');
    const userPath = path.join(workspacePath, 'USER.md');
    
    fs.writeFileSync(soulPath, generateSoulTemplate(params.agentId, params.agentName), 'utf-8');
    fs.writeFileSync(agentsPath, generateAgentsTemplate(config.agents.list), 'utf-8');
    fs.writeFileSync(userPath, generateUserTemplate(), 'utf-8');
    
    ctx.logger.info(`✅ Agent "${params.agentId}" 创建成功`);
    
    return { success: true };
  } catch (error: any) {
    ctx.logger.error(`❌ 创建 Agent 失败：${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * 更新飞书凭证
 */
async function updateFeishuCredential(ctx: SessionContext, params: CredentialUpdateParams): Promise<{ success: boolean; error?: string }> {
  const configPath = '/home/node/.openclaw/openclaw.json';
  
  try {
    // 1. 验证飞书凭证
    const validation = validateFeishuCredentials(params.appId, params.appSecret);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }
    
    // 2. 读取现有配置
    const config = readOpenClawConfig(configPath);
    
    // 3. 检查 Agent 是否存在
    const agentIndex = config.agents.list.findIndex(a => a.id === params.agentId);
    if (agentIndex === -1) {
      return { success: false, error: `Agent ID "${params.agentId}" 不存在` };
    }
    
    // 4. 更新飞书账号
    config.channels.feishu.accounts[params.agentId] = {
      appId: params.appId,
      appSecret: params.appSecret,
    };
    
    // 5. 写入配置
    writeOpenClawConfig(configPath, config);
    
    ctx.logger.info(`✅ Agent "${params.agentId}" 飞书凭证已更新`);
    
    return { success: true };
  } catch (error: any) {
    ctx.logger.error(`❌ 更新飞书凭证失败：${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * 列出所有 Agent
 */
async function listAgents(ctx: SessionContext): Promise<AgentConfig[]> {
  const configPath = '/home/node/.openclaw/openclaw.json';
  
  try {
    const config = readOpenClawConfig(configPath);
    return config.agents.list;
  } catch (error: any) {
    ctx.logger.error(`❌ 列出 Agent 失败：${error.message}`);
    return [];
  }
}

/**
 * 删除 Agent
 */
async function deleteAgent(ctx: SessionContext, agentId: string): Promise<{ success: boolean; error?: string }> {
  const configPath = '/home/node/.openclaw/openclaw.json';
  
  try {
    // 1. 读取现有配置
    const config = readOpenClawConfig(configPath);
    
    // 2. 检查 Agent 是否存在
    const agentIndex = config.agents.list.findIndex(a => a.id === agentId);
    if (agentIndex === -1) {
      return { success: false, error: `Agent ID "${agentId}" 不存在` };
    }
    
    // 3. 不允许删除 default Agent
    if (config.agents.list[agentIndex].default) {
      return { success: false, error: '不能删除默认 Agent' };
    }
    
    // 4. 从 agents.list 移除
    config.agents.list.splice(agentIndex, 1);
    
    // 5. 从飞书账号移除
    delete config.channels.feishu.accounts[agentId];
    
    // 6. 从 bindings 移除
    config.bindings = config.bindings.filter(b => b.agentId !== agentId);
    
    // 7. 从 agentToAgent 白名单移除
    config.tools.agentToAgent.allow = config.tools.agentToAgent.allow.filter(id => id !== agentId);
    
    // 8. 写入配置
    writeOpenClawConfig(configPath, config);
    
    ctx.logger.info(`✅ Agent "${agentId}" 已删除`);
    
    return { success: true };
  } catch (error: any) {
    ctx.logger.error(`❌ 删除 Agent 失败：${error.message}`);
    return { success: false, error: error.message };
  }
}

// ============================================================================
// Skill 主函数
// ============================================================================

/**
 * Skill 主函数
 * 
 * @param ctx - 会话上下文
 * @param args - 参数
 */
export async function main(ctx: SessionContext, args: Record<string, any>): Promise<void> {
  const { action, agentId, agentName, appId, appSecret, isDefault, workspacePath, model } = args;
  
  ctx.logger.info(`收到多 Agent 管理请求：action=${action}`);
  
  try {
    switch (action) {
      case 'create_agent': {
        // 创建新 Agent
        const result = await createAgent(ctx, {
          agentId,
          agentName,
          feishuAppId: appId,
          feishuAppSecret: appSecret,
          isDefault,
          workspacePath,
          model,
        });
        
        if (result.success) {
          await ctx.reply(`✅ Agent "${agentId}" 创建成功！\n\n工作区：\`${workspacePath || `/home/node/.openclaw/workspace/${agentId}`}\`\n\n请重启 OpenClaw 使配置生效：\n\`\`\`bash\nopenclaw restart\n\`\`\``);
        } else {
          await ctx.reply(`❌ 创建失败：${result.error}`);
        }
        break;
      }
      
      case 'update_credential': {
        // 更新飞书凭证
        const result = await updateFeishuCredential(ctx, {
          agentId,
          appId,
          appSecret,
        });
        
        if (result.success) {
          await ctx.reply(`✅ Agent "${agentId}" 飞书凭证已更新！\n\n请重启 OpenClaw 使配置生效：\n\`\`\`bash\nopenclaw restart\n\`\`\``);
        } else {
          await ctx.reply(`❌ 更新失败：${result.error}`);
        }
        break;
      }
      
      case 'list_agents': {
        // 列出所有 Agent
        const agents = await listAgents(ctx);
        
        if (agents.length === 0) {
          await ctx.reply('暂无 Agent 配置');
          return;
        }
        
        const agentList = agents.map((a, i) => {
          const defaultMark = a.default ? '👑' : '';
          return `${i + 1}. **${a.id}** - ${a.name} ${defaultMark}`;
        }).join('\n');
        
        await ctx.reply(`## 已配置的 Agent（共 ${agents.length} 个）\n\n${agentList}\n\n💡 提示：修改配置后需要重启 OpenClaw`);
        break;
      }
      
      case 'delete_agent': {
        // 删除 Agent
        const result = await deleteAgent(ctx, agentId);
        
        if (result.success) {
          await ctx.reply(`✅ Agent "${agentId}" 已删除！\n\n请重启 OpenClaw 使配置生效`);
        } else {
          await ctx.reply(`❌ 删除失败：${result.error}`);
        }
        break;
      }
      
      default:
        await ctx.reply(`❌ 未知操作：${action}\n\n支持的操作：\n- create_agent：创建新 Agent\n- update_credential：更新飞书凭证\n- list_agents：列出所有 Agent\n- delete_agent：删除 Agent`);
    }
  } catch (error: any) {
    ctx.logger.error(`Skill 执行错误：${error.message}`);
    await ctx.reply(`❌ 执行错误：${error.message}`);
  }
}

export default main;
