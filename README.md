# OpenClaw Skills 🦞

> 从零开发到 ClawHub 发布 —— OpenClaw Skill 大师的实战基地

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![ClawHub](https://img.shields.io/badge/ClawHub-published-blue)](https://clawhub.ai)

---

## 📚 关于本项目

本仓库是 **OpenClaw Skill 大师** 的官方 Skills 发布仓库，包含：

- 🛠️ 自主开发的 OpenClaw Skills
- 📦 完整的版本管理与 Release 发布
- 🚀 ClawHub 云端分发
- 📖 标准化文档与使用指南

---

## 🎯 培训体系

本仓库遵循 **OpenClaw Skill 大师培训体系**：

| 阶段 | 内容 | 状态 |
|------|------|------|
| 1 | 基础认知手册 | ✅ 已完成 |
| 2 | 核心技能手册 | ✅ 已完成 |
| 3 | 工作流图谱 | ✅ 已完成 |
| 4 | 实战部署手册 | ✅ 已完成 |
| 5 | 自主进化引擎 | ✅ 已完成 |

---

## 📦 已发布 Skills

### ClawHub 可安装

| Skill | 版本 | 描述 | ClawHub |
|-------|------|------|---------|
| feishu-new-chat | v0.1.1 | 飞书话题创建工具 | ✅ 已发布 |
| care-taker | v1.0.0 | AI 宠物养成游戏 | ✅ 已发布 |

### 开发中

| Skill | 预计版本 | 描述 | 状态 |
|-------|----------|------|------|
| skill-template | v1.0.0 | Skill 开发模板 | 🚧 模板就绪 |

---

## 🚀 快速开始

### 从 ClawHub 安装

```bash
openclaw skills install <skill-name>
```

### 本地开发

```bash
# 克隆仓库
git clone https://github.com/rfdiosuao/openclaw-skills.git
cd openclaw-skills

# 复制模板创建新 Skill
cp -r skill-template my-new-skill
cd my-new-skill

# 安装依赖
npm install

# 构建和测试
npm run build
npm test
```

---

## 🛠️ 开发流程

```
1. 复制模板 → cp -r skill-template my-skill
2. 修改配置 → 编辑 skill.json, package.json
3. 编写代码 → src/index.ts
4. 安装依赖 → npm install
5. 构建测试 → npm run build && npm test
6. Git 提交 → git add/commit/push
7. GitHub Release → API 创建
8. ClawHub 发布 → API 上传
```

---

## 📋 核心职责与指标

| 职责 | 说明 | 关键指标 |
|------|------|----------|
| **Skill 开发** | 从零开发新 Skill | 每月 2-4 个 |
| **版本管理** | GitHub 仓库维护 | Release 及时率 100% |
| **云端发布** | ClawHub 上传分发 | 发布成功率 > 99% |
| **质量管控** | 测试与文档 | 测试覆盖率 > 80% |
| **用户支持** | Issue 响应 | 响应时间 < 24h |

---

## 🔄 自主进化引擎

本仓库遵循 **五大进化闭环机制**：

1. **自我复盘** - 每日 02:00 自动复盘
2. **技能迭代** - 根据反馈持续优化
3. **知识更新** - 每周扫描官方文档
4. **环境适应** - 实时监控 API 状态
5. **目标升级** - 月度评估与目标调整

---

## 🔐 安全配置

- ✅ GitHub Token 细粒度权限（repo + workflow）
- ✅ 密钥 90 天强制轮换
- ✅ 无硬编码密钥
- ✅ 所有操作留痕

---

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

---

## 🔗 相关链接

- [OpenClaw 官方文档](https://docs.openclaw.ai)
- [ClawHub 技能市场](https://clawhub.ai)
- [Skill 大师培训体系](https://www.feishu.cn/docx/NHQBdkoXEo6FuGxJdBPcJaS8nOj)

---

**维护者：** [@rfdiosuao](https://github.com/rfdiosuao)  
**最后更新：** 2026-03-09
