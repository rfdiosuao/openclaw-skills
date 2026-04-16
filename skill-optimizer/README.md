# ⚡ Skill Optimizer

**Skill 工作区优化管理器** - 扫描、分析、优化 OpenClaw Skill 配置，确保上下文占用 ≤ 30 行/个，总占用 ≤ 600 行。

## 🎯 核心目标

> **始终让 Skill 塞入上下文最多只有 30 行，剩下的上下文留给用户聊天对话。**

## 🚀 快速开始

### 安装

```bash
claw skill install skill-optimizer
```

### 使用

```bash
# 完整扫描 + 生成报告
claw skill scan --full

# 快速分析
claw skill scan --quick

# 生成优化报告
claw skill scan --report > optimization-report.md

# 交互式优化
claw skill optimize --interactive
```

## 📊 功能特性

### 1. 全面扫描

自动扫描以下目录的所有 Skill：
- `/home/node/.openclaw/extensions/feishu-openclaw-plugin/skills/`
- `/home/node/.openclaw/workspace/skills/`
- `/home/node/.openclaw/skills/`

### 2. 智能分类

将 Skill 分为 4 类：

| 分类 | 说明 | 处理方式 |
|------|------|----------|
| **A 类** | 核心必备 | 保留，精简到 ≤30 行 |
| **B 类** | 功能合并 | 合并同类项，减少重复 |
| **C 类** | 低频可选 | 按需加载，不常驻上下文 |
| **D 类** | 可删除 | 直接清理 |

### 3. 合并建议

自动识别功能重叠的 Skill 组：

- **飞书文档组**: `create-doc` + `update-doc` + `fetch-doc` → `feishu-doc-manager`
- **飞书 IM 组**: `im-read` + `im-write` + `im-search` → `feishu-im-manager`
- **GitHub 组**: `github-integration` + `github-actions` → `github-manager`

### 4. 优化报告

生成详细的 Markdown 报告，包含：
- 当前状态统计
- 优化建议（删除/合并/精简）
- 预期效果对比
- 执行步骤清单

## 📋 输出示例

```markdown
# 📊 Skill 优化报告

## 📈 当前状态
| 指标 | 数值 |
|------|------|
| Skill 总数 | 20 个 |
| 总行数 | 3,562 行 |
| 总大小 | 156K |
| 上下文占用估算 | ~178K tokens |

## 🎯 优化方案

### 🔴 建议删除
| Skill | 行数 | 原因 |
|-------|------|------|
| skill-template | 479 行 | 模板/示例 Skill，非生产必需 |

### 🟡 建议合并
| 合并组 | 原 Skills | 新 Skill | 节省行数 |
|--------|----------|---------|----------|
| 飞书文档管理组 | create-doc + update-doc + fetch-doc | feishu-doc-manager | -600 行 |

### 🟠 需要精简
| Skill | 当前 | 目标 | 操作 |
|-------|------|------|------|
| feishu-create-doc | 719 行 | 50 行 | 精简 93% |

## ✅ 预期效果
| 指标 | 优化前 | 优化后 | 变化 |
|------|--------|--------|------|
| Skill 总数 | 20 个 | 12 个 | -8 个 |
| 总行数 | 3,562 行 | 600 行 | -2,962 行 |
| 上下文占用 | ~178K tokens | ~30K tokens | -148K tokens |
| 精简比例 | - | - | **83%** |
```

## 🔧 API 参考

### scanSkills()

扫描所有 Skill，返回详细信息数组。

```typescript
interface SkillInfo {
  name: string;
  path: string;
  lines: number;
  size: number;
  sizeFormatted: string;
  description: string;
  category: 'A' | 'B' | 'C' | 'D';
  reason: string;
}
```

### generateReport(skills: SkillInfo[])

生成优化报告。

```typescript
interface OptimizationReport {
  timestamp: string;
  totalSkills: number;
  totalLines: number;
  totalSize: number;
  skills: SkillInfo[];
  recommendations: {
    keep: SkillInfo[];
    merge: { groups: MergeGroup[] };
    remove: SkillInfo[];
    optimize: SkillInfo[];
  };
  summary: {
    afterOptimization: {
      totalSkills: number;
      totalLines: number;
      savedLines: number;
      savedPercent: number;
    };
  };
}
```

### printReport(report: OptimizationReport)

打印 Markdown 格式报告。

## 📋 30 行精简模板

优化后的 Skill 应遵循此结构：

```markdown
---
name: skill-name
description: |
  一句话描述核心功能。
  当用户提到 X、Y、Z 时使用。
---

# 核心指令

## 触发条件
- 用户提到 [关键词 1]
- 用户提到 [关键词 2]

## 执行步骤
1. 第一步（最关键）
2. 第二步（次关键）

## 注意事项
- ⚠️ 关键警告

## 参考
- 详细文档：/path/to/full-doc.md
```

## 🔄 持续优化

建议每周执行一次扫描，添加到 `HEARTBEAT.md`：

```markdown
## 每周日 03:00 执行
- [ ] Skill 扫描：`claw skill scan --report`
- [ ] 检查新增 Skill 是否必要
- [ ] 清理临时/测试 Skill
- [ ] 更新优化报告
```

## 📦 开发

```bash
# 安装依赖
npm install

# 构建
npm run build

# 测试
npm test

# 开发模式
npm run dev

# 发布到 ClawHub
npm run publish
```

## 📄 许可证

MIT License

## 🙏 贡献

Issue 和 PR 欢迎！

- GitHub: https://github.com/rfdiosuao/openclaw-skills/tree/main/skill-optimizer
- ClawHub: https://clawhub.ai/skills/skill-optimizer

---

**让每个 Skill 都精简高效，把更多上下文留给用户对话！** ⚡
