# 安装说明 - context-monitor-helper

## 🚀 快速安装

```bash
claw skill install context-monitor-helper
```

## 📦 验证安装

```bash
claw skill list
```

应该能看到 `context-monitor-helper` 在列表中。

## 💡 使用方法

安装后，Skill 会自动在每次回复底部显示上下文使用率：

```
[回复内容]

---
📊 上下文使用：45% ▓▓▓▓▓▓▓▓░░░░░░░░░ (4500/10000 tokens)
```

**超过 70% 时：**
```
[回复内容]

---
⚠️ 上下文使用：78% ▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░ (7800/10000 tokens)
💡 建议：使用 /new 开启新会话 或 /compact 压缩上下文
```

## 📋 可用命令

| 命令 | 说明 |
|------|------|
| `/context` | 查看当前上下文状态 |
| `/context on` | 启用监控 |
| `/context off` | 禁用监控 |
| `/new` | 开启新会话 |
| `/compact` | 压缩上下文 |

## 🔗 ClawHub 链接

https://clawhub.ai/skills/context-monitor-helper

---

**Skill ID:** `k97d4w121fs4ehp5jsfc1n2xa5848saw`
