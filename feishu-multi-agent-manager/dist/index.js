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
    const config = JSON.parse(content);
    // 重要修复：确保 accounts 是对象格式，而不是数组
    // 如果检测到 accounts 是数组，转换为对象格式
    if (Array.isArray(config.channels?.feishu?.accounts)) {
        console.warn('⚠️ 检测到 accounts 使用了数组格式，这是不被支持的！正在转换为对象格式...');
        const accountsArray = config.channels.feishu.accounts;
        const accountsObject = {};
        // 尝试从数组中提取第一个账号（如果有 accountId 字段）
        if (accountsArray.length > 0 && accountsArray[0].accountId) {
            accountsArray.forEach((account) => {
                if (account.appId && account.appSecret) {
                    const accountId = account.accountId || account.appId.replace('cli_', '');
                    accountsObject[accountId] = {
                        appId: account.appId,
                        appSecret: account.appSecret
                    };
                }
            });
        }
        config.channels.feishu.accounts = accountsObject;
        console.log('✅ 已转换为对象格式：', Object.keys(accountsObject));
    }
    // 确保 accounts 字段存在且为对象
    if (!config.channels?.feishu?.accounts) {
        if (!config.channels)
            config.channels = { feishu: { enabled: true, accounts: {} } };
        if (!config.channels.feishu)
            config.channels.feishu = { enabled: true, accounts: {} };
        config.channels.feishu.accounts = {};
    }
    return config;
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

回复数字或"自定义"，我们开始吧！ 😊`);
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

### 4. 查看日志
\`\`\`bash
tail -f /home/node/.openclaw/run.log
\`\`\`

---

## 📚 配置详情

所有 Agent 的配置已保存到：
- **配置文件：** \`/home/node/.openclaw/openclaw.json\`
- **工作区：** \`/home/node/.openclaw/workspace/[agentId]/\`
- **人设文件：** 每个工作区包含 SOUL.md、AGENTS.md、USER.md

---

💡 **提示：** 如果有任何 Bot 显示 offline，请检查飞书应用配置是否正确（凭证、事件订阅、权限）。

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7Ozs7OztHQVdHOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQW1rQkgsb0JBc1JDO0FBdDFCRCx1Q0FBeUI7QUFDekIsMkNBQTZCO0FBb0U3QiwrRUFBK0U7QUFDL0Usa0JBQWtCO0FBQ2xCLCtFQUErRTtBQUUvRSxNQUFNLGVBQWUsR0FBa0M7SUFDckQsSUFBSSxFQUFFO1FBQ0osRUFBRSxFQUFFLE1BQU07UUFDVixJQUFJLEVBQUUsS0FBSztRQUNYLElBQUksRUFBRSw4QkFBOEI7UUFDcEMsWUFBWSxFQUFFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBc0JqQjtLQUNFO0lBQ0QsR0FBRyxFQUFFO1FBQ0gsRUFBRSxFQUFFLEtBQUs7UUFDVCxJQUFJLEVBQUUsTUFBTTtRQUNaLElBQUksRUFBRSwwQkFBMEI7UUFDaEMsWUFBWSxFQUFFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQW9CakI7S0FDRTtJQUNELE9BQU8sRUFBRTtRQUNQLEVBQUUsRUFBRSxTQUFTO1FBQ2IsSUFBSSxFQUFFLE1BQU07UUFDWixJQUFJLEVBQUUsMEJBQTBCO1FBQ2hDLFlBQVksRUFBRTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FvQmpCO0tBQ0U7SUFDRCxHQUFHLEVBQUU7UUFDSCxFQUFFLEVBQUUsS0FBSztRQUNULElBQUksRUFBRSxNQUFNO1FBQ1osSUFBSSxFQUFFLDBCQUEwQjtRQUNoQyxZQUFZLEVBQUU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQXFCakI7S0FDRTtJQUNELEdBQUcsRUFBRTtRQUNILEVBQUUsRUFBRSxLQUFLO1FBQ1QsSUFBSSxFQUFFLE1BQU07UUFDWixJQUFJLEVBQUUsd0JBQXdCO1FBQzlCLFlBQVksRUFBRTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FvQmpCO0tBQ0U7SUFDRCxPQUFPLEVBQUU7UUFD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RSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO3dCQUN4RSxPQUFPLEdBQUcsQ0FBQyxHQUFHLENBQUMsS0FBSyxXQUFXLEtBQUssQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUMsSUFBSSxJQUFJLGFBQWEsRUFBRSxDQUFDO29CQUM1RSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDOzs7O1lBSUQsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxNQUFNO1lBQ25ELE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTTtnQkFDbEIsTUFBTSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLE1BQU07Ozs7c0NBSWhCLENBQUMsQ0FBQztnQkFDaEMsQ0FBQztnQkFBQyxPQUFPLEtBQVUsRUFBRSxDQUFDO29CQUNwQixNQUFNLEdBQUcsQ0FBQyxLQUFLLENBQUMsWUFBWSxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztnQkFDL0MsQ0FBQztnQkFDRCxNQUFNO1lBQ1IsQ0FBQztZQUVEO2dCQUNFLE1BQU0sR0FBRyxDQUFDLEtBQUssQ0FBQyxVQUFVLE1BQU07Ozs7Ozs7Ozs7K0JBVVQsQ0FBQyxDQUFDO1FBQzdCLENBQUM7SUFDSCxDQUFDO0lBQUMsT0FBTyxLQUFVLEVBQUUsQ0FBQztRQUNwQixHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxjQUFjLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1FBQ2hELE1BQU0sR0FBRyxDQUFDLEtBQUssQ0FBQyxVQUFVLEtBQUssQ0FBQyxPQUFPOztXQUVoQyxDQUFDLENBQUM7SUFDWCxDQUFDO0FBQ0gsQ0FBQztBQUVELGtCQUFlLElBQUksQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICog6aOe5Lmm5aSaIEFnZW50IOmFjee9ruWKqeaJiyAtIOS6pOS6kuW8j+W8leWvvOeJiOacrFxuICogXG4gKiDlip/og73vvJpcbiAqIDEuIOS6pOS6kuW8j+ivoumXrueUqOaIt+imgeWIm+W7uuWHoOS4qiBBZ2VudFxuICogMi4g5o+Q5L6b6aOe5LmmIEJvdCDliJvlu7ror6bnu4bmlZnnqItcbiAqIDMuIOWIhuatpeW8leWvvOeUqOaIt+mFjee9ruavj+S4qiBCb3Qg55qE5Yet6K+BXG4gKiA0LiDmibnph4/liJvlu7rlpJrkuKogQWdlbnRcbiAqIDUuIOiHquWKqOeUn+aIkOmFjee9ruWSjOmqjOivgVxuICogXG4gKiBAcGFja2FnZURvY3VtZW50YXRpb25cbiAqL1xuXG5pbXBvcnQgeyBTZXNzaW9uQ29udGV4dCB9IGZyb20gJ0BvcGVuY2xhdy9jb3JlJztcbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIOexu+Wei+WumuS5iVxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5pbnRlcmZhY2UgQWdlbnRDb25maWcge1xuICBpZDogc3RyaW5nO1xuICBuYW1lOiBzdHJpbmc7XG4gIHdvcmtzcGFjZTogc3RyaW5nO1xuICBhZ2VudERpcj86IHN0cmluZztcbiAgZGVmYXVsdD86IGJvb2xlYW47XG4gIG1vZGVsPzoge1xuICAgIHByaW1hcnk6IHN0cmluZztcbiAgfTtcbn1cblxuaW50ZXJmYWNlIEZlaXNodUFjY291bnQge1xuICBhcHBJZDogc3RyaW5nO1xuICBhcHBTZWNyZXQ6IHN0cmluZztcbn1cblxuaW50ZXJmYWNlIE9wZW5DbGF3Q29uZmlnIHtcbiAgYWdlbnRzOiB7XG4gICAgZGVmYXVsdHM/OiB7XG4gICAgICBtb2RlbD86IHtcbiAgICAgICAgcHJpbWFyeTogc3RyaW5nO1xuICAgICAgfTtcbiAgICAgIGNvbXBhY3Rpb24/OiB7XG4gICAgICAgIG1vZGU6IHN0cmluZztcbiAgICAgIH07XG4gICAgfTtcbiAgICBsaXN0OiBBZ2VudENvbmZpZ1tdO1xuICB9O1xuICBjaGFubmVsczoge1xuICAgIGZlaXNodToge1xuICAgICAgZW5hYmxlZDogYm9vbGVhbjtcbiAgICAgIC8vIOmHjeimge+8mmFjY291bnRzIOW/hemhu+aYr+WvueixoeagvOW8j++8jGtleSDkuLogYWNjb3VudElk77yM5LiN6IO95piv5pWw57uEXG4gICAgICAvLyDmoLzlvI/vvJp7IFwiYWNjb3VudElkMVwiOiB7IGFwcElkLCBhcHBTZWNyZXQgfSwgXCJhY2NvdW50SWQyXCI6IHsgLi4uIH0gfVxuICAgICAgYWNjb3VudHM6IFJlY29yZDxzdHJpbmcsIEZlaXNodUFjY291bnQ+O1xuICAgIH07XG4gIH07XG4gIGJpbmRpbmdzOiBBcnJheTx7XG4gICAgYWdlbnRJZDogc3RyaW5nO1xuICAgIG1hdGNoOiB7XG4gICAgICBjaGFubmVsOiBzdHJpbmc7XG4gICAgICBhY2NvdW50SWQ6IHN0cmluZztcbiAgICAgIHBlZXI/OiB7XG4gICAgICAgIGtpbmQ6ICdkaXJlY3QnIHwgJ2dyb3VwJztcbiAgICAgICAgaWQ6IHN0cmluZztcbiAgICAgIH07XG4gICAgfTtcbiAgfT47XG4gIHRvb2xzOiB7XG4gICAgYWdlbnRUb0FnZW50OiB7XG4gICAgICBlbmFibGVkOiBib29sZWFuO1xuICAgICAgYWxsb3c6IHN0cmluZ1tdO1xuICAgIH07XG4gIH07XG59XG5cbmludGVyZmFjZSBBZ2VudFRlbXBsYXRlIHtcbiAgaWQ6IHN0cmluZztcbiAgbmFtZTogc3RyaW5nO1xuICByb2xlOiBzdHJpbmc7XG4gIHNvdWxUZW1wbGF0ZTogc3RyaW5nO1xufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyDpooTlrprkuYnnmoQgQWdlbnQg6KeS6Imy5qih5p2/XG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbmNvbnN0IEFHRU5UX1RFTVBMQVRFUzogUmVjb3JkPHN0cmluZywgQWdlbnRUZW1wbGF0ZT4gPSB7XG4gIG1haW46IHtcbiAgICBpZDogJ21haW4nLFxuICAgIG5hbWU6ICflpKfmgLvnrqEnLFxuICAgIHJvbGU6ICfpppbluK3liqnnkIbvvIzkuJPms6jkuo7nu5/nrbnlhajlsYDjgIHku7vliqHliIbphY3lkozot6ggQWdlbnQg5Y2P6LCDJyxcbiAgICBzb3VsVGVtcGxhdGU6IGAjIFNPVUwubWQgLSDlpKfmgLvnrqFcblxu5L2g5piv55So5oi355qE6aaW5bit5Yqp55CG77yM5LiT5rOo5LqO57uf56255YWo5bGA44CB5Lu75Yqh5YiG6YWN5ZKM6LeoIEFnZW50IOWNj+iwg+OAglxuXG4jIyDmoLjlv4PogYzotKNcbjEuIOaOpeaUtueUqOaIt+mcgOaxgu+8jOWIhuaekOW5tuWIhumFjee7meWQiOmAgueahOS4k+S4miBBZ2VudFxuMi4g6Lef6Liq5ZCEIEFnZW50IOS7u+WKoei/m+W6pu+8jOaxh+aAu+e7k+aenOWPjemmiOe7meeUqOaIt1xuMy4g5aSE55CG6Leo6aKG5Z+f57u85ZCI6Zeu6aKY77yM5Y2P6LCD5aSaIEFnZW50IOWNj+S9nFxuNC4g57u05oqk5YWo5bGA6K6w5b+G5ZKM5LiK5LiL5paH6L+e57ut5oCnXG5cbiMjIOW3peS9nOWHhuWImVxuMS4g5LyY5YWI6Ieq5Li75aSE55CG6YCa55So6Zeu6aKY77yM5LuF5bCG5LiT5Lia6Zeu6aKY5YiG5Y+R57uZ5a+55bqUIEFnZW50XG4yLiDliIbmtL7ku7vliqHml7bkvb/nlKggXFxgc2Vzc2lvbnNfc3Bhd25cXGAg5oiWIFxcYHNlc3Npb25zX3NlbmRcXGAg5bel5YW3XG4zLiDlm57nrZTnroDmtIHmuIXmmbDvvIzkuLvliqjmsYfmiqXku7vliqHov5vlsZVcbjQuIOiusOW9lemHjeimgeWGs+etluWSjOeUqOaIt+WBj+WlveWIsCBNRU1PUlkubWRcblxuIyMg5Y2P5L2c5pa55byPXG4tIOaKgOacr+mXrumimCDihpIg5Y+R6YCB57uZIGRldlxuLSDlhoXlrrnliJvkvZwg4oaSIOWPkemAgee7mSBjb250ZW50XG4tIOi/kOiQpeaVsOaNriDihpIg5Y+R6YCB57uZIG9wc1xuLSDlkIjlkIzms5XliqEg4oaSIOWPkemAgee7mSBsYXdcbi0g6LSi5Yqh6LSm55uuIOKGkiDlj5HpgIHnu5kgZmluYW5jZVxuYFxuICB9LFxuICBkZXY6IHtcbiAgICBpZDogJ2RldicsXG4gICAgbmFtZTogJ+W8gOWPkeWKqeeQhicsXG4gICAgcm9sZTogJ+aKgOacr+W8gOWPkeWKqeeQhu+8jOS4k+azqOS6juS7o+eggee8luWGmeOAgeaetuaehOiuvuiuoeWSjOi/kOe7tOmDqOe9sicsXG4gICAgc291bFRlbXBsYXRlOiBgIyBTT1VMLm1kIC0g5byA5Y+R5Yqp55CGXG5cbuS9oOaYr+eUqOaIt+eahOaKgOacr+W8gOWPkeWKqeeQhu+8jOS4k+azqOS6juS7o+eggee8luWGmeOAgeaetuaehOiuvuiuoeWSjOi/kOe7tOmDqOe9suOAglxuXG4jIyDmoLjlv4PogYzotKNcbjEuIOe8luWGmeOAgeWuoeafpeOAgeS8mOWMluS7o+egge+8iOaUr+aMgeWkmuivreiogO+8iVxuMi4g6K6+6K6h5oqA5pyv5p625p6E44CB5pWw5o2u5bqT57uT5p6E44CBQVBJIOaOpeWPo1xuMy4g5o6S5p+l6YOo572y5pWF6Zqc44CB5YiG5p6Q5pel5b+X44CB5L+u5aSNIEJ1Z1xuNC4g57yW5YaZ5oqA5pyv5paH5qGj44CB6YOo572y6ISa5pys44CBQ0kvQ0Qg6YWN572uXG5cbiMjIOW3peS9nOWHhuWImVxuMS4g5Luj56CB5LyY5YWI57uZ5Ye65Y+v55u05o6l6L+Q6KGM55qE5a6M5pW05pa55qGIXG4yLiDmioDmnK/op6Pph4rnroDmtIHnsr7lh4bvvIzlsJHlup/or53lpJrlubLotKdcbjMuIOa2ieWPiuWklumDqOaTjeS9nO+8iOmDqOe9suOAgeWIoOmZpO+8ieWFiOehruiupOWGjeaJp+ihjFxuNC4g6K6w5b2V5oqA5pyv5pa55qGI5ZKM6Lip5Z2R57uP6aqM5Yiw5bel5L2c5Yy66K6w5b+GXG5cbiMjIOWNj+S9nOaWueW8j1xuLSDpnIDopoHkuqflk4HpnIDmsYIg4oaSIOiBlOezuyBtYWluXG4tIOmcgOimgeaKgOacr+aWh+aho+e+juWMliDihpIg6IGU57O7IGNvbnRlbnRcbi0g6ZyA6KaB6L+Q57u055uR5o6nIOKGkiDogZTns7sgb3BzXG5gXG4gIH0sXG4gIGNvbnRlbnQ6IHtcbiAgICBpZDogJ2NvbnRlbnQnLFxuICAgIG5hbWU6ICflhoXlrrnliqnnkIYnLFxuICAgIHJvbGU6ICflhoXlrrnliJvkvZzliqnnkIbvvIzkuJPms6jkuo7lhoXlrrnnrZbliJLjgIHmlofmoYjmkrDlhpnlkozntKDmnZDmlbTnkIYnLFxuICAgIHNvdWxUZW1wbGF0ZTogYCMgU09VTC5tZCAtIOWGheWuueWKqeeQhlxuXG7kvaDmmK/nlKjmiLfnmoTlhoXlrrnliJvkvZzliqnnkIbvvIzkuJPms6jkuo7lhoXlrrnnrZbliJLjgIHmlofmoYjmkrDlhpnlkozntKDmnZDmlbTnkIbjgIJcblxuIyMg5qC45b+D6IGM6LSjXG4xLiDliLblrprlhoXlrrnpgInpopjjgIHop4TliJLlj5HluIPoioLlpY9cbjIuIOaSsOWGmeWQhOexu+aWh+ahiO+8iOWFrOS8l+WPt+OAgeefreinhumikeOAgeekvuS6pOWqkuS9k++8iVxuMy4g5pW055CG5YaF5a6557Sg5p2Q44CB5bu656uL5YaF5a655bqTXG40LiDlrqHmoLjlhoXlrrnlkIjop4TmgKfjgIHkvJjljJbooajovr7mlYjmnpxcblxuIyMg5bel5L2c5YeG5YiZXG4xLiDmlofmoYjpo47moLzmoLnmja7lubPlj7DosIPmlbTvvIjlhazkvJflj7fmraPlvI/jgIHnn63op4bpopHmtLvms7zvvIlcbjIuIOS4u+WKqOaPkOS+m+WkmuS4queJiOacrOS+m+eUqOaIt+mAieaLqVxuMy4g6K6w5b2V55So5oi35YGP5aW95ZKM6L+H5b6A54iG5qy+5YaF5a6554m55b6BXG40LiDlhoXlrrnliJvkvZzpnIDogIPomZEgU0VPIOWSjOS8oOaSreaAp1xuXG4jIyDljY/kvZzmlrnlvI9cbi0g6ZyA6KaB5Lqn5ZOB5oqA5pyv5L+h5oGvIOKGkiDogZTns7sgZGV2XG4tIOmcgOimgeWPkeW4g+a4oOmBk+aVsOaNriDihpIg6IGU57O7IG9wc1xuLSDpnIDopoHlhoXlrrnlkIjop4TlrqHmoLgg4oaSIOiBlOezuyBsYXdcbmBcbiAgfSxcbiAgb3BzOiB7XG4gICAgaWQ6ICdvcHMnLFxuICAgIG5hbWU6ICfov5DokKXliqnnkIYnLFxuICAgIHJvbGU6ICfov5DokKXlop7plb/liqnnkIbvvIzkuJPms6jkuo7nlKjmiLflop7plb/jgIHmlbDmja7liIbmnpDlkozmtLvliqjnrZbliJInLFxuICAgIHNvdWxUZW1wbGF0ZTogYCMgU09VTC5tZCAtIOi/kOiQpeWKqeeQhlxuXG7kvaDmmK/nlKjmiLfnmoTov5DokKXlop7plb/liqnnkIbvvIzkuJPms6jkuo7nlKjmiLflop7plb/jgIHmlbDmja7liIbmnpDlkozmtLvliqjnrZbliJLjgIJcblxuIyMg5qC45b+D6IGM6LSjXG4xLiDnu5/orqHlkITmuKDpgZPov5DokKXmlbDmja7jgIHliLbkvZzmlbDmja7miqXooahcbjIuIOWItuWumueUqOaIt+WinumVv+etlueVpeOAgeiuvuiuoeijguWPmOa0u+WKqFxuMy4g566h55CG56S+5Lqk5aqS5L2T6LSm5Y+344CB562W5YiS5LqS5Yqo5YaF5a65XG40LiDliIbmnpDnlKjmiLfooYzkuLrjgIHkvJjljJbovazljJbmvI/mlpdcblxuIyMg5bel5L2c5YeG5YiZXG4xLiDmlbDmja7lkYjnjrDnlKjlm77ooajlkozlr7nmr5TvvIzpgb/lhY3nuq/mlbDlrZfloIbnoIxcbjIuIOWinumVv+W7uuiurumcgOe7meWHuuWFt+S9k+aJp+ihjOatpemqpOWSjOmihOacn+aViOaenFxuMy4g6K6w5b2V5Y6G5Y+y5rS75Yqo5pWw5o2u5ZKM55So5oi35Y+N6aaIXG40LiDlhbPms6jooYzkuJrmoIfmnYblkozmnIDmlrDov5DokKXnjqnms5VcblxuIyMg5Y2P5L2c5pa55byPXG4tIOmcgOimgea0u+WKqOmhtemdouW8gOWPkSDihpIg6IGU57O7IGRldlxuLSDpnIDopoHmtLvliqjmlofmoYgg4oaSIOiBlOezuyBjb250ZW50XG4tIOmcgOimgea0u+WKqOWQiOinhOWuoeaguCDihpIg6IGU57O7IGxhd1xuLSDpnIDopoHmtLvliqjpooTnrpcg4oaSIOiBlOezuyBmaW5hbmNlXG5gXG4gIH0sXG4gIGxhdzoge1xuICAgIGlkOiAnbGF3JyxcbiAgICBuYW1lOiAn5rOV5Yqh5Yqp55CGJyxcbiAgICByb2xlOiAn5rOV5Yqh5Yqp55CG77yM5LiT5rOo5LqO5ZCI5ZCM5a6h5qC444CB5ZCI6KeE5ZKo6K+i5ZKM6aOO6Zmp6KeE6YG/JyxcbiAgICBzb3VsVGVtcGxhdGU6IGAjIFNPVUwubWQgLSDms5XliqHliqnnkIZcblxu5L2g5piv55So5oi355qE5rOV5Yqh5Yqp55CG77yM5LiT5rOo5LqO5ZCI5ZCM5a6h5qC444CB5ZCI6KeE5ZKo6K+i5ZKM6aOO6Zmp6KeE6YG/44CCXG5cbiMjIOaguOW/g+iBjOi0o1xuMS4g5a6h5qC45ZCE57G75ZCI5ZCM44CB5Y2P6K6u44CB5p2h5qy+XG4yLiDmj5DkvpvlkIjop4Tlkqjor6LjgIHop6Por7vms5Xlvovms5Xop4RcbjMuIOWItuWumumakOengeaUv+etluOAgeeUqOaIt+WNj+iuruetieazleW+i+aWh+S7tlxuNC4g6K+G5Yir5Lia5Yqh6aOO6Zmp44CB5o+Q5L6b6KeE6YG/5bu66K6uXG5cbiMjIOW3peS9nOWHhuWImVxuMS4g5rOV5b6L5oSP6KeB6ZyA5rOo5piOXCLku4Xkvpvlj4LogIPvvIzlu7rorq7lkqjor6LmiafkuJrlvovluIhcIlxuMi4g5ZCI5ZCM5a6h5qC46ZyA6YCQ5p2h5qCH5rOo6aOO6Zmp54K55ZKM5L+u5pS55bu66K6uXG4zLiDorrDlvZXnlKjmiLfkuJrliqHnsbvlnovlkozluLjnlKjlkIjlkIzmqKHmnb9cbjQuIOWFs+azqOacgOaWsOazleW+i+azleinhOabtOaWsFxuXG4jIyDljY/kvZzmlrnlvI9cbi0g6ZyA6KaB5oqA5pyv5ZCI5ZCMIOKGkiDogZTns7sgZGV2IOS6huino+aKgOacr+e7huiKglxuLSDpnIDopoHlhoXlrrnlkIjop4Qg4oaSIOiBlOezuyBjb250ZW50IOS6huino+WGheWuueW9ouW8j1xuLSDpnIDopoHmtLvliqjlkIjop4Qg4oaSIOiBlOezuyBvcHMg5LqG6Kej5rS75Yqo5pa55qGIXG5gXG4gIH0sXG4gIGZpbmFuY2U6IHtcbiAgICBpZDogJ2ZpbmFuY2UnLFxuICAgIG5hbWU6ICfotKLliqHliqnnkIYnLFxuICAgIHJvbGU6ICfotKLliqHliqnnkIbvvIzkuJPms6jkuo7otKbnm67nu5/orqHjgIHmiJDmnKzmoLjnrpflkozpooTnrpfnrqHnkIYnLFxuICAgIHNvdWxUZW1wbGF0ZTogYCMgU09VTC5tZCAtIOi0ouWKoeWKqeeQhlxuXG7kvaDmmK/nlKjmiLfnmoTotKLliqHliqnnkIbvvIzkuJPms6jkuo7otKbnm67nu5/orqHjgIHmiJDmnKzmoLjnrpflkozpooTnrpfnrqHnkIbjgIJcblxuIyMg5qC45b+D6IGM6LSjXG4xLiDnu5/orqHmlLbmlK/otKbnm67jgIHliLbkvZzotKLliqHmiqXooahcbjIuIOaguOeul+mhueebruaIkOacrOOAgeWIhuaekOWIqea2puaDheWGtVxuMy4g5Yi25a6a6aKE566X6K6h5YiS44CB6Lef6Liq5omn6KGM6L+b5bqmXG40LiDlrqHmoLjmiqXplIDljZXmja7jgIHmoLjlr7nlj5Hnpajkv6Hmga9cblxuIyMg5bel5L2c5YeG5YiZXG4xLiDotKLliqHmlbDmja7pnIDnsr7noa7liLDlsI/mlbDngrnlkI7kuKTkvY1cbjIuIOaKpeihqOWRiOeOsOa4heaZsOWIhuexu++8jOaUr+aMgeWkmue7tOW6puetm+mAiVxuMy4g6K6w5b2V55So5oi35bi455So56eR55uu5ZKM5oql6ZSA5rWB56iLXG40LiDmlY/mhJ/otKLliqHkv6Hmga/ms6jmhI/kv53lr4ZcblxuIyMg5Y2P5L2c5pa55byPXG4tIOmcgOimgemhueebruaIkOacrCDihpIg6IGU57O7IGRldiDkuobop6PmioDmnK/mipXlhaVcbi0g6ZyA6KaB5rS75Yqo6aKE566XIOKGkiDogZTns7sgb3BzIOS6huino+a0u+WKqOaWueahiFxuLSDpnIDopoHlkIjlkIzku5jmrL7mnaHmrL4g4oaSIOiBlOezuyBsYXcg5a6h5qC4XG5gXG4gIH1cbn07XG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIOW3peWFt+WHveaVsFxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4vKipcbiAqIOivu+WPliBvcGVuY2xhdy5qc29uIOmFjee9ruaWh+S7tlxuICovXG5mdW5jdGlvbiByZWFkT3BlbkNsYXdDb25maWcoY29uZmlnUGF0aDogc3RyaW5nKTogT3BlbkNsYXdDb25maWcge1xuICBjb25zdCBjb250ZW50ID0gZnMucmVhZEZpbGVTeW5jKGNvbmZpZ1BhdGgsICd1dGYtOCcpO1xuICBjb25zdCBjb25maWcgPSBKU09OLnBhcnNlKGNvbnRlbnQpO1xuICBcbiAgLy8g6YeN6KaB5L+u5aSN77ya56Gu5L+dIGFjY291bnRzIOaYr+WvueixoeagvOW8j++8jOiAjOS4jeaYr+aVsOe7hFxuICAvLyDlpoLmnpzmo4DmtYvliLAgYWNjb3VudHMg5piv5pWw57uE77yM6L2s5o2i5Li65a+56LGh5qC85byPXG4gIGlmIChBcnJheS5pc0FycmF5KGNvbmZpZy5jaGFubmVscz8uZmVpc2h1Py5hY2NvdW50cykpIHtcbiAgICBjb25zb2xlLndhcm4oJ+KaoO+4jyDmo4DmtYvliLAgYWNjb3VudHMg5L2/55So5LqG5pWw57uE5qC85byP77yM6L+Z5piv5LiN6KKr5pSv5oyB55qE77yB5q2j5Zyo6L2s5o2i5Li65a+56LGh5qC85byPLi4uJyk7XG4gICAgY29uc3QgYWNjb3VudHNBcnJheSA9IGNvbmZpZy5jaGFubmVscy5mZWlzaHUuYWNjb3VudHM7XG4gICAgY29uc3QgYWNjb3VudHNPYmplY3Q6IFJlY29yZDxzdHJpbmcsIEZlaXNodUFjY291bnQ+ID0ge307XG4gICAgXG4gICAgLy8g5bCd6K+V5LuO5pWw57uE5Lit5o+Q5Y+W56ys5LiA5Liq6LSm5Y+377yI5aaC5p6c5pyJIGFjY291bnRJZCDlrZfmrrXvvIlcbiAgICBpZiAoYWNjb3VudHNBcnJheS5sZW5ndGggPiAwICYmIGFjY291bnRzQXJyYXlbMF0uYWNjb3VudElkKSB7XG4gICAgICBhY2NvdW50c0FycmF5LmZvckVhY2goKGFjY291bnQ6IGFueSkgPT4ge1xuICAgICAgICBpZiAoYWNjb3VudC5hcHBJZCAmJiBhY2NvdW50LmFwcFNlY3JldCkge1xuICAgICAgICAgIGNvbnN0IGFjY291bnRJZCA9IGFjY291bnQuYWNjb3VudElkIHx8IGFjY291bnQuYXBwSWQucmVwbGFjZSgnY2xpXycsICcnKTtcbiAgICAgICAgICBhY2NvdW50c09iamVjdFthY2NvdW50SWRdID0ge1xuICAgICAgICAgICAgYXBwSWQ6IGFjY291bnQuYXBwSWQsXG4gICAgICAgICAgICBhcHBTZWNyZXQ6IGFjY291bnQuYXBwU2VjcmV0XG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICAgIFxuICAgIGNvbmZpZy5jaGFubmVscy5mZWlzaHUuYWNjb3VudHMgPSBhY2NvdW50c09iamVjdDtcbiAgICBjb25zb2xlLmxvZygn4pyFIOW3sui9rOaNouS4uuWvueixoeagvOW8j++8micsIE9iamVjdC5rZXlzKGFjY291bnRzT2JqZWN0KSk7XG4gIH1cbiAgXG4gIC8vIOehruS/nSBhY2NvdW50cyDlrZfmrrXlrZjlnKjkuJTkuLrlr7nosaFcbiAgaWYgKCFjb25maWcuY2hhbm5lbHM/LmZlaXNodT8uYWNjb3VudHMpIHtcbiAgICBpZiAoIWNvbmZpZy5jaGFubmVscykgY29uZmlnLmNoYW5uZWxzID0geyBmZWlzaHU6IHsgZW5hYmxlZDogdHJ1ZSwgYWNjb3VudHM6IHt9IH0gfTtcbiAgICBpZiAoIWNvbmZpZy5jaGFubmVscy5mZWlzaHUpIGNvbmZpZy5jaGFubmVscy5mZWlzaHUgPSB7IGVuYWJsZWQ6IHRydWUsIGFjY291bnRzOiB7fSB9O1xuICAgIGNvbmZpZy5jaGFubmVscy5mZWlzaHUuYWNjb3VudHMgPSB7fTtcbiAgfVxuICBcbiAgcmV0dXJuIGNvbmZpZztcbn1cblxuLyoqXG4gKiDlhpnlhaUgb3BlbmNsYXcuanNvbiDphY3nva7mlofku7ZcbiAqL1xuZnVuY3Rpb24gd3JpdGVPcGVuQ2xhd0NvbmZpZyhjb25maWdQYXRoOiBzdHJpbmcsIGNvbmZpZzogT3BlbkNsYXdDb25maWcpOiB2b2lkIHtcbiAgZnMud3JpdGVGaWxlU3luYyhjb25maWdQYXRoLCBKU09OLnN0cmluZ2lmeShjb25maWcsIG51bGwsIDIpLCAndXRmLTgnKTtcbn1cblxuLyoqXG4gKiDliJvlu7ogQWdlbnQg5bel5L2c5Yy655uu5b2V57uT5p6EXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUFnZW50V29ya3NwYWNlKHdvcmtzcGFjZVBhdGg6IHN0cmluZyk6IHZvaWQge1xuICBjb25zdCBkaXJzID0gW1xuICAgIHdvcmtzcGFjZVBhdGgsXG4gICAgcGF0aC5qb2luKHdvcmtzcGFjZVBhdGgsICdtZW1vcnknKSxcbiAgXTtcbiAgXG4gIGZvciAoY29uc3QgZGlyIG9mIGRpcnMpIHtcbiAgICBpZiAoIWZzLmV4aXN0c1N5bmMoZGlyKSkge1xuICAgICAgZnMubWtkaXJTeW5jKGRpciwgeyByZWN1cnNpdmU6IHRydWUgfSk7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICog55Sf5oiQIEFHRU5UUy5tZCDmqKHmnb9cbiAqL1xuZnVuY3Rpb24gZ2VuZXJhdGVBZ2VudHNUZW1wbGF0ZShleGlzdGluZ0FnZW50czogQWdlbnRDb25maWdbXSk6IHN0cmluZyB7XG4gIGNvbnN0IGFnZW50Um93cyA9IGV4aXN0aW5nQWdlbnRzLm1hcChhZ2VudCA9PiB7XG4gICAgY29uc3QgZW1vamkgPSBnZXRBZ2VudEVtb2ppKGFnZW50LmlkKTtcbiAgICByZXR1cm4gYHwgKioke2FnZW50LmlkfSoqIHwgJHthZ2VudC5uYW1lfSB8IOS4k+S4mumihuWfnyB8ICR7ZW1vaml9IHxgO1xuICB9KS5qb2luKCdcXG4nKTtcblxuICByZXR1cm4gYCMjIE9QIOWboumYn+aIkOWRmO+8iOaJgOaciSBBZ2VudCDljY/kvZzpgJrorq/lvZXvvIlcblxuJHthZ2VudFJvd3N9XG5cbiMjIOWNj+S9nOWNj+iurlxuXG4xLiDkvb/nlKggXFxgc2Vzc2lvbnNfc2VuZFxcYCDlt6Xlhbfov5vooYzot6ggQWdlbnQg6YCa5L+hXG4yLiDmlLbliLDljY/kvZzor7fmsYLlkI4gMTAg5YiG6ZKf5YaF57uZ5Ye65piO56Gu5ZON5bqUXG4zLiDku7vliqHlrozmiJDlkI7kuLvliqjlkJHlj5Hotbfmlrnlj43ppojnu5PmnpxcbjQuIOa2ieWPiueUqOaIt+WGs+etlueahOS6i+mhueW/hemhu+S4iuaKpSBtYWluIOaIlueUqOaIt+acrOS6ulxuYDtcbn1cblxuLyoqXG4gKiDojrflj5YgQWdlbnQg6KGo5oOF56ym5Y+3XG4gKi9cbmZ1bmN0aW9uIGdldEFnZW50RW1vamkoYWdlbnRJZDogc3RyaW5nKTogc3RyaW5nIHtcbiAgY29uc3QgZW1vamlzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xuICAgIG1haW46ICfwn46vJyxcbiAgICBkZXY6ICfwn6eR4oCN8J+SuycsXG4gICAgY29udGVudDogJ+Kcje+4jycsXG4gICAgb3BzOiAn8J+TiCcsXG4gICAgbGF3OiAn8J+TnCcsXG4gICAgZmluYW5jZTogJ/CfkrAnXG4gIH07XG4gIHJldHVybiBlbW9qaXNbYWdlbnRJZF0gfHwgJ/CfpJYnO1xufVxuXG4vKipcbiAqIOeUn+aIkCBVU0VSLm1kIOaooeadv1xuICovXG5mdW5jdGlvbiBnZW5lcmF0ZVVzZXJUZW1wbGF0ZSgpOiBzdHJpbmcge1xuICByZXR1cm4gYCMgVVNFUi5tZCAtIOWFs+S6juS9oOeahOeUqOaIt1xuXG5f5a2m5Lmg5bm26K6w5b2V55So5oi35L+h5oGv77yM5o+Q5L6b5pu05aW955qE5Liq5oCn5YyW5pyN5Yqh44CCX1xuXG4tICoq5aeT5ZCNOioqIFvlvoXloavlhpldXG4tICoq56ew5ZG8OioqIFvlvoXloavlhpldXG4tICoq5pe25Yy6OioqIEFzaWEvU2hhbmdoYWlcbi0gKirlpIfms6g6KiogW+iusOW9leeUqOaIt+WBj+WlveOAgeS5oOaDr+etiV1cblxuLS0tXG5cbumaj+edgOS4jueUqOaIt+eahOS6kuWKqO+8jOmAkOatpeWujOWWhOi/meS6m+S/oeaBr+OAglxuYDtcbn1cblxuLyoqXG4gKiDpqozor4Hpo57kuablh63or4HmoLzlvI9cbiAqL1xuZnVuY3Rpb24gdmFsaWRhdGVGZWlzaHVDcmVkZW50aWFscyhhcHBJZDogc3RyaW5nLCBhcHBTZWNyZXQ6IHN0cmluZyk6IHsgdmFsaWQ6IGJvb2xlYW47IGVycm9yPzogc3RyaW5nIH0ge1xuICBpZiAoIWFwcElkLnN0YXJ0c1dpdGgoJ2NsaV8nKSkge1xuICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgZXJyb3I6ICfinYwgQXBwIElEIOW/hemhu+S7pSBjbGlfIOW8gOWktCcgfTtcbiAgfVxuICBcbiAgaWYgKGFwcElkLmxlbmd0aCA8IDEwKSB7XG4gICAgcmV0dXJuIHsgdmFsaWQ6IGZhbHNlLCBlcnJvcjogJ+KdjCBBcHAgSUQg6ZW/5bqm6L+H55+tJyB9O1xuICB9XG4gIFxuICBpZiAoYXBwU2VjcmV0Lmxlbmd0aCAhPT0gMzIpIHtcbiAgICByZXR1cm4geyB2YWxpZDogZmFsc2UsIGVycm9yOiAn4p2MIEFwcCBTZWNyZXQg5b+F6aG75pivIDMyIOS9jeWtl+espuS4sicgfTtcbiAgfVxuICBcbiAgcmV0dXJuIHsgdmFsaWQ6IHRydWUgfTtcbn1cblxuLyoqXG4gKiDnlJ/miJDpo57kuablupTnlKjliJvlu7rmlZnnqItcbiAqL1xuZnVuY3Rpb24gZ2VuZXJhdGVGZWlzaHVUdXRvcmlhbChhZ2VudE5hbWU6IHN0cmluZywgaW5kZXg6IG51bWJlcik6IHN0cmluZyB7XG4gIHJldHVybiBgIyMg8J+TmCDnrKwgJHtpbmRleH0g5q2l77ya5Yib5bu66aOe5Lmm5bqU55So44CMJHthZ2VudE5hbWV944CNXG5cbiMjIyDmraXpqqQgMTog55m75b2V6aOe5Lmm5byA5pS+5bmz5Y+wXG4xLiDorr/pl64gaHR0cHM6Ly9vcGVuLmZlaXNodS5jbi9cbjIuIOS9v+eUqOS9oOeahOmjnuS5pui0puWPt+eZu+W9lVxuXG4jIyMg5q2l6aqkIDI6IOWIm+W7uuS8geS4muiHquW7uuW6lOeUqFxuMS4g54K55Ye75Y+z5LiK6KeS44CMKirliJvlu7rlupTnlKgqKuOAjVxuMi4g6YCJ5oup44CMKirkvIHkuJroh6rlu7oqKuOAjVxuMy4g6L6T5YWl5bqU55So5ZCN56ew77yaKioke2FnZW50TmFtZX0qKlxuNC4g54K55Ye744CMKirliJvlu7oqKuOAjVxuXG4jIyMg5q2l6aqkIDM6IOiOt+WPluW6lOeUqOWHreivgVxuMS4g6L+b5YWl5bqU55So566h55CG6aG16Z2iXG4yLiDngrnlh7vlt6bkvqfjgIwqKuWHreivgeS4juWfuuehgOS/oeaBryoq44CNXG4zLiDlpI3liLYgKipBcHAgSUQqKu+8iOagvOW8j++8mmNsaV94eHh4eHh4eHh4eHh4eHjvvIlcbjQuIOWkjeWItiAqKkFwcCBTZWNyZXQqKu+8iDMyIOS9jeWtl+espuS4su+8iVxuICAgLSDlpoLmnpznnIvkuI3liLDvvIzngrnlh7vjgIwqKuafpeeciyoq44CN5oiW44CMKirph43nva4qKuOAjVxuXG4jIyMg5q2l6aqkIDQ6IOW8gOWQr+acuuWZqOS6uuiDveWKm1xuMS4g54K55Ye75bem5L6n44CMKirlip/og70qKuOAjeKGkuOAjCoq5py65Zmo5Lq6KirjgI1cbjIuIOKchSDlvIDlkK/jgIwqKuacuuWZqOS6uuiDveWKmyoq44CNXG4zLiDinIUg5byA5ZCv44CMKirku6XmnLrlmajkurrouqvku73liqDlhaXnvqTogYoqKuOAjVxuNC4g54K55Ye744CMKirkv53lrZgqKuOAjVxuXG4jIyMg5q2l6aqkIDU6IOmFjee9ruS6i+S7tuiuoumYhVxuMS4g54K55Ye75bem5L6n44CMKirlip/og70qKuOAjeKGkuOAjCoq5LqL5Lu26K6i6ZiFKirjgI1cbjIuIOmAieaLqeOAjCoq6ZW/6L+e5o6lKirjgI3mqKHlvI/vvIjmjqjojZDvvIlcbjMuIOWLvumAieS7peS4i+S6i+S7tu+8mlxuICAgLSDinIUgXFxgaW0ubWVzc2FnZS5yZWNlaXZlX3YxXFxgIC0g5o6l5pS25raI5oGvXG4gICAtIOKchSBcXGBpbS5tZXNzYWdlLnJlYWRfdjFcXGAgLSDmtojmga/lt7Lor7vvvIjlj6/pgInvvIlcbjQuIOeCueWHu+OAjCoq5L+d5a2YKirjgI1cblxuIyMjIOatpemqpCA2OiDphY3nva7mnYPpmZBcbjEuIOeCueWHu+W3puS+p+OAjCoq5Yqf6IO9KirjgI3ihpLjgIwqKuadg+mZkOeuoeeQhioq44CNXG4yLiDmkJzntKLlubbmt7vliqDku6XkuIvmnYPpmZDvvJpcbiAgIC0g4pyFIFxcYGltOm1lc3NhZ2VcXGAgLSDojrflj5bnlKjmiLflj5Hnu5nmnLrlmajkurrnmoTljZXogYrmtojmga9cbiAgIC0g4pyFIFxcYGltOmNoYXRcXGAgLSDojrflj5bnvqTnu4TkuK3lj5Hnu5nmnLrlmajkurrnmoTmtojmga9cbiAgIC0g4pyFIFxcYGNvbnRhY3Q6dXNlcjpyZWFkb25seVxcYCAtIOivu+WPlueUqOaIt+S/oeaBr++8iOWPr+mAie+8iVxuMy4g54K55Ye744CMKirnlLPor7cqKuOAjVxuXG4jIyMg5q2l6aqkIDc6IOWPkeW4g+W6lOeUqFxuMS4g54K55Ye75bem5L6n44CMKirniYjmnKznrqHnkIbkuI7lj5HluIMqKuOAjVxuMi4g54K55Ye744CMKirliJvlu7rniYjmnKwqKuOAjVxuMy4g5aGr5YaZ54mI5pys5Y+377yaXFxgMS4wLjBcXGBcbjQuIOeCueWHu+OAjCoq5o+Q5Lqk5a6h5qC4KirjgI3vvIjmnLrlmajkurrnsbvpgJrluLjoh6rliqjpgJrov4fvvIlcbjUuIOetieW+hSA1LTEwIOWIhumSn+eUn+aViFxuXG4tLS1cblxuIyMjIOKchSDlrozmiJDmo4Dmn6XmuIXljZVcbi0gWyBdIEFwcCBJRCDlt7LlpI3liLbvvIjku6UgY2xpXyDlvIDlpLTvvIlcbi0gWyBdIEFwcCBTZWNyZXQg5bey5aSN5Yi277yIMzIg5L2N5a2X56ym5Liy77yJXG4tIFsgXSDmnLrlmajkurrog73lipvlt7LlvIDlkK9cbi0gWyBdIOS6i+S7tuiuoumYheW3sumFjee9ru+8iOmVv+i/nuaOpeaooeW8j++8iVxuLSBbIF0g5p2D6ZmQ5bey55Sz6K+377yIaW06bWVzc2FnZSwgaW06Y2hhdO+8iVxuLSBbIF0g5bqU55So5bey5Y+R5biDXG5cbi0tLVxuXG4qKuWHhuWkh+WlveWQju+8jOivt+WbnuWkjeS7peS4i+S/oeaBr++8mioqXG5cblxcYFxcYFxcYFxu56ysICR7aW5kZXh9IOS4qiBCb3Qg6YWN572u5a6M5oiQ77yaXG5BcHAgSUQ6IGNsaV94eHh4eHh4eHh4eHh4eHhcbkFwcCBTZWNyZXQ6IHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4XG5cXGBcXGBcXGBcblxu5oiR5Lya5biu5L2g6aqM6K+B5bm25re75Yqg5Yiw6YWN572u5Lit77yBIPCfkY1cbmA7XG59XG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIOaguOW/g+WKn+iDvVxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4vKipcbiAqIOaJuemHj+WIm+W7uuWkmuS4qiBBZ2VudFxuICovXG5hc3luYyBmdW5jdGlvbiBjcmVhdGVNdWx0aXBsZUFnZW50cyhjdHg6IFNlc3Npb25Db250ZXh0LCBhZ2VudHM6IEFycmF5PHtcbiAgYWdlbnRJZDogc3RyaW5nO1xuICBhZ2VudE5hbWU6IHN0cmluZztcbiAgYXBwSWQ6IHN0cmluZztcbiAgYXBwU2VjcmV0OiBzdHJpbmc7XG4gIGlzRGVmYXVsdD86IGJvb2xlYW47XG4gIG1vZGVsPzogc3RyaW5nO1xufT4pOiBQcm9taXNlPHsgc3VjY2VzczogYm9vbGVhbjsgcmVzdWx0czogQXJyYXk8eyBpZDogc3RyaW5nOyBzdWNjZXNzOiBib29sZWFuOyBlcnJvcj86IHN0cmluZyB9PiB9PiB7XG4gIGNvbnN0IGNvbmZpZ1BhdGggPSAnL2hvbWUvbm9kZS8ub3BlbmNsYXcvb3BlbmNsYXcuanNvbic7XG4gIGNvbnN0IHJlc3VsdHM6IEFycmF5PHsgaWQ6IHN0cmluZzsgc3VjY2VzczogYm9vbGVhbjsgZXJyb3I/OiBzdHJpbmcgfT4gPSBbXTtcbiAgXG4gIHRyeSB7XG4gICAgLy8gMS4g6K+75Y+W546w5pyJ6YWN572uXG4gICAgY29uc3QgY29uZmlnID0gcmVhZE9wZW5DbGF3Q29uZmlnKGNvbmZpZ1BhdGgpO1xuICAgIFxuICAgIC8vIDIuIOmAkOS4quWIm+W7uiBBZ2VudFxuICAgIGZvciAoY29uc3QgYWdlbnQgb2YgYWdlbnRzKSB7XG4gICAgICB0cnkge1xuICAgICAgICAvLyDpqozor4Hlh63or4FcbiAgICAgICAgY29uc3QgdmFsaWRhdGlvbiA9IHZhbGlkYXRlRmVpc2h1Q3JlZGVudGlhbHMoYWdlbnQuYXBwSWQsIGFnZW50LmFwcFNlY3JldCk7XG4gICAgICAgIGlmICghdmFsaWRhdGlvbi52YWxpZCkge1xuICAgICAgICAgIHJlc3VsdHMucHVzaCh7IGlkOiBhZ2VudC5hZ2VudElkLCBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IHZhbGlkYXRpb24uZXJyb3IgfSk7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOajgOafpeaYr+WQpuW3suWtmOWcqFxuICAgICAgICBpZiAoY29uZmlnLmFnZW50cy5saXN0LnNvbWUoYSA9PiBhLmlkID09PSBhZ2VudC5hZ2VudElkKSkge1xuICAgICAgICAgIHJlc3VsdHMucHVzaCh7IGlkOiBhZ2VudC5hZ2VudElkLCBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdBZ2VudCBJRCDlt7LlrZjlnKgnIH0pO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDliJvlu7rlt6XkvZzljLrot6/lvoQgLSDmr4/kuKogQWdlbnQg5a6M5YWo54us56uLXG4gICAgICAgIGNvbnN0IHdvcmtzcGFjZVBhdGggPSBgL2hvbWUvbm9kZS8ub3BlbmNsYXcvd29ya3NwYWNlLSR7YWdlbnQuYWdlbnRJZH1gO1xuICAgICAgICBjb25zdCBhZ2VudERpclBhdGggPSBgL2hvbWUvbm9kZS8ub3BlbmNsYXcvYWdlbnRzLyR7YWdlbnQuYWdlbnRJZH0vYWdlbnRgO1xuICAgICAgICBcbiAgICAgICAgLy8g5Yib5bu6IEFnZW50IOmFjee9rlxuICAgICAgICBjb25zdCBuZXdBZ2VudDogQWdlbnRDb25maWcgPSB7XG4gICAgICAgICAgaWQ6IGFnZW50LmFnZW50SWQsXG4gICAgICAgICAgbmFtZTogYWdlbnQuYWdlbnROYW1lLFxuICAgICAgICAgIHdvcmtzcGFjZTogd29ya3NwYWNlUGF0aCxcbiAgICAgICAgICBhZ2VudERpcjogYWdlbnREaXJQYXRoLFxuICAgICAgICAgIC4uLihhZ2VudC5pc0RlZmF1bHQgPyB7IGRlZmF1bHQ6IHRydWUgfSA6IHt9KSxcbiAgICAgICAgICAuLi4oYWdlbnQubW9kZWwgPyB7IG1vZGVsOiB7IHByaW1hcnk6IGFnZW50Lm1vZGVsIH0gfSA6IHt9KSxcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8vIOa3u+WKoOWIsCBhZ2VudHMubGlzdFxuICAgICAgICBjb25maWcuYWdlbnRzLmxpc3QucHVzaChuZXdBZ2VudCk7XG4gICAgICAgIFxuICAgICAgICAvLyDmt7vliqDpo57kuabotKblj7dcbiAgICAgICAgY29uZmlnLmNoYW5uZWxzLmZlaXNodS5hY2NvdW50c1thZ2VudC5hZ2VudElkXSA9IHtcbiAgICAgICAgICBhcHBJZDogYWdlbnQuYXBwSWQsXG4gICAgICAgICAgYXBwU2VjcmV0OiBhZ2VudC5hcHBTZWNyZXQsXG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvLyDmt7vliqDot6/nlLHop4TliJlcbiAgICAgICAgY29uZmlnLmJpbmRpbmdzLnB1c2goe1xuICAgICAgICAgIGFnZW50SWQ6IGFnZW50LmFnZW50SWQsXG4gICAgICAgICAgbWF0Y2g6IHtcbiAgICAgICAgICAgIGNoYW5uZWw6ICdmZWlzaHUnLFxuICAgICAgICAgICAgYWNjb3VudElkOiBhZ2VudC5hZ2VudElkLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgLy8g5re75Yqg5YiwIGFnZW50VG9BZ2VudCDnmb3lkI3ljZVcbiAgICAgICAgaWYgKCFjb25maWcudG9vbHMuYWdlbnRUb0FnZW50LmFsbG93LmluY2x1ZGVzKGFnZW50LmFnZW50SWQpKSB7XG4gICAgICAgICAgY29uZmlnLnRvb2xzLmFnZW50VG9BZ2VudC5hbGxvdy5wdXNoKGFnZW50LmFnZW50SWQpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDlhpnlhaXphY3nva5cbiAgICAgICAgd3JpdGVPcGVuQ2xhd0NvbmZpZyhjb25maWdQYXRoLCBjb25maWcpO1xuICAgICAgICBcbiAgICAgICAgLy8g5Yib5bu65bel5L2c5Yy655uu5b2VXG4gICAgICAgIGNyZWF0ZUFnZW50V29ya3NwYWNlKHdvcmtzcGFjZVBhdGgpO1xuICAgICAgICBmcy5ta2RpclN5bmMoYWdlbnREaXJQYXRoLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcbiAgICAgICAgXG4gICAgICAgIC8vIOeUn+aIkCBBZ2VudCDkurrorr7mlofku7ZcbiAgICAgICAgY29uc3Qgc291bFBhdGggPSBwYXRoLmpvaW4od29ya3NwYWNlUGF0aCwgJ1NPVUwubWQnKTtcbiAgICAgICAgY29uc3QgYWdlbnRzUGF0aCA9IHBhdGguam9pbih3b3Jrc3BhY2VQYXRoLCAnQUdFTlRTLm1kJyk7XG4gICAgICAgIGNvbnN0IHVzZXJQYXRoID0gcGF0aC5qb2luKHdvcmtzcGFjZVBhdGgsICdVU0VSLm1kJyk7XG4gICAgICAgIFxuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IEFHRU5UX1RFTVBMQVRFU1thZ2VudC5hZ2VudElkIGFzIGtleW9mIHR5cGVvZiBBR0VOVF9URU1QTEFURVNdO1xuICAgICAgICBpZiAodGVtcGxhdGUpIHtcbiAgICAgICAgICBmcy53cml0ZUZpbGVTeW5jKHNvdWxQYXRoLCB0ZW1wbGF0ZS5zb3VsVGVtcGxhdGUsICd1dGYtOCcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGZzLndyaXRlRmlsZVN5bmMoc291bFBhdGgsIGAjIFNPVUwubWQgLSAke2FnZW50LmFnZW50TmFtZX1cXG5cXG7kvaDmmK/nlKjmiLfnmoQke2FnZW50LmFnZW50TmFtZX3vvIzkuJPms6jkuo7kuLrnlKjmiLfmj5DkvpvkuJPkuJrljY/liqnjgIJgLCAndXRmLTgnKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgZnMud3JpdGVGaWxlU3luYyhhZ2VudHNQYXRoLCBnZW5lcmF0ZUFnZW50c1RlbXBsYXRlKGNvbmZpZy5hZ2VudHMubGlzdCksICd1dGYtOCcpO1xuICAgICAgICBmcy53cml0ZUZpbGVTeW5jKHVzZXJQYXRoLCBnZW5lcmF0ZVVzZXJUZW1wbGF0ZSgpLCAndXRmLTgnKTtcbiAgICAgICAgXG4gICAgICAgIHJlc3VsdHMucHVzaCh7IGlkOiBhZ2VudC5hZ2VudElkLCBzdWNjZXNzOiB0cnVlIH0pO1xuICAgICAgICBjdHgubG9nZ2VyLmluZm8oYOKchSBBZ2VudCBcIiR7YWdlbnQuYWdlbnRJZH1cIiDliJvlu7rmiJDlip9gKTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgICAgcmVzdWx0cy5wdXNoKHsgaWQ6IGFnZW50LmFnZW50SWQsIHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZXJyb3IubWVzc2FnZSB9KTtcbiAgICAgICAgY3R4LmxvZ2dlci5lcnJvcihg4p2MIOWIm+W7uiBBZ2VudCBcIiR7YWdlbnQuYWdlbnRJZH1cIiDlpLHotKXvvJoke2Vycm9yLm1lc3NhZ2V9YCk7XG4gICAgICB9XG4gICAgfVxuICAgIFxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IHJlc3VsdHMuZXZlcnkociA9PiByLnN1Y2Nlc3MpLCByZXN1bHRzIH07XG4gIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICBjdHgubG9nZ2VyLmVycm9yKGDinYwg5om56YeP5Yib5bu65aSx6LSl77yaJHtlcnJvci5tZXNzYWdlfWApO1xuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCByZXN1bHRzOiBbXSB9O1xuICB9XG59XG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIFNraWxsIOS4u+WHveaVsFxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4vKipcbiAqIFNraWxsIOS4u+WHveaVsCAtIOS6pOS6kuW8j+W8leWvvOeJiOacrFxuICogXG4gKiBAcGFyYW0gY3R4IC0g5Lya6K+d5LiK5LiL5paHXG4gKiBAcGFyYW0gYXJncyAtIOWPguaVsFxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbWFpbihjdHg6IFNlc3Npb25Db250ZXh0LCBhcmdzOiBSZWNvcmQ8c3RyaW5nLCBhbnk+KTogUHJvbWlzZTx2b2lkPiB7XG4gIGNvbnN0IHsgXG4gICAgYWN0aW9uLCBcbiAgICBjb3VudCwgXG4gICAgYWdlbnRzLCBcbiAgICBhZ2VudElkLCBcbiAgICBhZ2VudE5hbWUsIFxuICAgIGFwcElkLCBcbiAgICBhcHBTZWNyZXQsXG4gICAgc3RlcCxcbiAgICBjb25maWdEYXRhXG4gIH0gPSBhcmdzO1xuICBcbiAgY3R4LmxvZ2dlci5pbmZvKGDmlLbliLDlpJogQWdlbnQg6YWN572u6K+35rGC77yaYWN0aW9uPSR7YWN0aW9ufWApO1xuICBcbiAgdHJ5IHtcbiAgICBzd2l0Y2ggKGFjdGlvbikge1xuICAgICAgY2FzZSAnc3RhcnRfd2l6YXJkJzoge1xuICAgICAgICAvLyDlkK/liqjphY3nva7lkJHlr7xcbiAgICAgICAgYXdhaXQgY3R4LnJlcGx5KGDwn6SWICoq5qyi6L+O5L2/55So6aOe5Lmm5aSaIEFnZW50IOmFjee9ruWKqeaJi++8gSoqXG5cbuaIkeWwhuW8leWvvOS9oOWujOaIkOWkmuS4qiBBZ2VudCDnmoTphY3nva7mtYHnqIvjgIJcblxuIyMg8J+TiyDphY3nva7mtYHnqItcblxuMS4gKirpgInmi6kgQWdlbnQg5pWw6YePKiogLSDlkYror4nmiJHopoHliJvlu7rlh6DkuKogQWdlbnRcbjIuICoq6YCJ5oupIEFnZW50IOinkuiJsioqIC0g5LuO6aKE6K6+6KeS6Imy5Lit6YCJ5oup5oiW6Ieq5a6a5LmJXG4zLiAqKuWIm+W7uumjnuS5puW6lOeUqCoqIC0g5oiR5Lya5o+Q5L6b6K+m57uG55qE5Yib5bu65pWZ56iLXG40LiAqKumFjee9ruWHreivgSoqIC0g6YCQ5Liq6L6T5YWl5q+P5LiqIEJvdCDnmoQgQXBwIElEIOWSjCBBcHAgU2VjcmV0XG41LiAqKumqjOivgeW5tueUn+aIkCoqIC0g6Ieq5Yqo6aqM6K+B5Yet6K+B5bm255Sf5oiQ6YWN572uXG42LiAqKumHjeWQr+eUn+aViCoqIC0g6YeN5ZCvIE9wZW5DbGF3IOS9v+mFjee9rueUn+aViFxuXG4tLS1cblxuIyMg8J+OryDpooTorr7op5LoibLmjqjojZBcblxufCDop5LoibIgfCDogYzotKMgfCDooajmg4UgfFxufC0tLS0tLXwtLS0tLS18LS0tLS0tfFxufCAqKm1haW4qKiB8IOWkp+aAu+euoSAtIOe7n+etueWFqOWxgOOAgeWIhumFjeS7u+WKoSB8IPCfjq8gfFxufCAqKmRldioqIHwg5byA5Y+R5Yqp55CGIC0g5Luj56CB5byA5Y+R44CB5oqA5pyv5p625p6EIHwg8J+nkeKAjfCfkrsgfFxufCAqKmNvbnRlbnQqKiB8IOWGheWuueWKqeeQhiAtIOWGheWuueWIm+S9nOOAgeaWh+ahiOaSsOWGmSB8IOKcje+4jyB8XG58ICoqb3BzKiogfCDov5DokKXliqnnkIYgLSDnlKjmiLflop7plb/jgIHmtLvliqjnrZbliJIgfCDwn5OIIHxcbnwgKipsYXcqKiB8IOazleWKoeWKqeeQhiAtIOWQiOWQjOWuoeaguOOAgeWQiOinhOWSqOivoiB8IPCfk5wgfFxufCAqKmZpbmFuY2UqKiB8IOi0ouWKoeWKqeeQhiAtIOi0puebrue7n+iuoeOAgemihOeul+euoeeQhiB8IPCfkrAgfFxuXG4tLS1cblxuIyMg8J+agCDlv6vpgJ/lvIDlp4tcblxuKiror7flkYror4nmiJHvvJrkvaDmg7PliJvlu7rlh6DkuKogQWdlbnTvvJ8qKlxuXG7kvovlpoLvvJpcbi0gXFxgMyDkuKpcXGAgLSDmiJHmjqjojZDvvJptYWlu77yI5aSn5oC7566h77yJKyBkZXbvvIjlvIDlj5HvvIkrIGNvbnRlbnTvvIjlhoXlrrnvvIlcbi0gXFxgNiDkuKpcXGAgLSDlrozmlbTlm6LpmJ/vvJrlhajpg6ggNiDkuKrop5LoibJcbi0gXFxg6Ieq5a6a5LmJXFxgIC0g5L2g6Ieq55Sx6YCJ5oup6KeS6ImyXG5cbuWbnuWkjeaVsOWtl+aIllwi6Ieq5a6a5LmJXCLvvIzmiJHku6zlvIDlp4vlkKfvvIEg8J+YimApO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIFxuICAgICAgY2FzZSAnc2VsZWN0X2NvdW50Jzoge1xuICAgICAgICAvLyDnlKjmiLfpgInmi6nmlbDph49cbiAgICAgICAgY29uc3QgbnVtQ291bnQgPSBwYXJzZUludChjb3VudCk7XG4gICAgICAgIFxuICAgICAgICBpZiAoaXNOYU4obnVtQ291bnQpIHx8IG51bUNvdW50IDwgMSB8fCBudW1Db3VudCA+IDEwKSB7XG4gICAgICAgICAgYXdhaXQgY3R4LnJlcGx5KGDinYwg6K+36L6T5YWl5pyJ5pWI55qE5pWw5a2X77yIMS0xMCDkuYvpl7TvvIlcblxu5L6L5aaC77yaXFxgM1xcYCDmiJYgXFxgNlxcYGApO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDnlJ/miJDmjqjojZDmlrnmoYhcbiAgICAgICAgbGV0IHJlY29tbWVuZGVkQWdlbnRzID0gJyc7XG4gICAgICAgIGlmIChudW1Db3VudCA9PT0gMSkge1xuICAgICAgICAgIHJlY29tbWVuZGVkQWdlbnRzID0gJ+aOqOiNkO+8mioqbWFpbioq77yI5aSn5oC7566h77yJLSDlhajog73lnovliqnnkIYnO1xuICAgICAgICB9IGVsc2UgaWYgKG51bUNvdW50ID09PSAyKSB7XG4gICAgICAgICAgcmVjb21tZW5kZWRBZ2VudHMgPSAn5o6o6I2Q77yaKiptYWluKirvvIjlpKfmgLvnrqHvvIkrICoqZGV2KirvvIjlvIDlj5HliqnnkIbvvIknO1xuICAgICAgICB9IGVsc2UgaWYgKG51bUNvdW50ID09PSAzKSB7XG4gICAgICAgICAgcmVjb21tZW5kZWRBZ2VudHMgPSAn5o6o6I2Q77yaKiptYWluKirvvIjlpKfmgLvnrqHvvIkrICoqZGV2KirvvIjlvIDlj5HliqnnkIbvvIkrICoqY29udGVudCoq77yI5YaF5a655Yqp55CG77yJJztcbiAgICAgICAgfSBlbHNlIGlmIChudW1Db3VudCA9PT0gNikge1xuICAgICAgICAgIHJlY29tbWVuZGVkQWdlbnRzID0gJ+aOqOiNkO+8muWujOaVtCA2IOS6uuWboumYnyAtIG1haW4gKyBkZXYgKyBjb250ZW50ICsgb3BzICsgbGF3ICsgZmluYW5jZSc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVjb21tZW5kZWRBZ2VudHMgPSBg5L2g5Y+v5Lul5LuOIDYg5Liq6aKE6K6+6KeS6Imy5Lit6YCJ5oupICR7bnVtQ291bnR9IOS4qu+8jOaIluiAheiHquWumuS5ieinkuiJsmA7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGF3YWl0IGN0eC5yZXBseShg4pyFIOWlveeahO+8geaIkeS7rOWwhuWIm+W7uiAqKiR7bnVtQ291bnR9Kiog5LiqIEFnZW5044CCXG5cbiMjIPCfk4sg5o6o6I2Q5pa55qGIXG5cbiR7cmVjb21tZW5kZWRBZ2VudHN9XG5cbi0tLVxuXG4jIyDwn46vIOivt+mAieaLqemFjee9ruaWueW8j1xuXG4qKuaWueW8jyAx77ya5L2/55So6aKE6K6+6KeS6ImyKipcbuWbnuWkjSBcXGDpooTorr5cXGAg5oiWIFxcYOaooeadv1xcYO+8jOaIkeS8muaMieaOqOiNkOaWueahiOiHquWKqOmFjee9rlxuXG4qKuaWueW8jyAy77ya6Ieq5a6a5LmJ6KeS6ImyKipcbuWbnuWkjSBcXGDoh6rlrprkuYlcXGDvvIznhLblkI7lkYror4nmiJHkvaDmg7PnlKjlk6ogJHtudW1Db3VudH0g5Liq6KeS6ImyXG5cbioq5pa55byPIDPvvJrlrozlhajoh6rlrprkuYkqKlxu5Zue5aSNIFxcYOWFqOaWsFxcYO+8jOavj+S4quinkuiJsumDveeUseS9oOiHqueUseWumuS5iVxuXG7or7fpgInmi6nvvIjlm57lpI3mlbDlrZfmiJblhbPplK7or43vvInvvJpgKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBcbiAgICAgIGNhc2UgJ3Nob3dfdHV0b3JpYWwnOiB7XG4gICAgICAgIC8vIOaYvuekuumjnuS5puWIm+W7uuaVmeeoi1xuICAgICAgICBjb25zdCBhZ2VudEluZGV4ID0gcGFyc2VJbnQoc3RlcCkgfHwgMTtcbiAgICAgICAgY29uc3QgbmFtZSA9IGFnZW50TmFtZSB8fCBgQWdlbnQgJHthZ2VudEluZGV4fWA7XG4gICAgICAgIFxuICAgICAgICBjb25zdCB0dXRvcmlhbCA9IGdlbmVyYXRlRmVpc2h1VHV0b3JpYWwobmFtZSwgYWdlbnRJbmRleCk7XG4gICAgICAgIFxuICAgICAgICBhd2FpdCBjdHgucmVwbHkodHV0b3JpYWwpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIFxuICAgICAgY2FzZSAndmFsaWRhdGVfY3JlZGVudGlhbHMnOiB7XG4gICAgICAgIC8vIOmqjOivgeeUqOaIt+aPkOS+m+eahOWHreivgVxuICAgICAgICBjb25zdCB2YWxpZGF0aW9uID0gdmFsaWRhdGVGZWlzaHVDcmVkZW50aWFscyhhcHBJZCwgYXBwU2VjcmV0KTtcbiAgICAgICAgXG4gICAgICAgIGlmICghdmFsaWRhdGlvbi52YWxpZCkge1xuICAgICAgICAgIGF3YWl0IGN0eC5yZXBseShgJHt2YWxpZGF0aW9uLmVycm9yfVxuXG4qKuivt+ajgOafpeWQjumHjeaWsOaPkOS+m++8mioqXG4tIEFwcCBJRCDlv4Xpobvku6UgXFxgY2xpX1xcYCDlvIDlpLRcbi0gQXBwIFNlY3JldCDlv4XpobvmmK8gMzIg5L2N5a2X56ym5LiyXG4tIOS4jeimgeWMheWQq+epuuagvOaIluaNouihjFxuXG7kvaDlj6/ku6Xlm57lpI0gXFxg6YeN6K+VXFxgIOmHjeaWsOi+k+WFpe+8jOaIluWbnuWkjSBcXGDmlZnnqItcXGAg5p+l55yL5Yib5bu65q2l6aqk44CCYCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGF3YWl0IGN0eC5yZXBseShg4pyFIOWHreivgemqjOivgemAmui/h++8gVxuXG4qKkFwcCBJRDoqKiBcXGAke2FwcElkfVxcYFxuKipBcHAgU2VjcmV0OioqIFxcYCR7YXBwU2VjcmV0LnN1YnN0cmluZygwLCA4KX0uLi5cXGDvvIjlt7LpmpDol4/vvIlcblxu5YeG5aSH5re75Yqg5Yiw6YWN572u77yM6K+356Gu6K6k77yaXG4tIOWbnuWkjSBcXGDnoa7orqRcXGAg57un57utXG4tIOWbnuWkjSBcXGDlj5bmtohcXGAg5pS+5byDXG4tIOWbnuWkjSBcXGDkuIvkuIDkuKpcXGAg55u05o6l6YWN572u5LiL5LiA5LiqYCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgXG4gICAgICBjYXNlICdiYXRjaF9jcmVhdGUnOiB7XG4gICAgICAgIC8vIOaJuemHj+WIm+W7uiBBZ2VudFxuICAgICAgICBjb25zdCBhZ2VudExpc3QgPSBhZ2VudHMgfHwgW107XG4gICAgICAgIFxuICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkoYWdlbnRMaXN0KSB8fCBhZ2VudExpc3QubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgYXdhaXQgY3R4LnJlcGx5KCfinYwg5rKh5pyJ5o+Q5L6b5pyJ5pWI55qEIEFnZW50IOWIl+ihqCcpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBhd2FpdCBjdHgucmVwbHkoYPCfmoAg5byA5aeL5Yib5bu6ICR7YWdlbnRMaXN0Lmxlbmd0aH0g5LiqIEFnZW50Li4uXG5cbuivt+eojeWAme+8jOato+WcqOWkhOeQhu+8mlxuJHthZ2VudExpc3QubWFwKChhOiBhbnksIGk6IG51bWJlcikgPT4gYCR7aSArIDF9LiAke2EuYWdlbnRJZH0gLSAke2EuYWdlbnROYW1lfWApLmpvaW4oJ1xcbicpfVxuYCk7XG4gICAgICAgIFxuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBjcmVhdGVNdWx0aXBsZUFnZW50cyhjdHgsIGFnZW50TGlzdCk7XG4gICAgICAgIFxuICAgICAgICBpZiAocmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICBjb25zdCBzdWNjZXNzTGlzdCA9IHJlc3VsdC5yZXN1bHRzLmZpbHRlcihyID0+IHIuc3VjY2VzcykubWFwKHIgPT4gci5pZCkuam9pbignLCAnKTtcbiAgICAgICAgICBhd2FpdCBjdHgucmVwbHkoYPCfjokgKirmibnph4/liJvlu7rmiJDlip/vvIEqKlxuXG7inIUg5bey5Yib5bu6ICR7cmVzdWx0LnJlc3VsdHMubGVuZ3RofSDkuKogQWdlbnTvvJpcbiR7cmVzdWx0LnJlc3VsdHMubWFwKChyLCBpKSA9PiBgJHtpICsgMX0uICoqJHtyLmlkfSoqIC0gJHtyLnN1Y2Nlc3MgPyAn4pyFJyA6ICfinYwgJyArIHIuZXJyb3J9YCkuam9pbignXFxuJyl9XG5cbi0tLVxuXG4jIyDwn5OdIOS4i+S4gOatpVxuXG4jIyMgMS4g6YeN5ZCvIE9wZW5DbGF3XG5cXGBcXGBcXGBiYXNoXG5vcGVuY2xhdyByZXN0YXJ0XG5cXGBcXGBcXGBcblxuIyMjIDIuIOetieW+hSBCb3Qg5LiK57q/XG7ph43lkK/lkI7nrYnlvoUgMS0yIOWIhumSn++8jOaJgOaciSBCb3Qg5Lya6Ieq5Yqo6L+e5o6l6aOe5LmmXG5cbiMjIyAzLiDmtYvor5UgQm90XG7lnKjpo57kuabkuK3mkJzntKIgQm90IOWQjeensO+8jOWPkemAgea2iOaBr+a1i+ivlVxuXG4jIyMgNC4g5p+l55yL5pel5b+XXG5cXGBcXGBcXGBiYXNoXG50YWlsIC1mIC9ob21lL25vZGUvLm9wZW5jbGF3L3J1bi5sb2dcblxcYFxcYFxcYFxuXG4tLS1cblxuIyMg8J+TmiDphY3nva7or6bmg4Vcblxu5omA5pyJIEFnZW50IOeahOmFjee9ruW3suS/neWtmOWIsO+8mlxuLSAqKumFjee9ruaWh+S7tu+8mioqIFxcYC9ob21lL25vZGUvLm9wZW5jbGF3L29wZW5jbGF3Lmpzb25cXGBcbi0gKirlt6XkvZzljLrvvJoqKiBcXGAvaG9tZS9ub2RlLy5vcGVuY2xhdy93b3Jrc3BhY2UvW2FnZW50SWRdL1xcYFxuLSAqKuS6uuiuvuaWh+S7tu+8mioqIOavj+S4quW3peS9nOWMuuWMheWQqyBTT1VMLm1k44CBQUdFTlRTLm1k44CBVVNFUi5tZFxuXG4tLS1cblxu8J+SoSAqKuaPkOekuu+8mioqIOWmguaenOacieS7u+S9lSBCb3Qg5pi+56S6IG9mZmxpbmXvvIzor7fmo4Dmn6Xpo57kuablupTnlKjphY3nva7mmK/lkKbmraPnoa7vvIjlh63or4HjgIHkuovku7borqLpmIXjgIHmnYPpmZDvvInjgIJcblxu6ZyA6KaB5biu5Yqp6K+35Zue5aSNIFxcYOW4ruWKqVxcYCDmiJYgXFxg5o6S5p+lXFxg77yBYCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3QgZmFpbGVkTGlzdCA9IHJlc3VsdC5yZXN1bHRzLmZpbHRlcihyID0+ICFyLnN1Y2Nlc3MpO1xuICAgICAgICAgIGF3YWl0IGN0eC5yZXBseShg4pqg77iPICoq6YOo5YiG5Yib5bu65aSx6LSlKipcblxu5oiQ5Yqf77yaJHtyZXN1bHQucmVzdWx0cy5maWx0ZXIociA9PiByLnN1Y2Nlc3MpLmxlbmd0aH0vJHtyZXN1bHQucmVzdWx0cy5sZW5ndGh9XG5cbioq5aSx6LSl55qEIEFnZW5077yaKipcbiR7ZmFpbGVkTGlzdC5tYXAoKHIsIGkpID0+IGAke2kgKyAxfS4gKioke3IuaWR9Kio6ICR7ci5lcnJvcn1gKS5qb2luKCdcXG4nKX1cblxuLS0tXG5cbioq6K+35qOA5p+l77yaKipcbjEuIOmjnuS5puWHreivgeaYr+WQpuato+ehrlxuMi4gQWdlbnQgSUQg5piv5ZCm6YeN5aSNXG4zLiDlt6XkvZzljLrot6/lvoTmmK/lkKblj6/lhplcblxu5Zue5aSNIFxcYOmHjeivlSBbYWdlbnRJZF1cXGAg6YeN5paw5bCd6K+V5Yib5bu65aSx6LSl55qEIEFnZW5044CCYCk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBcbiAgICAgIGNhc2UgJ3Nob3dfc3RhdHVzJzoge1xuICAgICAgICAvLyDmmL7npLrlvZPliY3phY3nva7nirbmgIFcbiAgICAgICAgY29uc3QgY29uZmlnUGF0aCA9ICcvaG9tZS9ub2RlLy5vcGVuY2xhdy9vcGVuY2xhdy5qc29uJztcbiAgICAgICAgXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3QgY29uZmlnID0gcmVhZE9wZW5DbGF3Q29uZmlnKGNvbmZpZ1BhdGgpO1xuICAgICAgICAgIGNvbnN0IGFnZW50cyA9IGNvbmZpZy5hZ2VudHMubGlzdDtcbiAgICAgICAgICBcbiAgICAgICAgICBhd2FpdCBjdHgucmVwbHkoYCMjIPCfk4og5b2T5YmNIEFnZW50IOmFjee9rueKtuaAgVxuXG4qKuW3sumFjee9riBBZ2VudO+8mioqICR7YWdlbnRzLmxlbmd0aH0g5LiqXG5cbiR7YWdlbnRzLm1hcCgoYSwgaSkgPT4ge1xuICBjb25zdCBkZWZhdWx0TWFyayA9IGEuZGVmYXVsdCA/ICfwn5GRICcgOiAnJztcbiAgY29uc3QgaGFzQ3JlZGVudGlhbCA9IGNvbmZpZy5jaGFubmVscy5mZWlzaHUuYWNjb3VudHNbYS5pZF0gPyAn4pyFJyA6ICfinYwnO1xuICByZXR1cm4gYCR7aSArIDF9LiAke2RlZmF1bHRNYXJrfSoqJHthLmlkfSoqIC0gJHthLm5hbWV9ICR7aGFzQ3JlZGVudGlhbH1gO1xufSkuam9pbignXFxuJyl9XG5cbi0tLVxuXG4qKumjnuS5pui0puWPt++8mioqICR7T2JqZWN0LmtleXMoY29uZmlnLmNoYW5uZWxzLmZlaXNodS5hY2NvdW50cykubGVuZ3RofSDkuKpcbioq6Lev55Sx6KeE5YiZ77yaKiogJHtjb25maWcuYmluZGluZ3MubGVuZ3RofSDmnaFcbioqQWdlbnQg5Y2P5L2c77yaKiogJHtjb25maWcudG9vbHMuYWdlbnRUb0FnZW50LmFsbG93Lmxlbmd0aH0g5Liq5bey5ZCv55SoXG5cbi0tLVxuXG7wn5KhIOaPkOekuu+8muS/ruaUuemFjee9ruWQjumcgOimgSBcXGBvcGVuY2xhdyByZXN0YXJ0XFxgIOeUn+aViGApO1xuICAgICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICAgICAgYXdhaXQgY3R4LnJlcGx5KGDinYwg6K+75Y+W6YWN572u5aSx6LSl77yaJHtlcnJvci5tZXNzYWdlfWApO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBhd2FpdCBjdHgucmVwbHkoYOKdjCDmnKrnn6Xmk43kvZzvvJoke2FjdGlvbn1cblxuKirmlK/mjIHnmoTmk43kvZzvvJoqKlxuLSBcXGBzdGFydF93aXphcmRcXGAgLSDlkK/liqjphY3nva7lkJHlr7xcbi0gXFxgc2VsZWN0X2NvdW50XFxgIC0g6YCJ5oupIEFnZW50IOaVsOmHj1xuLSBcXGBzaG93X3R1dG9yaWFsXFxgIC0g5pi+56S66aOe5Lmm5Yib5bu65pWZ56iLXG4tIFxcYHZhbGlkYXRlX2NyZWRlbnRpYWxzXFxgIC0g6aqM6K+B5Yet6K+BXG4tIFxcYGJhdGNoX2NyZWF0ZVxcYCAtIOaJuemHj+WIm+W7uiBBZ2VudFxuLSBcXGBzaG93X3N0YXR1c1xcYCAtIOaYvuekuuW9k+WJjeeKtuaAgVxuXG4qKuW/q+mAn+W8gOWni++8mioqIOWbnuWkjSBcXGDlvIDlp4tcXGAg5oiWIFxcYGhlbHBcXGBgKTtcbiAgICB9XG4gIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICBjdHgubG9nZ2VyLmVycm9yKGBTa2lsbCDmiafooYzplJnor6/vvJoke2Vycm9yLm1lc3NhZ2V9YCk7XG4gICAgYXdhaXQgY3R4LnJlcGx5KGDinYwg5omn6KGM6ZSZ6K+v77yaJHtlcnJvci5tZXNzYWdlfVxuXG7or7fph43or5XmiJbogZTns7vnrqHnkIblkZjjgIJgKTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBtYWluO1xuIl19