# 飞书多 Agent 管理器 🤖

> 主 Agent 自主创建子 Agent，用户可在 UI 界面直接配置多个飞书 Bot 凭证

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/rfdiosuao/openclaw-skills)

---

## 📦 安装

```bash
# 从 ClawHub 安装（待发布）
openclaw skills install feishu-multi-agent-manager
```

### 本地安装

```bash
# 克隆仓库
git clone https://github.com/rfdiosuao/openclaw-skills.git
cd openclaw-skills/feishu-multi-agent-manager

# 安装依赖
npm install

# 构建
npm run build
```

---

## 🚀 功能特性

### ✨ 核心功能

1. **主 Agent 自主创建子 Agent**
   - 动态添加新 Agent 到 `openclaw.json`
   - 自动生成工作区目录结构
   - 自动生成 Agent 人设文件（SOUL.md、AGENTS.md、USER.md）

2. **飞书凭证配置**
   - 在 UI 界面直接配置多个飞书 Bot 凭证
   - 自动验证 AppID/AppSecret 格式
   - 支持凭证更新和删除

3. **路由规则管理**
   - 自动生成 bindings 配置
   - 支持特定用户/群聊路由
   - 自动添加到 agentToAgent 白名单

4. **Agent 生命周期管理**
   - 创建、列出、更新、删除 Agent
   - 配置验证和错误处理
   - 操作日志记录

---

## 📖 使用方式

### 方式 1：通过消息调用

```typescript
// 创建新 Agent
await main(ctx, {
  action: 'create_agent',
  agentId: 'dev',
  agentName: '开发助理',
  appId: 'cli_xxxxxxxxxxxxxxx',
  appSecret: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  isDefault: false,
  model: 'custom/qwen3.5-plus'
});

// 更新飞书凭证
await main(ctx, {
  action: 'update_credential',
  agentId: 'dev',
  appId: 'cli_new_app_id',
  appSecret: 'new_app_secret_32_chars'
});

// 列出所有 Agent
await main(ctx, {
  action: 'list_agents'
});

// 删除 Agent
await main(ctx, {
  action: 'delete_agent',
  agentId: 'dev'
});
```

### 方式 2：通过 Claw-CLI 调用

```bash
# 查看帮助
claw skill feishu-multi-agent-manager --help

# 创建 Agent
claw skill feishu-multi-agent-manager create \
  --id dev \
  --name "开发助理" \
  --app-id cli_xxx \
  --app-secret xxx

# 列出 Agent
claw skill feishu-multi-agent-manager list

# 更新凭证
claw skill feishu-multi-agent-manager update-credential \
  --id dev \
  --app-id cli_new \
  --app-secret new_secret

# 删除 Agent
claw skill feishu-multi-agent-manager delete --id dev
```

---

## 📋 API 参考

### `create_agent` - 创建新 Agent

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `agentId` | string | ✅ | Agent 唯一标识（如 `dev`, `content`） |
| `agentName` | string | ✅ | Agent 显示名称（如 `开发助理`） |
| `appId` | string | ✅ | 飞书 App ID（以 `cli_` 开头） |
| `appSecret` | string | ✅ | 飞书 App Secret（32 位字符串） |
| `isDefault` | boolean | ❌ | 是否为默认 Agent |
| `workspacePath` | string | ❌ | 自定义工作区路径 |
| `model` | string | ❌ | 模型配置（默认：`custom/qwen3.5-plus`） |

**返回：**
```json
{
  "success": true,
  "message": "Agent 创建成功"
}
```

### `update_credential` - 更新飞书凭证

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `agentId` | string | ✅ | Agent ID |
| `appId` | string | ✅ | 新飞书 App ID |
| `appSecret` | string | ✅ | 新飞书 App Secret |

### `list_agents` - 列出所有 Agent

**参数：** 无

**返回：**
```json
[
  {
    "id": "main",
    "name": "大总管",
    "workspace": "/home/node/.openclaw/workspace/main",
    "default": true
  },
  {
    "id": "dev",
    "name": "开发助理",
    "workspace": "/home/node/.openclaw/workspace/dev"
  }
]
```

### `delete_agent` - 删除 Agent

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `agentId` | string | ✅ | 要删除的 Agent ID |

**注意：** 不能删除默认 Agent（`default: true`）

---

## 🧪 测试

```bash
# 运行单元测试
npm test

# 运行并生成覆盖率报告
npm test -- --coverage
```

---

## 📝 使用示例

### 示例 1：创建 6 角色 Agent 团队

```typescript
// 创建大总管（默认 Agent）
await main(ctx, {
  action: 'create_agent',
  agentId: 'main',
  agentName: '大总管',
  appId: 'cli_main_xxx',
  appSecret: 'main_secret_xxx',
  isDefault: true
});

// 创建开发助理
await main(ctx, {
  action: 'create_agent',
  agentId: 'dev',
  agentName: '开发助理',
  appId: 'cli_dev_xxx',
  appSecret: 'dev_secret_xxx'
});

// 创建内容助理
await main(ctx, {
  action: 'create_agent',
  agentId: 'content',
  agentName: '内容助理',
  appId: 'cli_content_xxx',
  appSecret: 'content_secret_xxx'
});

// 创建运营助理
await main(ctx, {
  action: 'create_agent',
  agentId: 'ops',
  agentName: '运营增长助理',
  appId: 'cli_ops_xxx',
  appSecret: 'ops_secret_xxx'
});

// 创建法务助理
await main(ctx, {
  action: 'create_agent',
  agentId: 'law',
  agentName: '法务助理',
  appId: 'cli_law_xxx',
  appSecret: 'law_secret_xxx'
});

// 创建财务助理
await main(ctx, {
  action: 'create_agent',
  agentId: 'finance',
  agentName: '财务助理',
  appId: 'cli_finance_xxx',
  appSecret: 'finance_secret_xxx'
});
```

### 示例 2：动态添加新 Agent

```typescript
// 用户说："我需要一个专门负责客服的 Agent"
await main(ctx, {
  action: 'create_agent',
  agentId: 'support',
  agentName: '客服助理',
  appId: 'cli_support_xxx',
  appSecret: 'support_secret_xxx'
});

// 回复用户
await ctx.reply(`✅ 客服助理已创建！

请在飞书开放平台配置应用后，重启 OpenClaw：
\`\`\`bash
openclaw restart
\`\`\``);
```

---

## 🔧 配置说明

### openclaw.json 结构

创建 Agent 后，`openclaw.json` 会自动更新：

```json
{
  "agents": {
    "defaults": {
      "model": {
        "primary": "custom/qwen3.5-plus"
      }
    },
    "list": [
      {
        "id": "main",
        "name": "大总管",
        "workspace": "/home/node/.openclaw/workspace/main",
        "default": true
      },
      {
        "id": "dev",
        "name": "开发助理",
        "workspace": "/home/node/.openclaw/workspace/dev"
      }
    ]
  },
  "channels": {
    "feishu": {
      "enabled": true,
      "accounts": {
        "main": {
          "appId": "cli_main_xxx",
          "appSecret": "main_secret_xxx"
        },
        "dev": {
          "appId": "cli_dev_xxx",
          "appSecret": "dev_secret_xxx"
        }
      }
    }
  },
  "bindings": [
    {
      "agentId": "main",
      "match": {
        "channel": "feishu",
        "accountId": "main"
      }
    },
    {
      "agentId": "dev",
      "match": {
        "channel": "feishu",
        "accountId": "dev"
      }
    }
  ],
  "tools": {
    "agentToAgent": {
      "enabled": true,
      "allow": ["main", "dev"]
    }
  }
}
```

---

## 📝 更新日志

### v1.0.0 (2026-03-09)
- ✨ 初始版本
- ✅ 支持创建/列出/更新/删除 Agent
- ✅ 自动验证飞书凭证格式
- ✅ 自动生成工作区文件
- ✅ 自动配置路由规则

---

## 🔒 安全提示

1. **凭证安全**
   - App Secret 是敏感信息，请勿泄露
   - 不要将 `openclaw.json` 上传到公开仓库
   - 建议定期轮换飞书凭证（90 天）

2. **权限控制**
   - 飞书应用只需配置必要的权限
   - 推荐权限：`im:message`、`im:chat`、`contact:user:readonly`

3. **操作审计**
   - 所有 Agent 管理操作都会记录日志
   - 建议定期检查日志

---

## 🐛 问题排查

### 问题 1：创建 Agent 失败

**错误：** `Agent ID "xxx" 已存在`

**解决：** 使用不同的 `agentId` 或先删除现有 Agent

### 问题 2：凭证验证失败

**错误：** `App ID 必须以 cli_ 开头`

**解决：** 检查飞书 App ID 是否正确复制

### 问题 3：配置不生效

**解决：** 修改 `openclaw.json` 后需要重启 OpenClaw
```bash
openclaw restart
```

---

## 📄 许可证

MIT License

---

## 🔗 相关链接

- [OpenClaw 官方文档](https://docs.openclaw.ai)
- [多 Agent 路由文档](https://clawd.org.cn/concepts/multi-agent.html)
- [飞书开放平台](https://open.feishu.cn/)
- [GitHub 仓库](https://github.com/rfdiosuao/openclaw-skills)

---

**维护者：** [@rfdiosuao](https://github.com/rfdiosuao)  
**最后更新：** 2026-03-09
