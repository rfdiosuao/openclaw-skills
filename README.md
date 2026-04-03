# OpenClaw Skills

> 🤖 OpenClaw Skill 开发专家 - 专注 Skill 创造与 ClawHub 云端分发

[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Skills](https://img.shields.io/badge/skills-12-blue.svg)](https://clawhub.ai/skills)

---

## 📚 已发布 Skills

| Skill 名称 | 版本 | 说明 | 安装命令 |
|------------|------|------|----------|
| **kie-nano-banana-pro** | 1.0.0 | Kie AI Nano Banana Pro 生图 - Google 图像生成 API 集成 | `clawhub install kie-nano-banana-pro` |
| **nanobanana-pro-prompt-master** | 1.1.0 | NanobananaPro 生图大师 - 专业级 AI 生图提示词生成系统 | `clawhub install nanobanana-pro-prompt-master` |
| feishu-new-chat | 1.0.0 | 飞书快捷发起新对话 | `clawhub install feishu-new-chat` |
| care-taker | 1.0.0 | 智能关怀助手 | `clawhub install care-taker` |
| feishu-multi-agent-manager | 1.0.0 | 飞书多 Agent 配置助手 | `clawhub install feishu-multi-agent-manager` |
| feishu-ai-coding-assistant | 1.0.0 | AI 编程助手 | `clawhub install feishu-ai-coding-assistant` |
| openclaw-security-guard | 1.0.0 | 安全审计助手 | `clawhub install openclaw-security-guard` |
| video-summarizer | 1.0.0 | 视频文案总结 | `clawhub install video-summarizer` |
| file-persistence-writer | 1.0.0 | 持久化文件写入 | `clawhub install file-persistence-writer` |
| openclaw-mutual-repair | 1.0.0 | 双 Agent 互修 | `clawhub install openclaw-mutual-repair` |
| web-reverse-debugger | 1.0.0 | 网页逆向调试 | `clawhub install web-reverse-debugger` |

---

## 🎯 核心能力

### 飞书集成
- 飞书新对话发起
- 飞书多 Agent 管理
- 飞书任务/日历/文档集成

### AI 生图/视频
- **NanobananaPro 生图大师** - 专业级 AI 生图提示词生成
  - 50+ 大师级风格库
  - 10 种基础运镜 +6 种进阶组合
  - 10 列标准化分镜模板
  - 实战案例库（年兽/剑来/武松打虎）

### 运维工具
- 双机互修助手
- 安全审计助手
- 文件持久化写入

### 开发工具
- AI 编程助手
- 网页逆向调试
- 视频文案总结

---

## 🚀 快速开始

### 1. 安装 ClawHub CLI

```bash
npm install -g @openclaw/cli
```

### 2. 登录 ClawHub

```bash
claw login --token <your_token>
```

### 3. 安装 Skill

```bash
clawhub install <skill-name>
```

### 4. 查看已安装 Skills

```bash
claw skill list
```

---

## 📦 开发新 Skill

### 克隆仓库

```bash
git clone https://github.com/rfdiosuao/openclaw-skills.git
cd openclaw-skills
```

### 复制模板

```bash
cp -r skill-template my-new-skill
```

### 修改配置

```bash
cd my-new-skill
# 编辑 SKILL.md, skill.json, package.json, src/index.ts
```

### 编译发布

```bash
npm install && npm run build
claw skill publish
```

---

## 📁 项目结构

```
my-skill/
├── SKILL.md                          # ClawHub 格式说明（核心指令）
├── skill.json                        # Skill 元数据
├── package.json                      # NPM 配置
├── tsconfig.json                     # TypeScript 配置
├── README.md                         # 完整文档
├── src/
│   └── index.ts                      # 主入口
├── tests/
│   └── index.test.ts                 # 单元测试
├── references/                       # 知识库（可选）
│   ├── style-library.md              # 风格库
│   ├── prompt-templates.md           # 提示词模板
│   └── negative-prompts.md           # 负面词库
└── .gitignore
```

---

## 📊 开发指标

| 指标 | 目标值 | 当前值 |
|------|--------|--------|
| 新增 Skills | 2-4 个/月 | 12 个 ✅ |
| 发布成功率 | > 99% | 100% ✅ |
| 测试覆盖率 | > 80% | 进行中 |
| Issue 响应 | < 24h | 进行中 |

---

## 🛠️ 常见问题

### 问题 1：clawhub install 失败

**检查项：**
- 确认已登录 ClawHub：`claw whoami`
- 检查网络连接
- 验证 Skill 名称正确
- 查看错误日志

### 问题 2：配置飞书 Bot 时报错

**错误：** `messageContains key 不存在`

**原因：** 飞书插件版本与 OpenClaw 版本不匹配

**解决方案：**
1. 检查 OpenClaw 版本：`openclaw --version`
2. 更新到最新版本：`npm update -g @openclaw/core`
3. 使用 `textContains` 替代 `messageContains`

### 问题 3：发布失败

**错误：** `Slug is already taken`

**解决方案：**
- 修改 `skill.json` 中的 `name` 字段，使用唯一 slug
- 例如：`nanobanana-pro` → `nanobanana-pro-prompt-master`

---

## 🔗 相关链接

- [OpenClaw 官方文档](https://docs.openclaw.ai)
- [ClawHub 市场](https://clawhub.ai/skills)
- [Discord 社区](https://discord.com/invite/clawd)
- [GitHub 仓库](https://github.com/rfdiosuao/openclaw-skills)

---

## 📝 更新日志

### v1.1.0 (2026-04-03)
- ✨ **NanobananaPro 生图大师 v1.1** - 整合 AI 视频知识库实战案例
  - 新增镜头语言完整体系（10 种基础 +6 种进阶）
  - 新增 10 列标准化分镜模板（年兽案例）
  - 新增 3D 国漫玄幻/古典名著风格
  - 整合 4 个实战案例（年兽/剑来/武松/凡人）

### v1.0.0 (2026-04-03)
- ✨ **NanobananaPro 生图大师 v1.0** - 初始版本发布
  - 50+ 大师级风格库
  - 15+ 场景提示词模板
  - 7 类负面提示词库
  - 完整平台规格说明

### 2026-03-14
- 📦 仓库初始化
- 🎯 发布多个基础 Skills

---

## 🤝 贡献

欢迎提交 Issue 和 PR！

- **GitHub Issues:** https://github.com/rfdiosuao/openclaw-skills/issues
- **Discord:** https://discord.com/invite/clawd
- **ClawHub 论坛:** https://clawhub.ai/forum

---

## 📄 许可

MIT License

---

**作者：** 郑宇航 (OpenClaw Skill Master)  
**GitHub:** [@rfdiosuao](https://github.com/rfdiosuao)  
**最后更新：** 2026-04-03
