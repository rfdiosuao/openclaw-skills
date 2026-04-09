# 🎨 OpenClaw 内容创作者快速配置工具

> 帮助内容创作者快速配置 OpenClaw 环境，一键搭建自媒体创作工作流

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://clawhub.ai/skills/openclaw-creator-setup)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)

---

## 📋 目录

- [功能特性](#-功能特性)
- [快速开始](#-快速开始)
- [使用指南](#-使用指南)
- [配置说明](#-配置说明)
- [命令参考](#-命令参考)
- [常见问题](#-常见问题)
- [开发贡献](#-开发贡献)

---

## 🚀 功能特性

### 1. 快速配置
- ✅ 一键安装必要组件
- ✅ 自动化环境设置
- ✅ 预设内容创作模板
- ✅ 智能环境检测

### 2. 创作者工具包
- 📝 文案生成工具
- 🎬 视频处理工具链
- 📱 社交媒体集成
- 📊 数据分析面板

### 3. 工作流模板
- 🔄 内容创作流程自动化
- 🚀 多平台发布工作流
- ⏰ 定时任务配置
- 🔗 数据同步设置

---

## 📦 快速开始

### 安装

```bash
# 使用 Claw-CLI 安装
claw skill install openclaw-creator-setup
```

### 初始化

```bash
# 执行完整环境配置
claw skill run openclaw-creator-setup setup
```

### 验证安装

```bash
# 检查环境状态
claw skill run openclaw-creator-setup check
```

---

## 💡 使用指南

### 基础使用

```typescript
import { OpenClawCreatorSetup } from 'openclaw-creator-setup';

// 创建实例
const setup = new OpenClawCreatorSetup(context);

// 执行完整配置
await setup.setup();

// 检查环境状态
const status = await setup.check();
```

### 配置发布平台

```typescript
// 配置需要发布的平台
await setup.configurePlatforms(['wechat', 'weibo', 'xiaohongshu']);
```

### 创建工作流

```typescript
// 创建自定义工作流
await setup.createWorkflow('daily-content', {
  schedule: '0 9 * * *',
  platforms: ['wechat', 'weibo']
});
```

---

## ⚙️ 配置说明

### 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `CREATOR_PLATFORMS` | 发布平台列表 | `wechat,weibo,douyin` |
| `AUTO_PUBLISH` | 自动发布 | `false` |
| `ANALYTICS_ENABLED` | 启用数据分析 | `true` |

### 平台支持

| 平台 | 状态 | 说明 |
|------|------|------|
| 微信公众号 | ✅ 支持 | 需要公众号授权 |
| 微博 | ✅ 支持 | 需要微博开发者账号 |
| 抖音 | ✅ 支持 | 需要抖音开放平台 |
| 小红书 | 🚧 开发中 | 敬请期待 |
| B 站 | 🚧 开发中 | 敬请期待 |

---

## 🔧 命令参考

| 命令 | 参数 | 说明 | 示例 |
|------|------|------|------|
| `setup` | 无 | 执行完整环境配置 | `setup` |
| `check` | 无 | 检查环境状态 | `check` |
| `configure-platforms` | `platforms: string[]` | 配置发布平台 | `configure-platforms wechat weibo` |
| `create-workflow` | `name: string, config?: object` | 创建工作流 | `create-workflow daily-content` |

---

## 📝 使用场景

### 场景 1: 自媒体运营

快速搭建多平台内容发布环境，实现一次创作、多平台分发。

```bash
# 配置多平台
claw skill run openclaw-creator-setup configure-platforms wechat weibo douyin

# 创建发布工作流
claw skill run openclaw-creator-setup create-workflow multi-platform-publish
```

### 场景 2: 内容创作者

自动化内容生产流程，提高效率。

```bash
# 执行完整配置
claw skill run openclaw-creator-setup setup

# 创建内容日历工作流
claw skill run openclaw-creator-setup create-workflow content-calendar
```

### 场景 3: 社交媒体管理

统一管理多个社交媒体账号，定时发布。

```bash
# 配置所有平台
claw skill run openclaw-creator-setup configure-platforms wechat weibo douyin xiaohongshu

# 创建定时发布工作流
claw skill run openclaw-creator-setup create-workflow scheduled-publish
```

---

## 🐛 常见问题

### Q: 安装失败怎么办？

**A:** 检查以下几点：
1. Node.js 版本 >= 18.0.0
2. 网络连接正常
3. Claw-CLI 已正确安装

```bash
# 检查 Node.js 版本
node -v

# 更新 Claw-CLI
npm install -g claw-cli
```

### Q: 如何配置微信发布？

**A:** 运行配置命令并按提示授权：

```bash
claw skill run openclaw-creator-setup configure-platforms wechat
```

然后根据指引完成微信公众号授权。

### Q: 工作流不执行？

**A:** 检查以下几点：
1. 定时任务配置是否正确
2. 平台授权是否有效
3. 查看日志输出

```bash
# 查看详细日志
claw skill run openclaw-creator-setup check
```

### Q: 如何自定义工作流？

**A:** 参考 [工作流配置文档](./docs/workflow.md) 进行自定义配置。

---

## 🛠️ 开发贡献

### 本地开发

```bash
# 克隆仓库
git clone https://github.com/rfdiosuao/openclaw-skills.git

# 进入目录
cd openclaw-skills/openclaw-creator-setup

# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build

# 测试
npm test
```

### 发布更新

```bash
# 更新版本号
npm version patch  # 或 minor / major

# 发布到 ClawHub
claw skill publish
```

---

## 📄 许可证

MIT License - 详见 [LICENSE](./LICENSE) 文件

---

## 👨‍💻 作者

**郑宇航**
- GitHub: [@rfdiosuao](https://github.com/rfdiosuao)
- 公众号：关注获取更多 OpenClaw 教程

---

## 🙏 致谢

感谢 OpenClaw 社区和所有贡献者！

---

**最后更新:** 2026-04-09  
**版本:** v1.0.0
