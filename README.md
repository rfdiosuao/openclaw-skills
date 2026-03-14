# OpenClaw Skills

> OpenClaw Skills - 从零开发到 ClawHub 发布

🤖 **OpenClaw Skill 开发专家** - 专注 Skill 创造与 ClawHub 云端分发

---

## 📦 已发布 Skills

| Skill 名称 | 版本 | 说明 | 安装命令 |
|-----------|------|------|----------|
| **feishu-new-chat** | 1.0.0 | 飞书快捷发起新对话 | `clawhub install feishu-new-chat` |
| **care-taker** | 1.0.0 | 智能关怀助手 | `clawhub install care-taker` |
| **feishu-multi-agent-manager** | 1.0.0 | 飞书多 Agent 配置助手 | `clawhub install feishu-multi-agent-manager` |
| **feishu-ai-coding-assistant** | 1.0.0 | AI 编程助手 | `clawhub install feishu-ai-coding-assistant` |
| **openclaw-security-guard** | 1.0.0 | 安全审计助手 | `clawhub install openclaw-security-guard` |
| **video-summarizer** | 1.0.0 | 视频文案总结 | `clawhub install video-summarizer` |
| **file-persistence-writer** | 1.0.0 | 持久化文件写入 | `clawhub install file-persistence-writer` |
| **openclaw-mutual-repair** | 1.0.0 | 双 Agent 互修 | `clawhub install openclaw-mutual-repair` |
| **web-reverse-debugger** | 1.0.0 | 网页逆向调试 | `clawhub install web-reverse-debugger` |

---

## 🚀 快速开始

### 1. 安装 Claw-CLI

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

### 4. 查看已安装

```bash
claw skill list
```

---

## 📚 文档

- [OpenClaw 官方文档](https://docs.openclaw.ai)
- [ClawHub 市场](https://clawhub.ai/skills)
- [Discord 社区](https://discord.com/invite/clawd)

---

## 🛠️ 开发指南

### 创建新 Skill

```bash
# 克隆仓库
git clone https://github.com/rfdiosuao/openclaw-skills.git
cd openclaw-skills

# 复制模板
cp -r skill-template my-new-skill

# 修改配置
cd my-new-skill
# 编辑 SKILL.md, skill.json, package.json, src/index.ts

# 编译
npm install && npm run build

# 发布
claw skill publish
```

### 项目结构

```
my-skill/
├── SKILL.md          # ClawHub 格式说明
├── skill.json        # Skill 元数据
├── package.json      # NPM 配置
├── tsconfig.json     # TypeScript 配置
├── README.md         # 完整文档
├── src/
│   └── index.ts      # 主入口
├── tests/
│   └── index.test.ts # 单元测试
└── .gitignore
```

---

## 📊 开发进度

### 2026-03 目标

| 指标 | 目标值 | 当前值 |
|------|--------|--------|
| 新增 Skills | 2-4 个 | 9 个 ✅ |
| 发布成功率 | >99% | 100% ✅ |
| 测试覆盖率 | >80% | 进行中 |
| Issue 响应 | <24h | 进行中 |

---

## 🔧 常见问题

### Q1: messageContains key 不存在

**问题：** 配置飞书 Bot 时提示 `messageContains` key 不存在

**原因：** 飞书插件版本与 OpenClaw 版本不匹配

**解决方案：**

1. 检查 OpenClaw 版本：
```bash
openclaw --version
```

2. 更新到最新版本：
```bash
npm update -g @openclaw/core
```

3. 检查飞书插件配置：
```json
{
  "match": {
    "messageContains": ["关键词"]
  }
}
```

4. 如果仍报错，使用 `textContains` 替代：
```json
{
  "match": {
    "textContains": ["关键词"]
  }
}
```

### Q2: Skill 安装失败

**检查项：**

1. 确认已登录 ClawHub
2. 检查网络连接
3. 验证 Skill 名称正确
4. 查看错误日志

---

## 📞 支持

- **GitHub Issues:** https://github.com/rfdiosuao/openclaw-skills/issues
- **Discord:** https://discord.com/invite/clawd
- **ClawHub 论坛:** https://clawhub.ai/forum

---

## 👨‍💻 作者

**郑宇航** - OpenClaw Skill 大师

- GitHub: [@rfdiosuao](https://github.com/rfdiosuao)
- ClawHub: OpenClaw Skill Master

---

## 📄 许可证

MIT License

---

**最后更新：** 2026-03-14  
**当前版本：** v2026.3.14
