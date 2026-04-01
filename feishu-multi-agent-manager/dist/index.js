"use strict";
/**
 * 飞书多 Agent 配置助手 - 交互式引导版本
 *
 * 功能：
 * 1. 交互式询问用户要创建几个 Agent
 * 2. 提供飞书 Bot 创建详细教程
 * 3. 分步引导用户配置每个 Bot 的凭证
 * 4. 批量创建多个 Agent
 * 5. 自动生成配置和验证
 *
 * @packageDocumentation
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = main;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// ============================================================================
// 预定义的 Agent 角色模板
// ============================================================================
const AGENT_TEMPLATES = {
    main: {
        id: 'main',
        name: '大总管',
        role: '首席助理，专注于统筹全局、任务分配和跨 Agent 协调',
        soulTemplate: `# SOUL.md - 大总管

你是用户的首席助理，专注于统筹全局、任务分配和跨 Agent 协调。

## 核心职责
1. 接收用户需求，分析并分配给合适的专业 Agent
2. 跟踪各 Agent 任务进度，汇总结果反馈给用户
3. 处理跨领域综合问题，协调多 Agent 协作
4. 维护全局记忆和上下文连续性

## 工作准则
1. 优先自主处理通用问题，仅将专业问题分发给对应 Agent
2. 分派任务时使用 \`sessions_spawn\` 或 \`sessions_send\` 工具
3. 回答简洁清晰，主动汇报任务进展
4. 记录重要决策和用户偏好到 MEMORY.md

## 协作方式
- 技术问题 → 发送给 dev
- 内容创作 → 发送给 content
- 运营数据 → 发送给 ops
- 合同法务 → 发送给 law
- 财务账目 → 发送给 finance
`
    },
    dev: {
        id: 'dev',
        name: '开发助理',
        role: '技术开发助理，专注于代码编写、架构设计和运维部署',
        soulTemplate: `# SOUL.md - 开发助理

你是用户的技术开发助理，专注于代码编写、架构设计和运维部署。

## 核心职责
1. 编写、审查、优化代码（支持多语言）
2. 设计技术架构、数据库结构、API 接口
3. 排查部署故障、分析日志、修复 Bug
4. 编写技术文档、部署脚本、CI/CD 配置

## 工作准则
1. 代码优先给出可直接运行的完整方案
2. 技术解释简洁精准，少废话多干货
3. 涉及外部操作（部署、删除）先确认再执行
4. 记录技术方案和踩坑经验到工作区记忆

## 协作方式
- 需要产品需求 → 联系 main
- 需要技术文档美化 → 联系 content
- 需要运维监控 → 联系 ops
`
    },
    content: {
        id: 'content',
        name: '内容助理',
        role: '内容创作助理，专注于内容策划、文案撰写和素材整理',
        soulTemplate: `# SOUL.md - 内容助理

你是用户的内容创作助理，专注于内容策划、文案撰写和素材整理。

## 核心职责
1. 制定内容选题、规划发布节奏
2. 撰写各类文案（公众号、短视频、社交媒体）
3. 整理内容素材、建立内容库
4. 审核内容合规性、优化表达效果

## 工作准则
1. 文案风格根据平台调整（公众号正式、短视频活泼）
2. 主动提供多个版本供用户选择
3. 记录用户偏好和过往爆款内容特征
4. 内容创作需考虑 SEO 和传播性

## 协作方式
- 需要产品技术信息 → 联系 dev
- 需要发布渠道数据 → 联系 ops
- 需要内容合规审核 → 联系 law
`
    },
    ops: {
        id: 'ops',
        name: '运营助理',
        role: '运营增长助理，专注于用户增长、数据分析和活动策划',
        soulTemplate: `# SOUL.md - 运营助理

你是用户的运营增长助理，专注于用户增长、数据分析和活动策划。

## 核心职责
1. 统计各渠道运营数据、制作数据报表
2. 制定用户增长策略、设计裂变活动
3. 管理社交媒体账号、策划互动内容
4. 分析用户行为、优化转化漏斗

## 工作准则
1. 数据呈现用图表和对比，避免纯数字堆砌
2. 增长建议需给出具体执行步骤和预期效果
3. 记录历史活动数据和用户反馈
4. 关注行业标杆和最新运营玩法

## 协作方式
- 需要活动页面开发 → 联系 dev
- 需要活动文案 → 联系 content
- 需要活动合规审核 → 联系 law
- 需要活动预算 → 联系 finance
`
    },
    law: {
        id: 'law',
        name: '法务助理',
        role: '法务助理，专注于合同审核、合规咨询和风险规避',
        soulTemplate: `# SOUL.md - 法务助理

你是用户的法务助理，专注于合同审核、合规咨询和风险规避。

## 核心职责
1. 审核各类合同、协议、条款
2. 提供合规咨询、解读法律法规
3. 制定隐私政策、用户协议等法律文件
4. 识别业务风险、提供规避建议

## 工作准则
1. 法律意见需注明"仅供参考，建议咨询执业律师"
2. 合同审核需逐条标注风险点和修改建议
3. 记录用户业务类型和常用合同模板
4. 关注最新法律法规更新

## 协作方式
- 需要技术合同 → 联系 dev 了解技术细节
- 需要内容合规 → 联系 content 了解内容形式
- 需要活动合规 → 联系 ops 了解活动方案
`
    },
    finance: {
        id: 'finance',
        name: '财务助理',
        role: '财务助理，专注于账目统计、成本核算和预算管理',
        soulTemplate: `# SOUL.md - 财务助理

你是用户的财务助理，专注于账目统计、成本核算和预算管理。

## 核心职责
1. 统计收支账目、制作财务报表
2. 核算项目成本、分析利润情况
3. 制定预算计划、跟踪执行进度
4. 审核报销单据、核对发票信息

## 工作准则
1. 财务数据需精确到小数点后两位
2. 报表呈现清晰分类，支持多维度筛选
3. 记录用户常用科目和报销流程
4. 敏感财务信息注意保密

## 协作方式
- 需要项目成本 → 联系 dev 了解技术投入
- 需要活动预算 → 联系 ops 了解活动方案
- 需要合同付款条款 → 联系 law 审核
`
    }
};
// ============================================================================
// 工具函数
// ============================================================================
/**
 * 读取 openclaw.json 配置文件
 */
function readOpenClawConfig(configPath) {
    const content = fs.readFileSync(configPath, 'utf-8');
    return JSON.parse(content);
}
/**
 * 写入 openclaw.json 配置文件
 */
function writeOpenClawConfig(configPath, config) {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
}
/**
 * 创建 Agent 工作区目录结构
 */
function createAgentWorkspace(workspacePath) {
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
 * 生成 AGENTS.md 模板
 */
function generateAgentsTemplate(existingAgents) {
    const agentRows = existingAgents.map(agent => {
        const emoji = getAgentEmoji(agent.id);
        return `| **${agent.id}** | ${agent.name} | 专业领域 | ${emoji} |`;
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
 * 获取 Agent 表情符号
 */
function getAgentEmoji(agentId) {
    const emojis = {
        main: '🎯',
        dev: '🧑‍💻',
        content: '✍️',
        ops: '📈',
        law: '📜',
        finance: '💰'
    };
    return emojis[agentId] || '🤖';
}
/**
 * 生成 USER.md 模板
 */
function generateUserTemplate() {
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
function validateFeishuCredentials(appId, appSecret) {
    if (!appId.startsWith('cli_')) {
        return { valid: false, error: '❌ App ID 必须以 cli_ 开头' };
    }
    if (appId.length < 10) {
        return { valid: false, error: '❌ App ID 长度过短' };
    }
    if (appSecret.length !== 32) {
        return { valid: false, error: '❌ App Secret 必须是 32 位字符串' };
    }
    return { valid: true };
}
/**
 * 生成飞书应用创建教程
 */
function generateFeishuTutorial(agentName, index) {
    return `## 📘 第 ${index} 步：创建飞书应用「${agentName}」

### 步骤 1: 登录飞书开放平台
1. 访问 https://open.feishu.cn/
2. 使用你的飞书账号登录

### 步骤 2: 创建企业自建应用
1. 点击右上角「**创建应用**」
2. 选择「**企业自建**」
3. 输入应用名称：**${agentName}**
4. 点击「**创建**」

### 步骤 3: 获取应用凭证
1. 进入应用管理页面
2. 点击左侧「**凭证与基础信息**」
3. 复制 **App ID**（格式：cli_xxxxxxxxxxxxxxx）
4. 复制 **App Secret**（32 位字符串）
   - 如果看不到，点击「**查看**」或「**重置**」

### 步骤 4: 开启机器人能力
1. 点击左侧「**功能**」→「**机器人**」
2. ✅ 开启「**机器人能力**」
3. ✅ 开启「**以机器人身份加入群聊**」
4. 点击「**保存**」

### 步骤 5: 配置事件订阅
1. 点击左侧「**功能**」→「**事件订阅**」
2. 选择「**长连接**」模式（推荐）
3. 勾选以下事件：
   - ✅ \`im.message.receive_v1\` - 接收消息
   - ✅ \`im.message.read_v1\` - 消息已读（可选）
4. 点击「**保存**」

### 步骤 6: 配置权限
1. 点击左侧「**功能**」→「**权限管理**」
2. 搜索并添加以下权限：
   - ✅ \`im:message\` - 获取用户发给机器人的单聊消息
   - ✅ \`im:chat\` - 获取群组中发给机器人的消息
   - ✅ \`contact:user:readonly\` - 读取用户信息（可选）
3. 点击「**申请**」

### 步骤 7: 发布应用
1. 点击左侧「**版本管理与发布**」
2. 点击「**创建版本**」
3. 填写版本号：\`1.0.0\`
4. 点击「**提交审核**」（机器人类通常自动通过）
5. 等待 5-10 分钟生效

---

### ✅ 完成检查清单
- [ ] App ID 已复制（以 cli_ 开头）
- [ ] App Secret 已复制（32 位字符串）
- [ ] 机器人能力已开启
- [ ] 事件订阅已配置（长连接模式）
- [ ] 权限已申请（im:message, im:chat）
- [ ] 应用已发布

---

**准备好后，请回复以下信息：**

\`\`\`
第 ${index} 个 Bot 配置完成：
App ID: cli_xxxxxxxxxxxxxxx
App Secret: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
\`\`\`

我会帮你验证并添加到配置中！ 👍
`;
}
// ============================================================================
// 核心功能
// ============================================================================
/**
 * 批量创建多个 Agent
 */
async function createMultipleAgents(ctx, agents) {
    const configPath = '/home/node/.openclaw/openclaw.json';
    const results = [];
    try {
        // 1. 读取现有配置
        const config = readOpenClawConfig(configPath);
        // 2. 逐个创建 Agent
        for (const agent of agents) {
            try {
                // 验证凭证
                const validation = validateFeishuCredentials(agent.appId, agent.appSecret);
                if (!validation.valid) {
                    results.push({ id: agent.agentId, success: false, error: validation.error });
                    continue;
                }
                // 检查是否已存在
                if (config.agents.list.some(a => a.id === agent.agentId)) {
                    results.push({ id: agent.agentId, success: false, error: 'Agent ID 已存在' });
                    continue;
                }
                // 创建工作区路径 - 每个 Agent 完全独立
                const workspacePath = `/home/node/.openclaw/workspace-${agent.agentId}`;
                const agentDirPath = `/home/node/.openclaw/agents/${agent.agentId}/agent`;
                // 创建 Agent 配置
                const newAgent = {
                    id: agent.agentId,
                    name: agent.agentName,
                    workspace: workspacePath,
                    agentDir: agentDirPath,
                    ...(agent.isDefault ? { default: true } : {}),
                    ...(agent.model ? { model: { primary: agent.model } } : {}),
                };
                // 添加到 agents.list
                config.agents.list.push(newAgent);
                // 添加飞书账号
                config.channels.feishu.accounts[agent.agentId] = {
                    appId: agent.appId,
                    appSecret: agent.appSecret,
                };
                // 添加路由规则
                config.bindings.push({
                    agentId: agent.agentId,
                    match: {
                        channel: 'feishu',
                        accountId: agent.agentId,
                    },
                });
                // 添加到 agentToAgent 白名单
                if (!config.tools.agentToAgent.allow.includes(agent.agentId)) {
                    config.tools.agentToAgent.allow.push(agent.agentId);
                }
                // 写入配置
                writeOpenClawConfig(configPath, config);
                // 创建工作区目录
                createAgentWorkspace(workspacePath);
                fs.mkdirSync(agentDirPath, { recursive: true });
                // 生成 Agent 人设文件
                const soulPath = path.join(workspacePath, 'SOUL.md');
                const agentsPath = path.join(workspacePath, 'AGENTS.md');
                const userPath = path.join(workspacePath, 'USER.md');
                const template = AGENT_TEMPLATES[agent.agentId];
                if (template) {
                    fs.writeFileSync(soulPath, template.soulTemplate, 'utf-8');
                }
                else {
                    fs.writeFileSync(soulPath, `# SOUL.md - ${agent.agentName}\n\n你是用户的${agent.agentName}，专注于为用户提供专业协助。`, 'utf-8');
                }
                fs.writeFileSync(agentsPath, generateAgentsTemplate(config.agents.list), 'utf-8');
                fs.writeFileSync(userPath, generateUserTemplate(), 'utf-8');
                results.push({ id: agent.agentId, success: true });
                ctx.logger.info(`✅ Agent "${agent.agentId}" 创建成功`);
            }
            catch (error) {
                results.push({ id: agent.agentId, success: false, error: error.message });
                ctx.logger.error(`❌ 创建 Agent "${agent.agentId}" 失败：${error.message}`);
            }
        }
        return { success: results.every(r => r.success), results };
    }
    catch (error) {
        ctx.logger.error(`❌ 批量创建失败：${error.message}`);
        return { success: false, results: [] };
    }
}
// ============================================================================
// Skill 主函数
// ============================================================================
/**
 * Skill 主函数 - 交互式引导版本
 *
 * @param ctx - 会话上下文
 * @param args - 参数
 */
async function main(ctx, args) {
    const { action, count, agents, agentId, agentName, appId, appSecret, step, configData } = args;
    ctx.logger.info(`收到多 Agent 配置请求：action=${action}`);
    try {
        switch (action) {
            case 'start_wizard': {
                // 启动配置向导
                await ctx.reply(`🤖 **欢迎使用飞书多 Agent 配置助手！**

> 💡 **兼容飞书插件 2026.4.1** | OpenClaw ≥ 2026.3.31

我将引导你完成多个 Agent 的配置流程。

## 📋 配置流程

1. **选择 Agent 数量** - 告诉我要创建几个 Agent
2. **选择 Agent 角色** - 从预设角色中选择或自定义
3. **创建飞书应用** - 我会提供详细的创建教程
4. **配置凭证** - 逐个输入每个 Bot 的 App ID 和 App Secret
5. **验证并生成** - 自动验证凭证并生成配置
6. **重启生效** - 重启 OpenClaw 使配置生效

---

## 🎯 预设角色推荐

| 角色 | 职责 | 表情 |
|------|------|------|
| **main** | 大总管 - 统筹全局、分配任务 | 🎯 |
| **dev** | 开发助理 - 代码开发、技术架构 | 🧑‍💻 |
| **content** | 内容助理 - 内容创作、文案撰写 | ✍️ |
| **ops** | 运营助理 - 用户增长、活动策划 | 📈 |
| **law** | 法务助理 - 合同审核、合规咨询 | 📜 |
| **finance** | 财务助理 - 账目统计、预算管理 | 💰 |

---

## 🚀 快速开始

**请告诉我：你想创建几个 Agent？**

例如：
- \`3 个\` - 我推荐：main（大总管）+ dev（开发）+ content（内容）
- \`6 个\` - 完整团队：全部 6 个角色
- \`自定义\` - 你自由选择角色

回复数字或"自定义"，我们开始吧！ 😊

---

## 📦 前置检查

确保已安装：
- ✅ OpenClaw ≥ 2026.3.31
- ✅ 飞书官方插件 2026.4.1（\`npx -y @larksuite/openclaw-lark install\`）

**检查命令：** \`/feishu start\``);
                break;
            }
            case 'select_count': {
                // 用户选择数量
                const numCount = parseInt(count);
                if (isNaN(numCount) || numCount < 1 || numCount > 10) {
                    await ctx.reply(`❌ 请输入有效的数字（1-10 之间）

例如：\`3\` 或 \`6\``);
                    break;
                }
                // 生成推荐方案
                let recommendedAgents = '';
                if (numCount === 1) {
                    recommendedAgents = '推荐：**main**（大总管）- 全能型助理';
                }
                else if (numCount === 2) {
                    recommendedAgents = '推荐：**main**（大总管）+ **dev**（开发助理）';
                }
                else if (numCount === 3) {
                    recommendedAgents = '推荐：**main**（大总管）+ **dev**（开发助理）+ **content**（内容助理）';
                }
                else if (numCount === 6) {
                    recommendedAgents = '推荐：完整 6 人团队 - main + dev + content + ops + law + finance';
                }
                else {
                    recommendedAgents = `你可以从 6 个预设角色中选择 ${numCount} 个，或者自定义角色`;
                }
                await ctx.reply(`✅ 好的！我们将创建 **${numCount}** 个 Agent。

## 📋 推荐方案

${recommendedAgents}

---

## 🎯 请选择配置方式

**方式 1：使用预设角色**
回复 \`预设\` 或 \`模板\`，我会按推荐方案自动配置

**方式 2：自定义角色**
回复 \`自定义\`，然后告诉我你想用哪 ${numCount} 个角色

**方式 3：完全自定义**
回复 \`全新\`，每个角色都由你自由定义

请选择（回复数字或关键词）：`);
                break;
            }
            case 'show_tutorial': {
                // 显示飞书创建教程
                const agentIndex = parseInt(step) || 1;
                const name = agentName || `Agent ${agentIndex}`;
                const tutorial = generateFeishuTutorial(name, agentIndex);
                await ctx.reply(tutorial);
                break;
            }
            case 'validate_credentials': {
                // 验证用户提供的凭证
                const validation = validateFeishuCredentials(appId, appSecret);
                if (!validation.valid) {
                    await ctx.reply(`${validation.error}

**请检查后重新提供：**
- App ID 必须以 \`cli_\` 开头
- App Secret 必须是 32 位字符串
- 不要包含空格或换行

你可以回复 \`重试\` 重新输入，或回复 \`教程\` 查看创建步骤。`);
                    break;
                }
                await ctx.reply(`✅ 凭证验证通过！

**App ID:** \`${appId}\`
**App Secret:** \`${appSecret.substring(0, 8)}...\`（已隐藏）

准备添加到配置，请确认：
- 回复 \`确认\` 继续
- 回复 \`取消\` 放弃
- 回复 \`下一个\` 直接配置下一个`);
                break;
            }
            case 'batch_create': {
                // 批量创建 Agent
                const agentList = agents || [];
                if (!Array.isArray(agentList) || agentList.length === 0) {
                    await ctx.reply('❌ 没有提供有效的 Agent 列表');
                    break;
                }
                await ctx.reply(`🚀 开始创建 ${agentList.length} 个 Agent...

请稍候，正在处理：
${agentList.map((a, i) => `${i + 1}. ${a.agentId} - ${a.agentName}`).join('\n')}
`);
                const result = await createMultipleAgents(ctx, agentList);
                if (result.success) {
                    const successList = result.results.filter(r => r.success).map(r => r.id).join(', ');
                    await ctx.reply(`🎉 **批量创建成功！**

✅ 已创建 ${result.results.length} 个 Agent：
${result.results.map((r, i) => `${i + 1}. **${r.id}** - ${r.success ? '✅' : '❌ ' + r.error}`).join('\n')}

---

## 📝 下一步

### 1. 重启 OpenClaw
\`\`\`bash
openclaw restart
\`\`\`

### 2. 等待 Bot 上线
重启后等待 1-2 分钟，所有 Bot 会自动连接飞书

### 3. 测试 Bot
在飞书中搜索 Bot 名称，发送消息测试

### 4. 批量授权（重要）
在飞书对话中发送：
\`\`\`
/feishu auth
\`\`\`

完成用户授权，使 Agent 能访问你的飞书文档、日历等

### 5. 查看日志
\`\`\`bash
tail -f /home/node/.openclaw/run.log
\`\`\`

---

## 🚀 高级配置（可选）

### 开启流式输出
\`\`\`bash
openclaw config set channels.feishu.streaming true
\`\`\`

### 开启话题模式（独立上下文）
\`\`\`bash
openclaw config set channels.feishu.threadSession true
\`\`\`

### 诊断命令
\`\`\`
/feishu start   # 检查插件状态
/feishu doctor  # 深度诊断
/feishu auth    # 批量授权
\`\`\`

---

## 📚 配置详情

所有 Agent 的配置已保存到：
- **配置文件：** \`/home/node/.openclaw/openclaw.json\`
- **工作区：** \`/home/node/.openclaw/workspace-[agentId]/\`
- **人设文件：** 每个工作区包含 SOUL.md、AGENTS.md、USER.md

---

💡 **提示：** 
- 如果有任何 Bot 显示 offline，请检查飞书应用配置（凭证、事件订阅、权限）
- 飞书插件版本：2026.4.1 | OpenClaw 版本：≥ 2026.3.31

需要帮助请回复 \`帮助\` 或 \`排查\`！`);
                }
                else {
                    const failedList = result.results.filter(r => !r.success);
                    await ctx.reply(`⚠️ **部分创建失败**

成功：${result.results.filter(r => r.success).length}/${result.results.length}

**失败的 Agent：**
${failedList.map((r, i) => `${i + 1}. **${r.id}**: ${r.error}`).join('\n')}

---

**请检查：**
1. 飞书凭证是否正确
2. Agent ID 是否重复
3. 工作区路径是否可写

回复 \`重试 [agentId]\` 重新尝试创建失败的 Agent。`);
                }
                break;
            }
            case 'show_status': {
                // 显示当前配置状态
                const configPath = '/home/node/.openclaw/openclaw.json';
                try {
                    const config = readOpenClawConfig(configPath);
                    const agents = config.agents.list;
                    await ctx.reply(`## 📊 当前 Agent 配置状态

**已配置 Agent：** ${agents.length} 个

${agents.map((a, i) => {
                        const defaultMark = a.default ? '👑 ' : '';
                        const hasCredential = config.channels.feishu.accounts[a.id] ? '✅' : '❌';
                        return `${i + 1}. ${defaultMark}**${a.id}** - ${a.name} ${hasCredential}`;
                    }).join('\n')}

---

**飞书账号：** ${Object.keys(config.channels.feishu.accounts).length} 个
**路由规则：** ${config.bindings.length} 条
**Agent 协作：** ${config.tools.agentToAgent.allow.length} 个已启用

---

💡 提示：修改配置后需要 \`openclaw restart\` 生效`);
                }
                catch (error) {
                    await ctx.reply(`❌ 读取配置失败：${error.message}`);
                }
                break;
            }
            default:
                await ctx.reply(`❌ 未知操作：${action}

**支持的操作：**
- \`start_wizard\` - 启动配置向导
- \`select_count\` - 选择 Agent 数量
- \`show_tutorial\` - 显示飞书创建教程
- \`validate_credentials\` - 验证凭证
- \`batch_create\` - 批量创建 Agent
- \`show_status\` - 显示当前状态

**快速开始：** 回复 \`开始\` 或 \`help\``);
        }
    }
    catch (error) {
        ctx.logger.error(`Skill 执行错误：${error.message}`);
        await ctx.reply(`❌ 执行错误：${error.message}

请重试或联系管理员。`);
    }
}
exports.default = main;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7Ozs7OztHQVdHOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQWdpQkgsb0JBaVVDO0FBOTFCRCx1Q0FBeUI7QUFDekIsMkNBQTZCO0FBa0U3QiwrRUFBK0U7QUFDL0Usa0JBQWtCO0FBQ2xCLCtFQUErRTtBQUUvRSxNQUFNLGVBQWUsR0FBa0M7SUFDckQsSUFBSSxFQUFFO1FBQ0osRUFBRSxFQUFFLE1BQU07UUFDVixJQUFJLEVBQUUsS0FBSztRQUNYLElBQUksRUFBRSw4QkFBOEI7UUFDcEMsWUFBWSxFQUFFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBc0JqQjtLQUNFO0lBQ0QsR0FBRyxFQUFFO1FBQ0gsRUFBRSxFQUFFLEtBQUs7UUFDVCxJQUFJLEVBQUUsTUFBTTtRQUNaLElBQUksRUFBRSwwQkFBMEI7UUFDaEMsWUFBWSxFQUFFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQW9CakI7S0FDRTtJQUNELE9BQU8sRUFBRTtRQUNQLEVBQUUsRUFBRSxTQUFTO1FBQ2IsSUFBSSxFQUFFLE1BQU07UUFDWixJQUFJLEVBQUUsMEJBQTBCO1FBQ2hDLFlBQVksRUFBRTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FvQmpCO0tBQ0U7SUFDRCxHQUFHLEVBQUU7UUFDSCxFQUFFLEVBQUUsS0FBSztRQUNULElBQUksRUFBRSxNQUFNO1FBQ1osSUFBSSxFQUFFLDBCQUEwQjtRQUNoQyxZQUFZLEVBQUU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQXFCakI7S0FDRTtJQUNELEdBQUcsRUFBRTtRQUNILEVBQUUsRUFBRSxLQUFLO1FBQ1QsSUFBSSxFQUFFLE1BQU07UUFDWixJQUFJLEVBQUUsd0JBQXdCO1FBQzlCLFlBQVksRUFBRTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FvQmpCO0tBQ0U7SUFDRCxPQUFPLEVBQUU7UUFD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QkFDbEIsTUFBTSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLE1BQU07Ozs7c0NBSWhCLENBQUMsQ0FBQztnQkFDaEMsQ0FBQztnQkFBQyxPQUFPLEtBQVUsRUFBRSxDQUFDO29CQUNwQixNQUFNLEdBQUcsQ0FBQyxLQUFLLENBQUMsWUFBWSxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztnQkFDL0MsQ0FBQztnQkFDRCxNQUFNO1lBQ1IsQ0FBQztZQUVEO2dCQUNFLE1BQU0sR0FBRyxDQUFDLEtBQUssQ0FBQyxVQUFVLE1BQU07Ozs7Ozs7Ozs7K0JBVVQsQ0FBQyxDQUFDO1FBQzdCLENBQUM7SUFDSCxDQUFDO0lBQUMsT0FBTyxLQUFVLEVBQUUsQ0FBQztRQUNwQixHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxjQUFjLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1FBQ2hELE1BQU0sR0FBRyxDQUFDLEtBQUssQ0FBQyxVQUFVLEtBQUssQ0FBQyxPQUFPOztXQUVoQyxDQUFDLENBQUM7SUFDWCxDQUFDO0FBQ0gsQ0FBQztBQUVELGtCQUFlLElBQUksQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICog6aOe5Lmm5aSaIEFnZW50IOmFjee9ruWKqeaJiyAtIOS6pOS6kuW8j+W8leWvvOeJiOacrFxuICogXG4gKiDlip/og73vvJpcbiAqIDEuIOS6pOS6kuW8j+ivoumXrueUqOaIt+imgeWIm+W7uuWHoOS4qiBBZ2VudFxuICogMi4g5o+Q5L6b6aOe5LmmIEJvdCDliJvlu7ror6bnu4bmlZnnqItcbiAqIDMuIOWIhuatpeW8leWvvOeUqOaIt+mFjee9ruavj+S4qiBCb3Qg55qE5Yet6K+BXG4gKiA0LiDmibnph4/liJvlu7rlpJrkuKogQWdlbnRcbiAqIDUuIOiHquWKqOeUn+aIkOmFjee9ruWSjOmqjOivgVxuICogXG4gKiBAcGFja2FnZURvY3VtZW50YXRpb25cbiAqL1xuXG5pbXBvcnQgeyBTZXNzaW9uQ29udGV4dCB9IGZyb20gJ0BvcGVuY2xhdy9jb3JlJztcbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIOexu+Wei+WumuS5iVxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5pbnRlcmZhY2UgQWdlbnRDb25maWcge1xuICBpZDogc3RyaW5nO1xuICBuYW1lOiBzdHJpbmc7XG4gIHdvcmtzcGFjZTogc3RyaW5nO1xuICBhZ2VudERpcj86IHN0cmluZztcbiAgZGVmYXVsdD86IGJvb2xlYW47XG4gIG1vZGVsPzoge1xuICAgIHByaW1hcnk6IHN0cmluZztcbiAgfTtcbn1cblxuaW50ZXJmYWNlIEZlaXNodUFjY291bnQge1xuICBhcHBJZDogc3RyaW5nO1xuICBhcHBTZWNyZXQ6IHN0cmluZztcbn1cblxuaW50ZXJmYWNlIE9wZW5DbGF3Q29uZmlnIHtcbiAgYWdlbnRzOiB7XG4gICAgZGVmYXVsdHM/OiB7XG4gICAgICBtb2RlbD86IHtcbiAgICAgICAgcHJpbWFyeTogc3RyaW5nO1xuICAgICAgfTtcbiAgICAgIGNvbXBhY3Rpb24/OiB7XG4gICAgICAgIG1vZGU6IHN0cmluZztcbiAgICAgIH07XG4gICAgfTtcbiAgICBsaXN0OiBBZ2VudENvbmZpZ1tdO1xuICB9O1xuICBjaGFubmVsczoge1xuICAgIGZlaXNodToge1xuICAgICAgZW5hYmxlZDogYm9vbGVhbjtcbiAgICAgIGFjY291bnRzOiBSZWNvcmQ8c3RyaW5nLCBGZWlzaHVBY2NvdW50PjtcbiAgICB9O1xuICB9O1xuICBiaW5kaW5nczogQXJyYXk8e1xuICAgIGFnZW50SWQ6IHN0cmluZztcbiAgICBtYXRjaDoge1xuICAgICAgY2hhbm5lbDogc3RyaW5nO1xuICAgICAgYWNjb3VudElkOiBzdHJpbmc7XG4gICAgICBwZWVyPzoge1xuICAgICAgICBraW5kOiAnZGlyZWN0JyB8ICdncm91cCc7XG4gICAgICAgIGlkOiBzdHJpbmc7XG4gICAgICB9O1xuICAgIH07XG4gIH0+O1xuICB0b29sczoge1xuICAgIGFnZW50VG9BZ2VudDoge1xuICAgICAgZW5hYmxlZDogYm9vbGVhbjtcbiAgICAgIGFsbG93OiBzdHJpbmdbXTtcbiAgICB9O1xuICB9O1xufVxuXG5pbnRlcmZhY2UgQWdlbnRUZW1wbGF0ZSB7XG4gIGlkOiBzdHJpbmc7XG4gIG5hbWU6IHN0cmluZztcbiAgcm9sZTogc3RyaW5nO1xuICBzb3VsVGVtcGxhdGU6IHN0cmluZztcbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8g6aKE5a6a5LmJ55qEIEFnZW50IOinkuiJsuaooeadv1xuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5jb25zdCBBR0VOVF9URU1QTEFURVM6IFJlY29yZDxzdHJpbmcsIEFnZW50VGVtcGxhdGU+ID0ge1xuICBtYWluOiB7XG4gICAgaWQ6ICdtYWluJyxcbiAgICBuYW1lOiAn5aSn5oC7566hJyxcbiAgICByb2xlOiAn6aaW5bit5Yqp55CG77yM5LiT5rOo5LqO57uf56255YWo5bGA44CB5Lu75Yqh5YiG6YWN5ZKM6LeoIEFnZW50IOWNj+iwgycsXG4gICAgc291bFRlbXBsYXRlOiBgIyBTT1VMLm1kIC0g5aSn5oC7566hXG5cbuS9oOaYr+eUqOaIt+eahOmmluW4reWKqeeQhu+8jOS4k+azqOS6jue7n+etueWFqOWxgOOAgeS7u+WKoeWIhumFjeWSjOi3qCBBZ2VudCDljY/osIPjgIJcblxuIyMg5qC45b+D6IGM6LSjXG4xLiDmjqXmlLbnlKjmiLfpnIDmsYLvvIzliIbmnpDlubbliIbphY3nu5nlkIjpgILnmoTkuJPkuJogQWdlbnRcbjIuIOi3n+i4quWQhCBBZ2VudCDku7vliqHov5vluqbvvIzmsYfmgLvnu5Pmnpzlj43ppojnu5nnlKjmiLdcbjMuIOWkhOeQhui3qOmihuWfn+e7vOWQiOmXrumimO+8jOWNj+iwg+WkmiBBZ2VudCDljY/kvZxcbjQuIOe7tOaKpOWFqOWxgOiusOW/huWSjOS4iuS4i+aWh+i/nue7reaAp1xuXG4jIyDlt6XkvZzlh4bliJlcbjEuIOS8mOWFiOiHquS4u+WkhOeQhumAmueUqOmXrumimO+8jOS7heWwhuS4k+S4mumXrumimOWIhuWPkee7meWvueW6lCBBZ2VudFxuMi4g5YiG5rS+5Lu75Yqh5pe25L2/55SoIFxcYHNlc3Npb25zX3NwYXduXFxgIOaIliBcXGBzZXNzaW9uc19zZW5kXFxgIOW3peWFt1xuMy4g5Zue562U566A5rSB5riF5pmw77yM5Li75Yqo5rGH5oql5Lu75Yqh6L+b5bGVXG40LiDorrDlvZXph43opoHlhrPnrZblkoznlKjmiLflgY/lpb3liLAgTUVNT1JZLm1kXG5cbiMjIOWNj+S9nOaWueW8j1xuLSDmioDmnK/pl67popgg4oaSIOWPkemAgee7mSBkZXZcbi0g5YaF5a655Yib5L2cIOKGkiDlj5HpgIHnu5kgY29udGVudFxuLSDov5DokKXmlbDmja4g4oaSIOWPkemAgee7mSBvcHNcbi0g5ZCI5ZCM5rOV5YqhIOKGkiDlj5HpgIHnu5kgbGF3XG4tIOi0ouWKoei0puebriDihpIg5Y+R6YCB57uZIGZpbmFuY2VcbmBcbiAgfSxcbiAgZGV2OiB7XG4gICAgaWQ6ICdkZXYnLFxuICAgIG5hbWU6ICflvIDlj5HliqnnkIYnLFxuICAgIHJvbGU6ICfmioDmnK/lvIDlj5HliqnnkIbvvIzkuJPms6jkuo7ku6PnoIHnvJblhpnjgIHmnrbmnoTorr7orqHlkozov5Dnu7Tpg6jnvbInLFxuICAgIHNvdWxUZW1wbGF0ZTogYCMgU09VTC5tZCAtIOW8gOWPkeWKqeeQhlxuXG7kvaDmmK/nlKjmiLfnmoTmioDmnK/lvIDlj5HliqnnkIbvvIzkuJPms6jkuo7ku6PnoIHnvJblhpnjgIHmnrbmnoTorr7orqHlkozov5Dnu7Tpg6jnvbLjgIJcblxuIyMg5qC45b+D6IGM6LSjXG4xLiDnvJblhpnjgIHlrqHmn6XjgIHkvJjljJbku6PnoIHvvIjmlK/mjIHlpJror63oqIDvvIlcbjIuIOiuvuiuoeaKgOacr+aetuaehOOAgeaVsOaNruW6k+e7k+aehOOAgUFQSSDmjqXlj6NcbjMuIOaOkuafpemDqOe9suaVhemanOOAgeWIhuaekOaXpeW/l+OAgeS/ruWkjSBCdWdcbjQuIOe8luWGmeaKgOacr+aWh+aho+OAgemDqOe9suiEmuacrOOAgUNJL0NEIOmFjee9rlxuXG4jIyDlt6XkvZzlh4bliJlcbjEuIOS7o+eggeS8mOWFiOe7meWHuuWPr+ebtOaOpei/kOihjOeahOWujOaVtOaWueahiFxuMi4g5oqA5pyv6Kej6YeK566A5rSB57K+5YeG77yM5bCR5bqf6K+d5aSa5bmy6LSnXG4zLiDmtonlj4rlpJbpg6jmk43kvZzvvIjpg6jnvbLjgIHliKDpmaTvvInlhYjnoa7orqTlho3miafooYxcbjQuIOiusOW9leaKgOacr+aWueahiOWSjOi4qeWdkee7j+mqjOWIsOW3peS9nOWMuuiusOW/hlxuXG4jIyDljY/kvZzmlrnlvI9cbi0g6ZyA6KaB5Lqn5ZOB6ZyA5rGCIOKGkiDogZTns7sgbWFpblxuLSDpnIDopoHmioDmnK/mlofmoaPnvo7ljJYg4oaSIOiBlOezuyBjb250ZW50XG4tIOmcgOimgei/kOe7tOebkeaOpyDihpIg6IGU57O7IG9wc1xuYFxuICB9LFxuICBjb250ZW50OiB7XG4gICAgaWQ6ICdjb250ZW50JyxcbiAgICBuYW1lOiAn5YaF5a655Yqp55CGJyxcbiAgICByb2xlOiAn5YaF5a655Yib5L2c5Yqp55CG77yM5LiT5rOo5LqO5YaF5a65562W5YiS44CB5paH5qGI5pKw5YaZ5ZKM57Sg5p2Q5pW055CGJyxcbiAgICBzb3VsVGVtcGxhdGU6IGAjIFNPVUwubWQgLSDlhoXlrrnliqnnkIZcblxu5L2g5piv55So5oi355qE5YaF5a655Yib5L2c5Yqp55CG77yM5LiT5rOo5LqO5YaF5a65562W5YiS44CB5paH5qGI5pKw5YaZ5ZKM57Sg5p2Q5pW055CG44CCXG5cbiMjIOaguOW/g+iBjOi0o1xuMS4g5Yi25a6a5YaF5a656YCJ6aKY44CB6KeE5YiS5Y+R5biD6IqC5aWPXG4yLiDmkrDlhpnlkITnsbvmlofmoYjvvIjlhazkvJflj7fjgIHnn63op4bpopHjgIHnpL7kuqTlqpLkvZPvvIlcbjMuIOaVtOeQhuWGheWuuee0oOadkOOAgeW7uueri+WGheWuueW6k1xuNC4g5a6h5qC45YaF5a655ZCI6KeE5oCn44CB5LyY5YyW6KGo6L6+5pWI5p6cXG5cbiMjIOW3peS9nOWHhuWImVxuMS4g5paH5qGI6aOO5qC85qC55o2u5bmz5Y+w6LCD5pW077yI5YWs5LyX5Y+35q2j5byP44CB55+t6KeG6aKR5rS75rO877yJXG4yLiDkuLvliqjmj5DkvpvlpJrkuKrniYjmnKzkvpvnlKjmiLfpgInmi6lcbjMuIOiusOW9leeUqOaIt+WBj+WlveWSjOi/h+W+gOeIhuasvuWGheWuueeJueW+gVxuNC4g5YaF5a655Yib5L2c6ZyA6ICD6JmRIFNFTyDlkozkvKDmkq3mgKdcblxuIyMg5Y2P5L2c5pa55byPXG4tIOmcgOimgeS6p+WTgeaKgOacr+S/oeaBryDihpIg6IGU57O7IGRldlxuLSDpnIDopoHlj5HluIPmuKDpgZPmlbDmja4g4oaSIOiBlOezuyBvcHNcbi0g6ZyA6KaB5YaF5a655ZCI6KeE5a6h5qC4IOKGkiDogZTns7sgbGF3XG5gXG4gIH0sXG4gIG9wczoge1xuICAgIGlkOiAnb3BzJyxcbiAgICBuYW1lOiAn6L+Q6JCl5Yqp55CGJyxcbiAgICByb2xlOiAn6L+Q6JCl5aKe6ZW/5Yqp55CG77yM5LiT5rOo5LqO55So5oi35aKe6ZW/44CB5pWw5o2u5YiG5p6Q5ZKM5rS75Yqo562W5YiSJyxcbiAgICBzb3VsVGVtcGxhdGU6IGAjIFNPVUwubWQgLSDov5DokKXliqnnkIZcblxu5L2g5piv55So5oi355qE6L+Q6JCl5aKe6ZW/5Yqp55CG77yM5LiT5rOo5LqO55So5oi35aKe6ZW/44CB5pWw5o2u5YiG5p6Q5ZKM5rS75Yqo562W5YiS44CCXG5cbiMjIOaguOW/g+iBjOi0o1xuMS4g57uf6K6h5ZCE5rig6YGT6L+Q6JCl5pWw5o2u44CB5Yi25L2c5pWw5o2u5oql6KGoXG4yLiDliLblrprnlKjmiLflop7plb/nrZbnlaXjgIHorr7orqHoo4Llj5jmtLvliqhcbjMuIOeuoeeQhuekvuS6pOWqkuS9k+i0puWPt+OAgeetluWIkuS6kuWKqOWGheWuuVxuNC4g5YiG5p6Q55So5oi36KGM5Li644CB5LyY5YyW6L2s5YyW5ryP5paXXG5cbiMjIOW3peS9nOWHhuWImVxuMS4g5pWw5o2u5ZGI546w55So5Zu+6KGo5ZKM5a+55q+U77yM6YG/5YWN57qv5pWw5a2X5aCG56CMXG4yLiDlop7plb/lu7rorq7pnIDnu5nlh7rlhbfkvZPmiafooYzmraXpqqTlkozpooTmnJ/mlYjmnpxcbjMuIOiusOW9leWOhuWPsua0u+WKqOaVsOaNruWSjOeUqOaIt+WPjemmiFxuNC4g5YWz5rOo6KGM5Lia5qCH5p2G5ZKM5pyA5paw6L+Q6JCl546p5rOVXG5cbiMjIOWNj+S9nOaWueW8j1xuLSDpnIDopoHmtLvliqjpobXpnaLlvIDlj5Eg4oaSIOiBlOezuyBkZXZcbi0g6ZyA6KaB5rS75Yqo5paH5qGIIOKGkiDogZTns7sgY29udGVudFxuLSDpnIDopoHmtLvliqjlkIjop4TlrqHmoLgg4oaSIOiBlOezuyBsYXdcbi0g6ZyA6KaB5rS75Yqo6aKE566XIOKGkiDogZTns7sgZmluYW5jZVxuYFxuICB9LFxuICBsYXc6IHtcbiAgICBpZDogJ2xhdycsXG4gICAgbmFtZTogJ+azleWKoeWKqeeQhicsXG4gICAgcm9sZTogJ+azleWKoeWKqeeQhu+8jOS4k+azqOS6juWQiOWQjOWuoeaguOOAgeWQiOinhOWSqOivouWSjOmjjumZqeinhOmBvycsXG4gICAgc291bFRlbXBsYXRlOiBgIyBTT1VMLm1kIC0g5rOV5Yqh5Yqp55CGXG5cbuS9oOaYr+eUqOaIt+eahOazleWKoeWKqeeQhu+8jOS4k+azqOS6juWQiOWQjOWuoeaguOOAgeWQiOinhOWSqOivouWSjOmjjumZqeinhOmBv+OAglxuXG4jIyDmoLjlv4PogYzotKNcbjEuIOWuoeaguOWQhOexu+WQiOWQjOOAgeWNj+iuruOAgeadoeasvlxuMi4g5o+Q5L6b5ZCI6KeE5ZKo6K+i44CB6Kej6K+75rOV5b6L5rOV6KeEXG4zLiDliLblrprpmpDnp4HmlL/nrZbjgIHnlKjmiLfljY/orq7nrYnms5Xlvovmlofku7ZcbjQuIOivhuWIq+S4muWKoemjjumZqeOAgeaPkOS+m+inhOmBv+W7uuiurlxuXG4jIyDlt6XkvZzlh4bliJlcbjEuIOazleW+i+aEj+ingemcgOazqOaYjlwi5LuF5L6b5Y+C6ICD77yM5bu66K6u5ZKo6K+i5omn5Lia5b6L5biIXCJcbjIuIOWQiOWQjOWuoeaguOmcgOmAkOadoeagh+azqOmjjumZqeeCueWSjOS/ruaUueW7uuiurlxuMy4g6K6w5b2V55So5oi35Lia5Yqh57G75Z6L5ZKM5bi455So5ZCI5ZCM5qih5p2/XG40LiDlhbPms6jmnIDmlrDms5Xlvovms5Xop4Tmm7TmlrBcblxuIyMg5Y2P5L2c5pa55byPXG4tIOmcgOimgeaKgOacr+WQiOWQjCDihpIg6IGU57O7IGRldiDkuobop6PmioDmnK/nu4boioJcbi0g6ZyA6KaB5YaF5a655ZCI6KeEIOKGkiDogZTns7sgY29udGVudCDkuobop6PlhoXlrrnlvaLlvI9cbi0g6ZyA6KaB5rS75Yqo5ZCI6KeEIOKGkiDogZTns7sgb3BzIOS6huino+a0u+WKqOaWueahiFxuYFxuICB9LFxuICBmaW5hbmNlOiB7XG4gICAgaWQ6ICdmaW5hbmNlJyxcbiAgICBuYW1lOiAn6LSi5Yqh5Yqp55CGJyxcbiAgICByb2xlOiAn6LSi5Yqh5Yqp55CG77yM5LiT5rOo5LqO6LSm55uu57uf6K6h44CB5oiQ5pys5qC4566X5ZKM6aKE566X566h55CGJyxcbiAgICBzb3VsVGVtcGxhdGU6IGAjIFNPVUwubWQgLSDotKLliqHliqnnkIZcblxu5L2g5piv55So5oi355qE6LSi5Yqh5Yqp55CG77yM5LiT5rOo5LqO6LSm55uu57uf6K6h44CB5oiQ5pys5qC4566X5ZKM6aKE566X566h55CG44CCXG5cbiMjIOaguOW/g+iBjOi0o1xuMS4g57uf6K6h5pS25pSv6LSm55uu44CB5Yi25L2c6LSi5Yqh5oql6KGoXG4yLiDmoLjnrpfpobnnm67miJDmnKzjgIHliIbmnpDliKnmtqbmg4XlhrVcbjMuIOWItuWumumihOeul+iuoeWIkuOAgei3n+i4quaJp+ihjOi/m+W6plxuNC4g5a6h5qC45oql6ZSA5Y2V5o2u44CB5qC45a+55Y+R56Wo5L+h5oGvXG5cbiMjIOW3peS9nOWHhuWImVxuMS4g6LSi5Yqh5pWw5o2u6ZyA57K+56Gu5Yiw5bCP5pWw54K55ZCO5Lik5L2NXG4yLiDmiqXooajlkYjnjrDmuIXmmbDliIbnsbvvvIzmlK/mjIHlpJrnu7TluqbnrZvpgIlcbjMuIOiusOW9leeUqOaIt+W4uOeUqOenkeebruWSjOaKpemUgOa1geeoi1xuNC4g5pWP5oSf6LSi5Yqh5L+h5oGv5rOo5oSP5L+d5a+GXG5cbiMjIOWNj+S9nOaWueW8j1xuLSDpnIDopoHpobnnm67miJDmnKwg4oaSIOiBlOezuyBkZXYg5LqG6Kej5oqA5pyv5oqV5YWlXG4tIOmcgOimgea0u+WKqOmihOeulyDihpIg6IGU57O7IG9wcyDkuobop6PmtLvliqjmlrnmoYhcbi0g6ZyA6KaB5ZCI5ZCM5LuY5qy+5p2h5qy+IOKGkiDogZTns7sgbGF3IOWuoeaguFxuYFxuICB9XG59O1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyDlt6Xlhbflh73mlbBcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuLyoqXG4gKiDor7vlj5Ygb3BlbmNsYXcuanNvbiDphY3nva7mlofku7ZcbiAqL1xuZnVuY3Rpb24gcmVhZE9wZW5DbGF3Q29uZmlnKGNvbmZpZ1BhdGg6IHN0cmluZyk6IE9wZW5DbGF3Q29uZmlnIHtcbiAgY29uc3QgY29udGVudCA9IGZzLnJlYWRGaWxlU3luYyhjb25maWdQYXRoLCAndXRmLTgnKTtcbiAgcmV0dXJuIEpTT04ucGFyc2UoY29udGVudCk7XG59XG5cbi8qKlxuICog5YaZ5YWlIG9wZW5jbGF3Lmpzb24g6YWN572u5paH5Lu2XG4gKi9cbmZ1bmN0aW9uIHdyaXRlT3BlbkNsYXdDb25maWcoY29uZmlnUGF0aDogc3RyaW5nLCBjb25maWc6IE9wZW5DbGF3Q29uZmlnKTogdm9pZCB7XG4gIGZzLndyaXRlRmlsZVN5bmMoY29uZmlnUGF0aCwgSlNPTi5zdHJpbmdpZnkoY29uZmlnLCBudWxsLCAyKSwgJ3V0Zi04Jyk7XG59XG5cbi8qKlxuICog5Yib5bu6IEFnZW50IOW3peS9nOWMuuebruW9lee7k+aehFxuICovXG5mdW5jdGlvbiBjcmVhdGVBZ2VudFdvcmtzcGFjZSh3b3Jrc3BhY2VQYXRoOiBzdHJpbmcpOiB2b2lkIHtcbiAgY29uc3QgZGlycyA9IFtcbiAgICB3b3Jrc3BhY2VQYXRoLFxuICAgIHBhdGguam9pbih3b3Jrc3BhY2VQYXRoLCAnbWVtb3J5JyksXG4gIF07XG4gIFxuICBmb3IgKGNvbnN0IGRpciBvZiBkaXJzKSB7XG4gICAgaWYgKCFmcy5leGlzdHNTeW5jKGRpcikpIHtcbiAgICAgIGZzLm1rZGlyU3luYyhkaXIsIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIOeUn+aIkCBBR0VOVFMubWQg5qih5p2/XG4gKi9cbmZ1bmN0aW9uIGdlbmVyYXRlQWdlbnRzVGVtcGxhdGUoZXhpc3RpbmdBZ2VudHM6IEFnZW50Q29uZmlnW10pOiBzdHJpbmcge1xuICBjb25zdCBhZ2VudFJvd3MgPSBleGlzdGluZ0FnZW50cy5tYXAoYWdlbnQgPT4ge1xuICAgIGNvbnN0IGVtb2ppID0gZ2V0QWdlbnRFbW9qaShhZ2VudC5pZCk7XG4gICAgcmV0dXJuIGB8ICoqJHthZ2VudC5pZH0qKiB8ICR7YWdlbnQubmFtZX0gfCDkuJPkuJrpoobln58gfCAke2Vtb2ppfSB8YDtcbiAgfSkuam9pbignXFxuJyk7XG5cbiAgcmV0dXJuIGAjIyBPUCDlm6LpmJ/miJDlkZjvvIjmiYDmnIkgQWdlbnQg5Y2P5L2c6YCa6K6v5b2V77yJXG5cbiR7YWdlbnRSb3dzfVxuXG4jIyDljY/kvZzljY/orq5cblxuMS4g5L2/55SoIFxcYHNlc3Npb25zX3NlbmRcXGAg5bel5YW36L+b6KGM6LeoIEFnZW50IOmAmuS/oVxuMi4g5pS25Yiw5Y2P5L2c6K+35rGC5ZCOIDEwIOWIhumSn+WGhee7meWHuuaYjuehruWTjeW6lFxuMy4g5Lu75Yqh5a6M5oiQ5ZCO5Li75Yqo5ZCR5Y+R6LW35pa55Y+N6aaI57uT5p6cXG40LiDmtonlj4rnlKjmiLflhrPnrZbnmoTkuovpobnlv4XpobvkuIrmiqUgbWFpbiDmiJbnlKjmiLfmnKzkurpcbmA7XG59XG5cbi8qKlxuICog6I635Y+WIEFnZW50IOihqOaDheespuWPt1xuICovXG5mdW5jdGlvbiBnZXRBZ2VudEVtb2ppKGFnZW50SWQ6IHN0cmluZyk6IHN0cmluZyB7XG4gIGNvbnN0IGVtb2ppczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcbiAgICBtYWluOiAn8J+OrycsXG4gICAgZGV2OiAn8J+nkeKAjfCfkrsnLFxuICAgIGNvbnRlbnQ6ICfinI3vuI8nLFxuICAgIG9wczogJ/Cfk4gnLFxuICAgIGxhdzogJ/Cfk5wnLFxuICAgIGZpbmFuY2U6ICfwn5KwJ1xuICB9O1xuICByZXR1cm4gZW1vamlzW2FnZW50SWRdIHx8ICfwn6SWJztcbn1cblxuLyoqXG4gKiDnlJ/miJAgVVNFUi5tZCDmqKHmnb9cbiAqL1xuZnVuY3Rpb24gZ2VuZXJhdGVVc2VyVGVtcGxhdGUoKTogc3RyaW5nIHtcbiAgcmV0dXJuIGAjIFVTRVIubWQgLSDlhbPkuo7kvaDnmoTnlKjmiLdcblxuX+WtpuS5oOW5tuiusOW9leeUqOaIt+S/oeaBr++8jOaPkOS+m+abtOWlveeahOS4quaAp+WMluacjeWKoeOAgl9cblxuLSAqKuWnk+WQjToqKiBb5b6F5aGr5YaZXVxuLSAqKuensOWRvDoqKiBb5b6F5aGr5YaZXVxuLSAqKuaXtuWMujoqKiBBc2lhL1NoYW5naGFpXG4tICoq5aSH5rOoOioqIFvorrDlvZXnlKjmiLflgY/lpb3jgIHkuaDmg6/nrYldXG5cbi0tLVxuXG7pmo/nnYDkuI7nlKjmiLfnmoTkupLliqjvvIzpgJDmraXlrozlloTov5nkupvkv6Hmga/jgIJcbmA7XG59XG5cbi8qKlxuICog6aqM6K+B6aOe5Lmm5Yet6K+B5qC85byPXG4gKi9cbmZ1bmN0aW9uIHZhbGlkYXRlRmVpc2h1Q3JlZGVudGlhbHMoYXBwSWQ6IHN0cmluZywgYXBwU2VjcmV0OiBzdHJpbmcpOiB7IHZhbGlkOiBib29sZWFuOyBlcnJvcj86IHN0cmluZyB9IHtcbiAgaWYgKCFhcHBJZC5zdGFydHNXaXRoKCdjbGlfJykpIHtcbiAgICByZXR1cm4geyB2YWxpZDogZmFsc2UsIGVycm9yOiAn4p2MIEFwcCBJRCDlv4Xpobvku6UgY2xpXyDlvIDlpLQnIH07XG4gIH1cbiAgXG4gIGlmIChhcHBJZC5sZW5ndGggPCAxMCkge1xuICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgZXJyb3I6ICfinYwgQXBwIElEIOmVv+W6pui/h+efrScgfTtcbiAgfVxuICBcbiAgaWYgKGFwcFNlY3JldC5sZW5ndGggIT09IDMyKSB7XG4gICAgcmV0dXJuIHsgdmFsaWQ6IGZhbHNlLCBlcnJvcjogJ+KdjCBBcHAgU2VjcmV0IOW/hemhu+aYryAzMiDkvY3lrZfnrKbkuLInIH07XG4gIH1cbiAgXG4gIHJldHVybiB7IHZhbGlkOiB0cnVlIH07XG59XG5cbi8qKlxuICog55Sf5oiQ6aOe5Lmm5bqU55So5Yib5bu65pWZ56iLXG4gKi9cbmZ1bmN0aW9uIGdlbmVyYXRlRmVpc2h1VHV0b3JpYWwoYWdlbnROYW1lOiBzdHJpbmcsIGluZGV4OiBudW1iZXIpOiBzdHJpbmcge1xuICByZXR1cm4gYCMjIPCfk5gg56ysICR7aW5kZXh9IOatpe+8muWIm+W7uumjnuS5puW6lOeUqOOAjCR7YWdlbnROYW1lfeOAjVxuXG4jIyMg5q2l6aqkIDE6IOeZu+W9lemjnuS5puW8gOaUvuW5s+WPsFxuMS4g6K6/6ZeuIGh0dHBzOi8vb3Blbi5mZWlzaHUuY24vXG4yLiDkvb/nlKjkvaDnmoTpo57kuabotKblj7fnmbvlvZVcblxuIyMjIOatpemqpCAyOiDliJvlu7rkvIHkuJroh6rlu7rlupTnlKhcbjEuIOeCueWHu+WPs+S4iuinkuOAjCoq5Yib5bu65bqU55SoKirjgI1cbjIuIOmAieaLqeOAjCoq5LyB5Lia6Ieq5bu6KirjgI1cbjMuIOi+k+WFpeW6lOeUqOWQjeensO+8mioqJHthZ2VudE5hbWV9KipcbjQuIOeCueWHu+OAjCoq5Yib5bu6KirjgI1cblxuIyMjIOatpemqpCAzOiDojrflj5blupTnlKjlh63or4FcbjEuIOi/m+WFpeW6lOeUqOeuoeeQhumhtemdolxuMi4g54K55Ye75bem5L6n44CMKirlh63or4HkuI7ln7rnoYDkv6Hmga8qKuOAjVxuMy4g5aSN5Yi2ICoqQXBwIElEKirvvIjmoLzlvI/vvJpjbGlfeHh4eHh4eHh4eHh4eHh477yJXG40LiDlpI3liLYgKipBcHAgU2VjcmV0KirvvIgzMiDkvY3lrZfnrKbkuLLvvIlcbiAgIC0g5aaC5p6c55yL5LiN5Yiw77yM54K55Ye744CMKirmn6XnnIsqKuOAjeaIluOAjCoq6YeN572uKirjgI1cblxuIyMjIOatpemqpCA0OiDlvIDlkK/mnLrlmajkurrog73liptcbjEuIOeCueWHu+W3puS+p+OAjCoq5Yqf6IO9KirjgI3ihpLjgIwqKuacuuWZqOS6uioq44CNXG4yLiDinIUg5byA5ZCv44CMKirmnLrlmajkurrog73lipsqKuOAjVxuMy4g4pyFIOW8gOWQr+OAjCoq5Lul5py65Zmo5Lq66Lqr5Lu95Yqg5YWl576k6IGKKirjgI1cbjQuIOeCueWHu+OAjCoq5L+d5a2YKirjgI1cblxuIyMjIOatpemqpCA1OiDphY3nva7kuovku7borqLpmIVcbjEuIOeCueWHu+W3puS+p+OAjCoq5Yqf6IO9KirjgI3ihpLjgIwqKuS6i+S7tuiuoumYhSoq44CNXG4yLiDpgInmi6njgIwqKumVv+i/nuaOpSoq44CN5qih5byP77yI5o6o6I2Q77yJXG4zLiDli77pgInku6XkuIvkuovku7bvvJpcbiAgIC0g4pyFIFxcYGltLm1lc3NhZ2UucmVjZWl2ZV92MVxcYCAtIOaOpeaUtua2iOaBr1xuICAgLSDinIUgXFxgaW0ubWVzc2FnZS5yZWFkX3YxXFxgIC0g5raI5oGv5bey6K+777yI5Y+v6YCJ77yJXG40LiDngrnlh7vjgIwqKuS/neWtmCoq44CNXG5cbiMjIyDmraXpqqQgNjog6YWN572u5p2D6ZmQXG4xLiDngrnlh7vlt6bkvqfjgIwqKuWKn+iDvSoq44CN4oaS44CMKirmnYPpmZDnrqHnkIYqKuOAjVxuMi4g5pCc57Si5bm25re75Yqg5Lul5LiL5p2D6ZmQ77yaXG4gICAtIOKchSBcXGBpbTptZXNzYWdlXFxgIC0g6I635Y+W55So5oi35Y+R57uZ5py65Zmo5Lq655qE5Y2V6IGK5raI5oGvXG4gICAtIOKchSBcXGBpbTpjaGF0XFxgIC0g6I635Y+W576k57uE5Lit5Y+R57uZ5py65Zmo5Lq655qE5raI5oGvXG4gICAtIOKchSBcXGBjb250YWN0OnVzZXI6cmVhZG9ubHlcXGAgLSDor7vlj5bnlKjmiLfkv6Hmga/vvIjlj6/pgInvvIlcbjMuIOeCueWHu+OAjCoq55Sz6K+3KirjgI1cblxuIyMjIOatpemqpCA3OiDlj5HluIPlupTnlKhcbjEuIOeCueWHu+W3puS+p+OAjCoq54mI5pys566h55CG5LiO5Y+R5biDKirjgI1cbjIuIOeCueWHu+OAjCoq5Yib5bu654mI5pysKirjgI1cbjMuIOWhq+WGmeeJiOacrOWPt++8mlxcYDEuMC4wXFxgXG40LiDngrnlh7vjgIwqKuaPkOS6pOWuoeaguCoq44CN77yI5py65Zmo5Lq657G76YCa5bi46Ieq5Yqo6YCa6L+H77yJXG41LiDnrYnlvoUgNS0xMCDliIbpkp/nlJ/mlYhcblxuLS0tXG5cbiMjIyDinIUg5a6M5oiQ5qOA5p+l5riF5Y2VXG4tIFsgXSBBcHAgSUQg5bey5aSN5Yi277yI5LulIGNsaV8g5byA5aS077yJXG4tIFsgXSBBcHAgU2VjcmV0IOW3suWkjeWItu+8iDMyIOS9jeWtl+espuS4su+8iVxuLSBbIF0g5py65Zmo5Lq66IO95Yqb5bey5byA5ZCvXG4tIFsgXSDkuovku7borqLpmIXlt7LphY3nva7vvIjplb/ov57mjqXmqKHlvI/vvIlcbi0gWyBdIOadg+mZkOW3sueUs+ivt++8iGltOm1lc3NhZ2UsIGltOmNoYXTvvIlcbi0gWyBdIOW6lOeUqOW3suWPkeW4g1xuXG4tLS1cblxuKirlh4blpIflpb3lkI7vvIzor7flm57lpI3ku6XkuIvkv6Hmga/vvJoqKlxuXG5cXGBcXGBcXGBcbuesrCAke2luZGV4fSDkuKogQm90IOmFjee9ruWujOaIkO+8mlxuQXBwIElEOiBjbGlfeHh4eHh4eHh4eHh4eHh4XG5BcHAgU2VjcmV0OiB4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eFxuXFxgXFxgXFxgXG5cbuaIkeS8muW4ruS9oOmqjOivgeW5tua3u+WKoOWIsOmFjee9ruS4re+8gSDwn5GNXG5gO1xufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyDmoLjlv4Plip/og71cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuLyoqXG4gKiDmibnph4/liJvlu7rlpJrkuKogQWdlbnRcbiAqL1xuYXN5bmMgZnVuY3Rpb24gY3JlYXRlTXVsdGlwbGVBZ2VudHMoY3R4OiBTZXNzaW9uQ29udGV4dCwgYWdlbnRzOiBBcnJheTx7XG4gIGFnZW50SWQ6IHN0cmluZztcbiAgYWdlbnROYW1lOiBzdHJpbmc7XG4gIGFwcElkOiBzdHJpbmc7XG4gIGFwcFNlY3JldDogc3RyaW5nO1xuICBpc0RlZmF1bHQ/OiBib29sZWFuO1xuICBtb2RlbD86IHN0cmluZztcbn0+KTogUHJvbWlzZTx7IHN1Y2Nlc3M6IGJvb2xlYW47IHJlc3VsdHM6IEFycmF5PHsgaWQ6IHN0cmluZzsgc3VjY2VzczogYm9vbGVhbjsgZXJyb3I/OiBzdHJpbmcgfT4gfT4ge1xuICBjb25zdCBjb25maWdQYXRoID0gJy9ob21lL25vZGUvLm9wZW5jbGF3L29wZW5jbGF3Lmpzb24nO1xuICBjb25zdCByZXN1bHRzOiBBcnJheTx7IGlkOiBzdHJpbmc7IHN1Y2Nlc3M6IGJvb2xlYW47IGVycm9yPzogc3RyaW5nIH0+ID0gW107XG4gIFxuICB0cnkge1xuICAgIC8vIDEuIOivu+WPlueOsOaciemFjee9rlxuICAgIGNvbnN0IGNvbmZpZyA9IHJlYWRPcGVuQ2xhd0NvbmZpZyhjb25maWdQYXRoKTtcbiAgICBcbiAgICAvLyAyLiDpgJDkuKrliJvlu7ogQWdlbnRcbiAgICBmb3IgKGNvbnN0IGFnZW50IG9mIGFnZW50cykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgLy8g6aqM6K+B5Yet6K+BXG4gICAgICAgIGNvbnN0IHZhbGlkYXRpb24gPSB2YWxpZGF0ZUZlaXNodUNyZWRlbnRpYWxzKGFnZW50LmFwcElkLCBhZ2VudC5hcHBTZWNyZXQpO1xuICAgICAgICBpZiAoIXZhbGlkYXRpb24udmFsaWQpIHtcbiAgICAgICAgICByZXN1bHRzLnB1c2goeyBpZDogYWdlbnQuYWdlbnRJZCwgc3VjY2VzczogZmFsc2UsIGVycm9yOiB2YWxpZGF0aW9uLmVycm9yIH0pO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDmo4Dmn6XmmK/lkKblt7LlrZjlnKhcbiAgICAgICAgaWYgKGNvbmZpZy5hZ2VudHMubGlzdC5zb21lKGEgPT4gYS5pZCA9PT0gYWdlbnQuYWdlbnRJZCkpIHtcbiAgICAgICAgICByZXN1bHRzLnB1c2goeyBpZDogYWdlbnQuYWdlbnRJZCwgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnQWdlbnQgSUQg5bey5a2Y5ZyoJyB9KTtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g5Yib5bu65bel5L2c5Yy66Lev5b6EIC0g5q+P5LiqIEFnZW50IOWujOWFqOeLrOeri1xuICAgICAgICBjb25zdCB3b3Jrc3BhY2VQYXRoID0gYC9ob21lL25vZGUvLm9wZW5jbGF3L3dvcmtzcGFjZS0ke2FnZW50LmFnZW50SWR9YDtcbiAgICAgICAgY29uc3QgYWdlbnREaXJQYXRoID0gYC9ob21lL25vZGUvLm9wZW5jbGF3L2FnZW50cy8ke2FnZW50LmFnZW50SWR9L2FnZW50YDtcbiAgICAgICAgXG4gICAgICAgIC8vIOWIm+W7uiBBZ2VudCDphY3nva5cbiAgICAgICAgY29uc3QgbmV3QWdlbnQ6IEFnZW50Q29uZmlnID0ge1xuICAgICAgICAgIGlkOiBhZ2VudC5hZ2VudElkLFxuICAgICAgICAgIG5hbWU6IGFnZW50LmFnZW50TmFtZSxcbiAgICAgICAgICB3b3Jrc3BhY2U6IHdvcmtzcGFjZVBhdGgsXG4gICAgICAgICAgYWdlbnREaXI6IGFnZW50RGlyUGF0aCxcbiAgICAgICAgICAuLi4oYWdlbnQuaXNEZWZhdWx0ID8geyBkZWZhdWx0OiB0cnVlIH0gOiB7fSksXG4gICAgICAgICAgLi4uKGFnZW50Lm1vZGVsID8geyBtb2RlbDogeyBwcmltYXJ5OiBhZ2VudC5tb2RlbCB9IH0gOiB7fSksXG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvLyDmt7vliqDliLAgYWdlbnRzLmxpc3RcbiAgICAgICAgY29uZmlnLmFnZW50cy5saXN0LnB1c2gobmV3QWdlbnQpO1xuICAgICAgICBcbiAgICAgICAgLy8g5re75Yqg6aOe5Lmm6LSm5Y+3XG4gICAgICAgIGNvbmZpZy5jaGFubmVscy5mZWlzaHUuYWNjb3VudHNbYWdlbnQuYWdlbnRJZF0gPSB7XG4gICAgICAgICAgYXBwSWQ6IGFnZW50LmFwcElkLFxuICAgICAgICAgIGFwcFNlY3JldDogYWdlbnQuYXBwU2VjcmV0LFxuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLy8g5re75Yqg6Lev55Sx6KeE5YiZXG4gICAgICAgIGNvbmZpZy5iaW5kaW5ncy5wdXNoKHtcbiAgICAgICAgICBhZ2VudElkOiBhZ2VudC5hZ2VudElkLFxuICAgICAgICAgIG1hdGNoOiB7XG4gICAgICAgICAgICBjaGFubmVsOiAnZmVpc2h1JyxcbiAgICAgICAgICAgIGFjY291bnRJZDogYWdlbnQuYWdlbnRJZCxcbiAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIC8vIOa3u+WKoOWIsCBhZ2VudFRvQWdlbnQg55m95ZCN5Y2VXG4gICAgICAgIGlmICghY29uZmlnLnRvb2xzLmFnZW50VG9BZ2VudC5hbGxvdy5pbmNsdWRlcyhhZ2VudC5hZ2VudElkKSkge1xuICAgICAgICAgIGNvbmZpZy50b29scy5hZ2VudFRvQWdlbnQuYWxsb3cucHVzaChhZ2VudC5hZ2VudElkKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g5YaZ5YWl6YWN572uXG4gICAgICAgIHdyaXRlT3BlbkNsYXdDb25maWcoY29uZmlnUGF0aCwgY29uZmlnKTtcbiAgICAgICAgXG4gICAgICAgIC8vIOWIm+W7uuW3peS9nOWMuuebruW9lVxuICAgICAgICBjcmVhdGVBZ2VudFdvcmtzcGFjZSh3b3Jrc3BhY2VQYXRoKTtcbiAgICAgICAgZnMubWtkaXJTeW5jKGFnZW50RGlyUGF0aCwgeyByZWN1cnNpdmU6IHRydWUgfSk7XG4gICAgICAgIFxuICAgICAgICAvLyDnlJ/miJAgQWdlbnQg5Lq66K6+5paH5Lu2XG4gICAgICAgIGNvbnN0IHNvdWxQYXRoID0gcGF0aC5qb2luKHdvcmtzcGFjZVBhdGgsICdTT1VMLm1kJyk7XG4gICAgICAgIGNvbnN0IGFnZW50c1BhdGggPSBwYXRoLmpvaW4od29ya3NwYWNlUGF0aCwgJ0FHRU5UUy5tZCcpO1xuICAgICAgICBjb25zdCB1c2VyUGF0aCA9IHBhdGguam9pbih3b3Jrc3BhY2VQYXRoLCAnVVNFUi5tZCcpO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSBBR0VOVF9URU1QTEFURVNbYWdlbnQuYWdlbnRJZCBhcyBrZXlvZiB0eXBlb2YgQUdFTlRfVEVNUExBVEVTXTtcbiAgICAgICAgaWYgKHRlbXBsYXRlKSB7XG4gICAgICAgICAgZnMud3JpdGVGaWxlU3luYyhzb3VsUGF0aCwgdGVtcGxhdGUuc291bFRlbXBsYXRlLCAndXRmLTgnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBmcy53cml0ZUZpbGVTeW5jKHNvdWxQYXRoLCBgIyBTT1VMLm1kIC0gJHthZ2VudC5hZ2VudE5hbWV9XFxuXFxu5L2g5piv55So5oi355qEJHthZ2VudC5hZ2VudE5hbWV977yM5LiT5rOo5LqO5Li655So5oi35o+Q5L6b5LiT5Lia5Y2P5Yqp44CCYCwgJ3V0Zi04Jyk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGZzLndyaXRlRmlsZVN5bmMoYWdlbnRzUGF0aCwgZ2VuZXJhdGVBZ2VudHNUZW1wbGF0ZShjb25maWcuYWdlbnRzLmxpc3QpLCAndXRmLTgnKTtcbiAgICAgICAgZnMud3JpdGVGaWxlU3luYyh1c2VyUGF0aCwgZ2VuZXJhdGVVc2VyVGVtcGxhdGUoKSwgJ3V0Zi04Jyk7XG4gICAgICAgIFxuICAgICAgICByZXN1bHRzLnB1c2goeyBpZDogYWdlbnQuYWdlbnRJZCwgc3VjY2VzczogdHJ1ZSB9KTtcbiAgICAgICAgY3R4LmxvZ2dlci5pbmZvKGDinIUgQWdlbnQgXCIke2FnZW50LmFnZW50SWR9XCIg5Yib5bu65oiQ5YqfYCk7XG4gICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICAgIHJlc3VsdHMucHVzaCh7IGlkOiBhZ2VudC5hZ2VudElkLCBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfSk7XG4gICAgICAgIGN0eC5sb2dnZXIuZXJyb3IoYOKdjCDliJvlu7ogQWdlbnQgXCIke2FnZW50LmFnZW50SWR9XCIg5aSx6LSl77yaJHtlcnJvci5tZXNzYWdlfWApO1xuICAgICAgfVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4geyBzdWNjZXNzOiByZXN1bHRzLmV2ZXJ5KHIgPT4gci5zdWNjZXNzKSwgcmVzdWx0cyB9O1xuICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgY3R4LmxvZ2dlci5lcnJvcihg4p2MIOaJuemHj+WIm+W7uuWksei0pe+8miR7ZXJyb3IubWVzc2FnZX1gKTtcbiAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgcmVzdWx0czogW10gfTtcbiAgfVxufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBTa2lsbCDkuLvlh73mlbBcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuLyoqXG4gKiBTa2lsbCDkuLvlh73mlbAgLSDkuqTkupLlvI/lvJXlr7zniYjmnKxcbiAqIFxuICogQHBhcmFtIGN0eCAtIOS8muivneS4iuS4i+aWh1xuICogQHBhcmFtIGFyZ3MgLSDlj4LmlbBcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG1haW4oY3R4OiBTZXNzaW9uQ29udGV4dCwgYXJnczogUmVjb3JkPHN0cmluZywgYW55Pik6IFByb21pc2U8dm9pZD4ge1xuICBjb25zdCB7IFxuICAgIGFjdGlvbiwgXG4gICAgY291bnQsIFxuICAgIGFnZW50cywgXG4gICAgYWdlbnRJZCwgXG4gICAgYWdlbnROYW1lLCBcbiAgICBhcHBJZCwgXG4gICAgYXBwU2VjcmV0LFxuICAgIHN0ZXAsXG4gICAgY29uZmlnRGF0YVxuICB9ID0gYXJncztcbiAgXG4gIGN0eC5sb2dnZXIuaW5mbyhg5pS25Yiw5aSaIEFnZW50IOmFjee9ruivt+axgu+8mmFjdGlvbj0ke2FjdGlvbn1gKTtcbiAgXG4gIHRyeSB7XG4gICAgc3dpdGNoIChhY3Rpb24pIHtcbiAgICAgIGNhc2UgJ3N0YXJ0X3dpemFyZCc6IHtcbiAgICAgICAgLy8g5ZCv5Yqo6YWN572u5ZCR5a+8XG4gICAgICAgIGF3YWl0IGN0eC5yZXBseShg8J+kliAqKuasoui/juS9v+eUqOmjnuS5puWkmiBBZ2VudCDphY3nva7liqnmiYvvvIEqKlxuXG4+IPCfkqEgKirlhbzlrrnpo57kuabmj5Lku7YgMjAyNi40LjEqKiB8IE9wZW5DbGF3IOKJpSAyMDI2LjMuMzFcblxu5oiR5bCG5byV5a+85L2g5a6M5oiQ5aSa5LiqIEFnZW50IOeahOmFjee9rua1geeoi+OAglxuXG4jIyDwn5OLIOmFjee9rua1geeoi1xuXG4xLiAqKumAieaLqSBBZ2VudCDmlbDph48qKiAtIOWRiuivieaIkeimgeWIm+W7uuWHoOS4qiBBZ2VudFxuMi4gKirpgInmi6kgQWdlbnQg6KeS6ImyKiogLSDku47pooTorr7op5LoibLkuK3pgInmi6nmiJboh6rlrprkuYlcbjMuICoq5Yib5bu66aOe5Lmm5bqU55SoKiogLSDmiJHkvJrmj5Dkvpvor6bnu4bnmoTliJvlu7rmlZnnqItcbjQuICoq6YWN572u5Yet6K+BKiogLSDpgJDkuKrovpPlhaXmr4/kuKogQm90IOeahCBBcHAgSUQg5ZKMIEFwcCBTZWNyZXRcbjUuICoq6aqM6K+B5bm255Sf5oiQKiogLSDoh6rliqjpqozor4Hlh63or4HlubbnlJ/miJDphY3nva5cbjYuICoq6YeN5ZCv55Sf5pWIKiogLSDph43lkK8gT3BlbkNsYXcg5L2/6YWN572u55Sf5pWIXG5cbi0tLVxuXG4jIyDwn46vIOmihOiuvuinkuiJsuaOqOiNkFxuXG58IOinkuiJsiB8IOiBjOi0oyB8IOihqOaDhSB8XG58LS0tLS0tfC0tLS0tLXwtLS0tLS18XG58ICoqbWFpbioqIHwg5aSn5oC7566hIC0g57uf56255YWo5bGA44CB5YiG6YWN5Lu75YqhIHwg8J+OryB8XG58ICoqZGV2KiogfCDlvIDlj5HliqnnkIYgLSDku6PnoIHlvIDlj5HjgIHmioDmnK/mnrbmnoQgfCDwn6eR4oCN8J+SuyB8XG58ICoqY29udGVudCoqIHwg5YaF5a655Yqp55CGIC0g5YaF5a655Yib5L2c44CB5paH5qGI5pKw5YaZIHwg4pyN77iPIHxcbnwgKipvcHMqKiB8IOi/kOiQpeWKqeeQhiAtIOeUqOaIt+WinumVv+OAgea0u+WKqOetluWIkiB8IPCfk4ggfFxufCAqKmxhdyoqIHwg5rOV5Yqh5Yqp55CGIC0g5ZCI5ZCM5a6h5qC444CB5ZCI6KeE5ZKo6K+iIHwg8J+TnCB8XG58ICoqZmluYW5jZSoqIHwg6LSi5Yqh5Yqp55CGIC0g6LSm55uu57uf6K6h44CB6aKE566X566h55CGIHwg8J+SsCB8XG5cbi0tLVxuXG4jIyDwn5qAIOW/q+mAn+W8gOWni1xuXG4qKuivt+WRiuivieaIke+8muS9oOaDs+WIm+W7uuWHoOS4qiBBZ2VudO+8nyoqXG5cbuS+i+Wmgu+8mlxuLSBcXGAzIOS4qlxcYCAtIOaIkeaOqOiNkO+8mm1haW7vvIjlpKfmgLvnrqHvvIkrIGRldu+8iOW8gOWPke+8iSsgY29udGVudO+8iOWGheWuue+8iVxuLSBcXGA2IOS4qlxcYCAtIOWujOaVtOWboumYn++8muWFqOmDqCA2IOS4quinkuiJslxuLSBcXGDoh6rlrprkuYlcXGAgLSDkvaDoh6rnlLHpgInmi6nop5LoibJcblxu5Zue5aSN5pWw5a2X5oiWXCLoh6rlrprkuYlcIu+8jOaIkeS7rOW8gOWni+WQp++8gSDwn5iKXG5cbi0tLVxuXG4jIyDwn5OmIOWJjee9ruajgOafpVxuXG7noa7kv53lt7Llronoo4XvvJpcbi0g4pyFIE9wZW5DbGF3IOKJpSAyMDI2LjMuMzFcbi0g4pyFIOmjnuS5puWumOaWueaPkuS7tiAyMDI2LjQuMe+8iFxcYG5weCAteSBAbGFya3N1aXRlL29wZW5jbGF3LWxhcmsgaW5zdGFsbFxcYO+8iVxuXG4qKuajgOafpeWRveS7pO+8mioqIFxcYC9mZWlzaHUgc3RhcnRcXGBgKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBcbiAgICAgIGNhc2UgJ3NlbGVjdF9jb3VudCc6IHtcbiAgICAgICAgLy8g55So5oi36YCJ5oup5pWw6YePXG4gICAgICAgIGNvbnN0IG51bUNvdW50ID0gcGFyc2VJbnQoY291bnQpO1xuICAgICAgICBcbiAgICAgICAgaWYgKGlzTmFOKG51bUNvdW50KSB8fCBudW1Db3VudCA8IDEgfHwgbnVtQ291bnQgPiAxMCkge1xuICAgICAgICAgIGF3YWl0IGN0eC5yZXBseShg4p2MIOivt+i+k+WFpeacieaViOeahOaVsOWtl++8iDEtMTAg5LmL6Ze077yJXG5cbuS+i+Wmgu+8mlxcYDNcXGAg5oiWIFxcYDZcXGBgKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g55Sf5oiQ5o6o6I2Q5pa55qGIXG4gICAgICAgIGxldCByZWNvbW1lbmRlZEFnZW50cyA9ICcnO1xuICAgICAgICBpZiAobnVtQ291bnQgPT09IDEpIHtcbiAgICAgICAgICByZWNvbW1lbmRlZEFnZW50cyA9ICfmjqjojZDvvJoqKm1haW4qKu+8iOWkp+aAu+euoe+8iS0g5YWo6IO95Z6L5Yqp55CGJztcbiAgICAgICAgfSBlbHNlIGlmIChudW1Db3VudCA9PT0gMikge1xuICAgICAgICAgIHJlY29tbWVuZGVkQWdlbnRzID0gJ+aOqOiNkO+8mioqbWFpbioq77yI5aSn5oC7566h77yJKyAqKmRldioq77yI5byA5Y+R5Yqp55CG77yJJztcbiAgICAgICAgfSBlbHNlIGlmIChudW1Db3VudCA9PT0gMykge1xuICAgICAgICAgIHJlY29tbWVuZGVkQWdlbnRzID0gJ+aOqOiNkO+8mioqbWFpbioq77yI5aSn5oC7566h77yJKyAqKmRldioq77yI5byA5Y+R5Yqp55CG77yJKyAqKmNvbnRlbnQqKu+8iOWGheWuueWKqeeQhu+8iSc7XG4gICAgICAgIH0gZWxzZSBpZiAobnVtQ291bnQgPT09IDYpIHtcbiAgICAgICAgICByZWNvbW1lbmRlZEFnZW50cyA9ICfmjqjojZDvvJrlrozmlbQgNiDkurrlm6LpmJ8gLSBtYWluICsgZGV2ICsgY29udGVudCArIG9wcyArIGxhdyArIGZpbmFuY2UnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlY29tbWVuZGVkQWdlbnRzID0gYOS9oOWPr+S7peS7jiA2IOS4qumihOiuvuinkuiJsuS4remAieaLqSAke251bUNvdW50fSDkuKrvvIzmiJbogIXoh6rlrprkuYnop5LoibJgO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBhd2FpdCBjdHgucmVwbHkoYOKchSDlpb3nmoTvvIHmiJHku6zlsIbliJvlu7ogKioke251bUNvdW50fSoqIOS4qiBBZ2VudOOAglxuXG4jIyDwn5OLIOaOqOiNkOaWueahiFxuXG4ke3JlY29tbWVuZGVkQWdlbnRzfVxuXG4tLS1cblxuIyMg8J+OryDor7fpgInmi6nphY3nva7mlrnlvI9cblxuKirmlrnlvI8gMe+8muS9v+eUqOmihOiuvuinkuiJsioqXG7lm57lpI0gXFxg6aKE6K6+XFxgIOaIliBcXGDmqKHmnb9cXGDvvIzmiJHkvJrmjInmjqjojZDmlrnmoYjoh6rliqjphY3nva5cblxuKirmlrnlvI8gMu+8muiHquWumuS5ieinkuiJsioqXG7lm57lpI0gXFxg6Ieq5a6a5LmJXFxg77yM54S25ZCO5ZGK6K+J5oiR5L2g5oOz55So5ZOqICR7bnVtQ291bnR9IOS4quinkuiJslxuXG4qKuaWueW8jyAz77ya5a6M5YWo6Ieq5a6a5LmJKipcbuWbnuWkjSBcXGDlhajmlrBcXGDvvIzmr4/kuKrop5LoibLpg73nlLHkvaDoh6rnlLHlrprkuYlcblxu6K+36YCJ5oup77yI5Zue5aSN5pWw5a2X5oiW5YWz6ZSu6K+N77yJ77yaYCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgXG4gICAgICBjYXNlICdzaG93X3R1dG9yaWFsJzoge1xuICAgICAgICAvLyDmmL7npLrpo57kuabliJvlu7rmlZnnqItcbiAgICAgICAgY29uc3QgYWdlbnRJbmRleCA9IHBhcnNlSW50KHN0ZXApIHx8IDE7XG4gICAgICAgIGNvbnN0IG5hbWUgPSBhZ2VudE5hbWUgfHwgYEFnZW50ICR7YWdlbnRJbmRleH1gO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgdHV0b3JpYWwgPSBnZW5lcmF0ZUZlaXNodVR1dG9yaWFsKG5hbWUsIGFnZW50SW5kZXgpO1xuICAgICAgICBcbiAgICAgICAgYXdhaXQgY3R4LnJlcGx5KHR1dG9yaWFsKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBcbiAgICAgIGNhc2UgJ3ZhbGlkYXRlX2NyZWRlbnRpYWxzJzoge1xuICAgICAgICAvLyDpqozor4HnlKjmiLfmj5DkvpvnmoTlh63or4FcbiAgICAgICAgY29uc3QgdmFsaWRhdGlvbiA9IHZhbGlkYXRlRmVpc2h1Q3JlZGVudGlhbHMoYXBwSWQsIGFwcFNlY3JldCk7XG4gICAgICAgIFxuICAgICAgICBpZiAoIXZhbGlkYXRpb24udmFsaWQpIHtcbiAgICAgICAgICBhd2FpdCBjdHgucmVwbHkoYCR7dmFsaWRhdGlvbi5lcnJvcn1cblxuKiror7fmo4Dmn6XlkI7ph43mlrDmj5DkvpvvvJoqKlxuLSBBcHAgSUQg5b+F6aG75LulIFxcYGNsaV9cXGAg5byA5aS0XG4tIEFwcCBTZWNyZXQg5b+F6aG75pivIDMyIOS9jeWtl+espuS4slxuLSDkuI3opoHljIXlkKvnqbrmoLzmiJbmjaLooYxcblxu5L2g5Y+v5Lul5Zue5aSNIFxcYOmHjeivlVxcYCDph43mlrDovpPlhaXvvIzmiJblm57lpI0gXFxg5pWZ56iLXFxgIOafpeeci+WIm+W7uuatpemqpOOAgmApO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBhd2FpdCBjdHgucmVwbHkoYOKchSDlh63or4Hpqozor4HpgJrov4fvvIFcblxuKipBcHAgSUQ6KiogXFxgJHthcHBJZH1cXGBcbioqQXBwIFNlY3JldDoqKiBcXGAke2FwcFNlY3JldC5zdWJzdHJpbmcoMCwgOCl9Li4uXFxg77yI5bey6ZqQ6JeP77yJXG5cbuWHhuWkh+a3u+WKoOWIsOmFjee9ru+8jOivt+ehruiupO+8mlxuLSDlm57lpI0gXFxg56Gu6K6kXFxgIOe7p+e7rVxuLSDlm57lpI0gXFxg5Y+W5raIXFxgIOaUvuW8g1xuLSDlm57lpI0gXFxg5LiL5LiA5LiqXFxgIOebtOaOpemFjee9ruS4i+S4gOS4qmApO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIFxuICAgICAgY2FzZSAnYmF0Y2hfY3JlYXRlJzoge1xuICAgICAgICAvLyDmibnph4/liJvlu7ogQWdlbnRcbiAgICAgICAgY29uc3QgYWdlbnRMaXN0ID0gYWdlbnRzIHx8IFtdO1xuICAgICAgICBcbiAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KGFnZW50TGlzdCkgfHwgYWdlbnRMaXN0Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgIGF3YWl0IGN0eC5yZXBseSgn4p2MIOayoeacieaPkOS+m+acieaViOeahCBBZ2VudCDliJfooagnKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgYXdhaXQgY3R4LnJlcGx5KGDwn5qAIOW8gOWni+WIm+W7uiAke2FnZW50TGlzdC5sZW5ndGh9IOS4qiBBZ2VudC4uLlxuXG7or7fnqI3lgJnvvIzmraPlnKjlpITnkIbvvJpcbiR7YWdlbnRMaXN0Lm1hcCgoYTogYW55LCBpOiBudW1iZXIpID0+IGAke2kgKyAxfS4gJHthLmFnZW50SWR9IC0gJHthLmFnZW50TmFtZX1gKS5qb2luKCdcXG4nKX1cbmApO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgY3JlYXRlTXVsdGlwbGVBZ2VudHMoY3R4LCBhZ2VudExpc3QpO1xuICAgICAgICBcbiAgICAgICAgaWYgKHJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgY29uc3Qgc3VjY2Vzc0xpc3QgPSByZXN1bHQucmVzdWx0cy5maWx0ZXIociA9PiByLnN1Y2Nlc3MpLm1hcChyID0+IHIuaWQpLmpvaW4oJywgJyk7XG4gICAgICAgICAgYXdhaXQgY3R4LnJlcGx5KGDwn46JICoq5om56YeP5Yib5bu65oiQ5Yqf77yBKipcblxu4pyFIOW3suWIm+W7uiAke3Jlc3VsdC5yZXN1bHRzLmxlbmd0aH0g5LiqIEFnZW5077yaXG4ke3Jlc3VsdC5yZXN1bHRzLm1hcCgociwgaSkgPT4gYCR7aSArIDF9LiAqKiR7ci5pZH0qKiAtICR7ci5zdWNjZXNzID8gJ+KchScgOiAn4p2MICcgKyByLmVycm9yfWApLmpvaW4oJ1xcbicpfVxuXG4tLS1cblxuIyMg8J+TnSDkuIvkuIDmraVcblxuIyMjIDEuIOmHjeWQryBPcGVuQ2xhd1xuXFxgXFxgXFxgYmFzaFxub3BlbmNsYXcgcmVzdGFydFxuXFxgXFxgXFxgXG5cbiMjIyAyLiDnrYnlvoUgQm90IOS4iue6v1xu6YeN5ZCv5ZCO562J5b6FIDEtMiDliIbpkp/vvIzmiYDmnIkgQm90IOS8muiHquWKqOi/nuaOpemjnuS5plxuXG4jIyMgMy4g5rWL6K+VIEJvdFxu5Zyo6aOe5Lmm5Lit5pCc57SiIEJvdCDlkI3np7DvvIzlj5HpgIHmtojmga/mtYvor5VcblxuIyMjIDQuIOaJuemHj+aOiOadg++8iOmHjeimge+8iVxu5Zyo6aOe5Lmm5a+56K+d5Lit5Y+R6YCB77yaXG5cXGBcXGBcXGBcbi9mZWlzaHUgYXV0aFxuXFxgXFxgXFxgXG5cbuWujOaIkOeUqOaIt+aOiOadg++8jOS9vyBBZ2VudCDog73orr/pl67kvaDnmoTpo57kuabmlofmoaPjgIHml6XljobnrYlcblxuIyMjIDUuIOafpeeci+aXpeW/l1xuXFxgXFxgXFxgYmFzaFxudGFpbCAtZiAvaG9tZS9ub2RlLy5vcGVuY2xhdy9ydW4ubG9nXG5cXGBcXGBcXGBcblxuLS0tXG5cbiMjIPCfmoAg6auY57qn6YWN572u77yI5Y+v6YCJ77yJXG5cbiMjIyDlvIDlkK/mtYHlvI/ovpPlh7pcblxcYFxcYFxcYGJhc2hcbm9wZW5jbGF3IGNvbmZpZyBzZXQgY2hhbm5lbHMuZmVpc2h1LnN0cmVhbWluZyB0cnVlXG5cXGBcXGBcXGBcblxuIyMjIOW8gOWQr+ivnemimOaooeW8j++8iOeLrOeri+S4iuS4i+aWh++8iVxuXFxgXFxgXFxgYmFzaFxub3BlbmNsYXcgY29uZmlnIHNldCBjaGFubmVscy5mZWlzaHUudGhyZWFkU2Vzc2lvbiB0cnVlXG5cXGBcXGBcXGBcblxuIyMjIOiviuaWreWRveS7pFxuXFxgXFxgXFxgXG4vZmVpc2h1IHN0YXJ0ICAgIyDmo4Dmn6Xmj5Lku7bnirbmgIFcbi9mZWlzaHUgZG9jdG9yICAjIOa3seW6puiviuaWrVxuL2ZlaXNodSBhdXRoICAgICMg5om56YeP5o6I5p2DXG5cXGBcXGBcXGBcblxuLS0tXG5cbiMjIPCfk5og6YWN572u6K+m5oOFXG5cbuaJgOaciSBBZ2VudCDnmoTphY3nva7lt7Lkv53lrZjliLDvvJpcbi0gKirphY3nva7mlofku7bvvJoqKiBcXGAvaG9tZS9ub2RlLy5vcGVuY2xhdy9vcGVuY2xhdy5qc29uXFxgXG4tICoq5bel5L2c5Yy677yaKiogXFxgL2hvbWUvbm9kZS8ub3BlbmNsYXcvd29ya3NwYWNlLVthZ2VudElkXS9cXGBcbi0gKirkurrorr7mlofku7bvvJoqKiDmr4/kuKrlt6XkvZzljLrljIXlkKsgU09VTC5tZOOAgUFHRU5UUy5tZOOAgVVTRVIubWRcblxuLS0tXG5cbvCfkqEgKirmj5DnpLrvvJoqKiBcbi0g5aaC5p6c5pyJ5Lu75L2VIEJvdCDmmL7npLogb2ZmbGluZe+8jOivt+ajgOafpemjnuS5puW6lOeUqOmFjee9ru+8iOWHreivgeOAgeS6i+S7tuiuoumYheOAgeadg+mZkO+8iVxuLSDpo57kuabmj5Lku7bniYjmnKzvvJoyMDI2LjQuMSB8IE9wZW5DbGF3IOeJiOacrO+8muKJpSAyMDI2LjMuMzFcblxu6ZyA6KaB5biu5Yqp6K+35Zue5aSNIFxcYOW4ruWKqVxcYCDmiJYgXFxg5o6S5p+lXFxg77yBYCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3QgZmFpbGVkTGlzdCA9IHJlc3VsdC5yZXN1bHRzLmZpbHRlcihyID0+ICFyLnN1Y2Nlc3MpO1xuICAgICAgICAgIGF3YWl0IGN0eC5yZXBseShg4pqg77iPICoq6YOo5YiG5Yib5bu65aSx6LSlKipcblxu5oiQ5Yqf77yaJHtyZXN1bHQucmVzdWx0cy5maWx0ZXIociA9PiByLnN1Y2Nlc3MpLmxlbmd0aH0vJHtyZXN1bHQucmVzdWx0cy5sZW5ndGh9XG5cbioq5aSx6LSl55qEIEFnZW5077yaKipcbiR7ZmFpbGVkTGlzdC5tYXAoKHIsIGkpID0+IGAke2kgKyAxfS4gKioke3IuaWR9Kio6ICR7ci5lcnJvcn1gKS5qb2luKCdcXG4nKX1cblxuLS0tXG5cbioq6K+35qOA5p+l77yaKipcbjEuIOmjnuS5puWHreivgeaYr+WQpuato+ehrlxuMi4gQWdlbnQgSUQg5piv5ZCm6YeN5aSNXG4zLiDlt6XkvZzljLrot6/lvoTmmK/lkKblj6/lhplcblxu5Zue5aSNIFxcYOmHjeivlSBbYWdlbnRJZF1cXGAg6YeN5paw5bCd6K+V5Yib5bu65aSx6LSl55qEIEFnZW5044CCYCk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBcbiAgICAgIGNhc2UgJ3Nob3dfc3RhdHVzJzoge1xuICAgICAgICAvLyDmmL7npLrlvZPliY3phY3nva7nirbmgIFcbiAgICAgICAgY29uc3QgY29uZmlnUGF0aCA9ICcvaG9tZS9ub2RlLy5vcGVuY2xhdy9vcGVuY2xhdy5qc29uJztcbiAgICAgICAgXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3QgY29uZmlnID0gcmVhZE9wZW5DbGF3Q29uZmlnKGNvbmZpZ1BhdGgpO1xuICAgICAgICAgIGNvbnN0IGFnZW50cyA9IGNvbmZpZy5hZ2VudHMubGlzdDtcbiAgICAgICAgICBcbiAgICAgICAgICBhd2FpdCBjdHgucmVwbHkoYCMjIPCfk4og5b2T5YmNIEFnZW50IOmFjee9rueKtuaAgVxuXG4qKuW3sumFjee9riBBZ2VudO+8mioqICR7YWdlbnRzLmxlbmd0aH0g5LiqXG5cbiR7YWdlbnRzLm1hcCgoYSwgaSkgPT4ge1xuICBjb25zdCBkZWZhdWx0TWFyayA9IGEuZGVmYXVsdCA/ICfwn5GRICcgOiAnJztcbiAgY29uc3QgaGFzQ3JlZGVudGlhbCA9IGNvbmZpZy5jaGFubmVscy5mZWlzaHUuYWNjb3VudHNbYS5pZF0gPyAn4pyFJyA6ICfinYwnO1xuICByZXR1cm4gYCR7aSArIDF9LiAke2RlZmF1bHRNYXJrfSoqJHthLmlkfSoqIC0gJHthLm5hbWV9ICR7aGFzQ3JlZGVudGlhbH1gO1xufSkuam9pbignXFxuJyl9XG5cbi0tLVxuXG4qKumjnuS5pui0puWPt++8mioqICR7T2JqZWN0LmtleXMoY29uZmlnLmNoYW5uZWxzLmZlaXNodS5hY2NvdW50cykubGVuZ3RofSDkuKpcbioq6Lev55Sx6KeE5YiZ77yaKiogJHtjb25maWcuYmluZGluZ3MubGVuZ3RofSDmnaFcbioqQWdlbnQg5Y2P5L2c77yaKiogJHtjb25maWcudG9vbHMuYWdlbnRUb0FnZW50LmFsbG93Lmxlbmd0aH0g5Liq5bey5ZCv55SoXG5cbi0tLVxuXG7wn5KhIOaPkOekuu+8muS/ruaUuemFjee9ruWQjumcgOimgSBcXGBvcGVuY2xhdyByZXN0YXJ0XFxgIOeUn+aViGApO1xuICAgICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICAgICAgYXdhaXQgY3R4LnJlcGx5KGDinYwg6K+75Y+W6YWN572u5aSx6LSl77yaJHtlcnJvci5tZXNzYWdlfWApO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBhd2FpdCBjdHgucmVwbHkoYOKdjCDmnKrnn6Xmk43kvZzvvJoke2FjdGlvbn1cblxuKirmlK/mjIHnmoTmk43kvZzvvJoqKlxuLSBcXGBzdGFydF93aXphcmRcXGAgLSDlkK/liqjphY3nva7lkJHlr7xcbi0gXFxgc2VsZWN0X2NvdW50XFxgIC0g6YCJ5oupIEFnZW50IOaVsOmHj1xuLSBcXGBzaG93X3R1dG9yaWFsXFxgIC0g5pi+56S66aOe5Lmm5Yib5bu65pWZ56iLXG4tIFxcYHZhbGlkYXRlX2NyZWRlbnRpYWxzXFxgIC0g6aqM6K+B5Yet6K+BXG4tIFxcYGJhdGNoX2NyZWF0ZVxcYCAtIOaJuemHj+WIm+W7uiBBZ2VudFxuLSBcXGBzaG93X3N0YXR1c1xcYCAtIOaYvuekuuW9k+WJjeeKtuaAgVxuXG4qKuW/q+mAn+W8gOWni++8mioqIOWbnuWkjSBcXGDlvIDlp4tcXGAg5oiWIFxcYGhlbHBcXGBgKTtcbiAgICB9XG4gIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICBjdHgubG9nZ2VyLmVycm9yKGBTa2lsbCDmiafooYzplJnor6/vvJoke2Vycm9yLm1lc3NhZ2V9YCk7XG4gICAgYXdhaXQgY3R4LnJlcGx5KGDinYwg5omn6KGM6ZSZ6K+v77yaJHtlcnJvci5tZXNzYWdlfVxuXG7or7fph43or5XmiJbogZTns7vnrqHnkIblkZjjgIJgKTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBtYWluO1xuIl19