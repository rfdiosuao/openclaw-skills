---
name: skill-optimizer-rfd
description: |
  Skill 工作区优化管理器。扫描所有 Skill，引导式分析识别，推荐合并/删除/优化方案，确保 Skill 上下文占用 ≤ 30 行。

  **当以下情况时使用此 Skill**：
  (1) 需要全面扫描工作区内的所有 Skill
  (2) 需要分析哪些 Skill 占用上下文过大
  (3) 需要识别可合并的重复功能 Skill
  (4) 需要清理无用/过时的 Skill
  (5) 需要优化上下文占用，留出更多空间给用户对话
  (6) 用户提到"Skill 优化"、"上下文管理"、"Skill 清理"、"Skill 合并"
---

# Skill 优化管理器

## 🎯 核心目标

**始终让 Skill 塞入上下文最多只有 30 行，剩下的上下文留给用户聊天对话。**

## 📊 扫描维度

每次扫描分析以下指标：

| 维度 | 说明 | 权重 |
|------|------|------|
| **行数** | SKILL.md 总行数 | 高 |
| **文件大小** | 磁盘占用 | 中 |
| **使用频率** | 最近 30 天触发次数 | 高 |
| **功能重叠** | 与其他 Skill 的重复度 | 高 |
| **必要性** | 核心功能 vs 边缘功能 | 中 |
| **上下文效率** | 每行提供的价值 | 高 |

## 🔍 扫描流程

### 步骤 1：全面扫描

```bash
# 扫描所有 Skill 目录
find /home/node/.openclaw -type f -name "SKILL.md"

# 统计每个 Skill 的行数和大小
for f in $(find ...); do wc -l "$f"; done
```

### 步骤 2：分类识别

将 Skill 分为 4 类：

**A 类 - 核心必备**（保留，精简到 ≤5 行）
- 高频使用的核心功能
- 无替代方案
- 示例：feishu-channel-rules (18 行 → 5 行)

**B 类 - 功能合并**（合并同类项）
- 功能相似的 Skill
- 可整合到统一 Skill 中
- 示例：feishu-create-doc + feishu-update-doc + feishu-fetch-doc → feishu-doc-manager

**C 类 - 低频可选**（按需加载）
- 使用频率低
- 特定场景才需要
- 示例：volc-image-gen, memos-integration

**D 类 - 可删除**（直接清理）
- 过期/废弃
- 从未使用
- 功能已被替代

### 步骤 3：上下文计算

```
总上下文预算 = 模型上限（如 128K）
Skill 占用预算 = 30 行 × 平均 50 字/行 = 1.5K
用户对话预算 = 总预算 - Skill 占用
```

### 步骤 4：优化建议

输出格式：

```markdown
## 📊 Skill 优化报告

### 当前状态
- Skill 总数：20 个
- 总行数：3,562 行
- 总大小：156K
- 上下文占用：~178K tokens（估算）

### 优化方案

#### 🔴 立即处理（占用过大）
| Skill | 当前 | 目标 | 操作 |
|-------|------|------|------|
| feishu-create-doc | 719 行 | 50 行 | 精简 93% |
| skill-creator-latest | 479 行 | 30 行 | 精简 94% |
| humanizer | 437 行 | 删除 | 功能冗余 |

#### 🟡 建议合并
| 合并组 | 原 Skill | 新 Skill | 节省 |
|--------|---------|---------|------|
| 飞书文档组 | create-doc + update-doc + fetch-doc | feishu-doc-manager | 600 行 |
| 飞书 IM 组 | im-read + fetch-resource | feishu-im-manager | 100 行 |

#### 🟢 保留（已优化）
| Skill | 行数 | 理由 |
|-------|------|------|
| feishu-channel-rules | 18 行 | 核心输出规则 |
| feishu-troubleshoot | 70 行 | 问题排查必备 |

### 预期效果
- 优化后 Skill 总数：12 个
- 优化后总行数：≤600 行
- 上下文占用：≤30K tokens
- 释放空间：~148K tokens
```

## ⚡ 执行命令

### 完整扫描
```bash
~/bin/claw skill scan --full
```

### 快速分析
```bash
~/bin/claw skill scan --quick
```

### 生成优化报告
```bash
~/bin/claw skill scan --report > skill-optimization-report.md
```

### 应用优化（交互式）
```bash
~/bin/claw skill optimize --interactive
```

## 🎯 精简原则

### 30 行精简模板

每个 Skill 精简后应遵循此结构：

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
- 需要 [功能场景]

## 执行步骤
1. 第一步（最关键）
2. 第二步（次关键）
3. 第三步（如有必要）

## 注意事项
- ⚠️ 关键警告 1
- ⚠️ 关键警告 2

## 参考
- 详细文档：/path/to/full-doc.md
```

## 📋 检查清单

优化完成后检查：

- [ ] 所有 Skill 总行数 ≤ 600 行
- [ ] 单个 Skill ≤ 50 行（核心 Skill 可放宽到 100 行）
- [ ] 无功能重复的 Skill
- [ ] 已删除过期/废弃 Skill
- [ ] 低频 Skill 已标记为"按需加载"
- [ ] 每个 Skill 都有清晰的触发条件
- [ ] 保留了所有核心功能

## 🔄 持续优化

建议每周执行一次扫描：

```bash
# 添加到 HEARTBEAT.md
每周日 03:00 执行：
- ~/bin/claw skill scan --report
- 检查新增 Skill 是否必要
- 清理临时/测试 Skill
```
