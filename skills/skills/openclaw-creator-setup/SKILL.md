# openclaw-creator-setup

🎨 OpenClaw 内容创作者快速配置工具 v3.0 - 真正可用的独立 Skill

## 版本要求

> **⚠️ 重要：本 Skill 需要以下版本支持**

| 版本 | 要求 |
|------|------|
| **OpenClaw ≥ 2026.3.0** | 基础工具调用功能 |
| **Node.js ≥ 18.0.0** | TypeScript 运行环境 |
| **飞书授权** | 可选，用于飞书集成功能 |

## 功能描述

本 Skill 提供**真正可用**的内容创作者环境配置，包括：

1. **环境检测** - 检测飞书授权、已安装 Skills
2. **工作流模板** - 预设每日内容、周报、会议记录等工作流
3. **平台配置** - 配置微信公众号、微博、抖音等发布平台
4. **自然语言交互** - 支持中文自然语言命令

## 核心能力

### 1. 环境检测与配置

| 检测项 | 说明 | 状态 |
|--------|------|------|
| 飞书授权 | 检查是否已授权飞书 API | ✅ 已实现 |
| Skills 安装 | 检测常用 Skills 是否已安装 | ✅ 已实现 |
| 工作流配置 | 验证工作流模板是否正确配置 | ✅ 已实现 |

### 2. 工作流模板

| 工作流 | 触发词 | 功能 |
|--------|--------|------|
| 每日内容创作 | `每日内容` | 热点搜索、灵感生成、文档创建 |
| 周报生成 | `周报` | 任务收集、文档整理、周报生成 |
| 会议记录 | `会议记录` | 记录创建、要点整理、任务生成 |

### 3. 平台配置

支持以下发布平台：

| 平台 | 标识 | 说明 |
|------|------|------|
| 微信公众号 | wechat | 公众号文章发布 |
| 微博 | weibo | 微博内容发布 |
| 抖音 | douyin | 抖音视频发布 |
| 小红书 | xiaohongshu | 小红书笔记发布 |
| B 站 | bilibili | B 站视频发布 |
| 知乎 | zhihu | 知乎文章发布 |

## 使用方法

### 在飞书中使用

**执行完整配置：**
```
安装内容创作者工具
```

**检查环境状态：**
```
检查创作者环境
```

**配置发布平台：**
```
配置平台 wechat weibo
```

**创建工作流：**
```
创建工作流 每日内容
```

### 命令列表

| 命令 | 说明 |
|------|------|
| `安装内容创作者工具` | 执行完整环境配置 |
| `检查创作者环境` | 查看当前状态 |
| `配置平台 <平台名>` | 添加发布平台 |
| `创建工作流 <名称>` | 创建新工作流 |

## 使用示例

### 示例 1：执行完整配置

```
用户：安装内容创作者工具

机器人：
🚀 开始配置内容创作者环境...

✅ 飞书已授权（郑宇航）
✅ 已检测到 5 个常用 Skills
✅ 所有必要 Skills 已安装
✅ 已配置 3 个工作流模板

📋 配置检查:
✅ 飞书授权
✅ Skills 安装
✅ 工作流配置

✅ 所有检查通过！
✅ 内容创作者环境配置完成！
```

### 示例 2：检查环境状态

```
用户：检查创作者环境

机器人：
📊 内容创作者环境状态
====================
飞书授权：✅ 已授权
已安装 Skills: 5 个
工作流：3 个

已安装 Skills:
  feishu-bitable, feishu-calendar, feishu-task

可用工作流:
  • 每日内容创作 (已启用)
  • 周报生成 (已启用)
  • 会议记录 (已启用)
```

### 示例 3：配置发布平台

```
用户：配置平台 wechat weibo

机器人：
✅ 已配置发布平台：wechat, weibo

💡 在飞书中说 "发布到 <平台名>" 即可使用
```

## 技术实现

### 核心函数

```typescript
// 执行完整环境配置
export async function setupCreatorEnvironment(): Promise<CreatorSetupResult>

// 检查环境状态
export async function checkCreatorStatus(): Promise<string>

// 配置发布平台
export async function configurePlatforms(platforms: string[]): Promise<string>

// 创建工作流
export async function createWorkflow(name: string, trigger?: string): Promise<string>
```

### 工具调用

本 Skill 使用 OpenClaw 的工具调用系统：

- `feishu_get_user` - 检查飞书授权
- `agents_list` - 检测已安装的 Skills
- `sessions_spawn` - 创建工作流子任务
- `subagents` - 管理子 Agent

## 配置参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `platforms` | string[] | [] | 已配置的发布平台 |
| `hasFeishuAuth` | boolean | false | 飞书授权状态 |
| `installedSkills` | string[] | [] | 已安装的 Skills 列表 |
| `workflows` | WorkflowInfo[] | [] | 工作流配置 |

## 依赖项

- Node.js >= 18.0.0
- OpenClaw >= 2026.3.0
- 飞书 API（可选，用于飞书集成）

## 最佳实践

### 1. 首次使用

执行完整配置：
```
安装内容创作者工具
```

### 2. 定期检查

检查环境状态：
```
检查创作者环境
```

### 3. 添加新平台

配置新的发布平台：
```
配置平台 douyin xiaohongshu
```

### 4. 创建工作流

创建自定义工作流：
```
创建工作流 月度总结
```

## 注意事项

1. **飞书授权** - 部分功能需要飞书 API 授权
2. **Skills 依赖** - 建议安装 feishu-bitable、feishu-calendar 等 Skills
3. **平台配置** - 发布功能需要各平台的 API 授权
4. **工作流触发** - 说出触发词即可激活工作流

## 版本历史

### v3.0.0 (2026-04-09) - 真正可用的独立 Skill

**核心改进：**
- ✅ 完整的环境检测与配置逻辑
- ✅ 飞书授权状态检查（使用 feishu_get_user）
- ✅ Skills 安装状态检测（使用 agents_list）
- ✅ 工作流模板系统
- ✅ 自然语言交互支持
- ✅ 平台配置管理
- ✅ 独立的工具调用实现

**技术细节：**
- 使用 TypeScript 编写
- 导出独立的函数供 OpenClaw 调用
- 支持异步工具调用
- 完整的错误处理

### v2.0.0 (2026-04-09) - 真实可用版本

- ⚠️ 依赖飞书对话触发，工具调用不完整

### v1.0.0 (2026-04-09) - 初始版本（已废弃）

- ❌ 仅框架代码，无实际功能

## 作者

OpenClaw Skill Master (郑宇航)

## 许可证

MIT-0

## 相关链接

- [ClawHub Skill 页面](https://clawhub.ai/skills/openclaw-creator-setup)
- [OpenClaw 文档](https://docs.openclaw.ai)
- [GitHub 仓库](https://github.com/rfdiosuao/openclaw-skills)
