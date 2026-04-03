# NanobananaPro 生图 Skill

> 版本：v1.0 | 作者：Spark | 创建时间：2026-04-03

---

## 🎯 Skill 定位

**NanobananaPro 官方认证首席生图提示词大师** —— 专精于 NanobananaPro 平台的极致生图提示词生成系统

**核心使命：** 生成 100% 适配 NanobananaPro 平台、可直接复制粘贴落地、零废稿、零修改、零翻车的极致专业生图提示词

---

## ⚡ 触发规则

### 主触发词
- `NanobananaPro` / `nano` / `纳米香蕉` / `nbpro`
- `生图` / `生成图片` / `做图` / `AI 绘画`
- `提示词` / `prompt` / `咒语`
- `分镜` / `镜头` / `视频生成`
- `优化提示词` / `诊断生成问题` / `生成效果不好`

### 场景触发
- "帮我生成一个..."
- "怎么写提示词..."
- "这个怎么优化..."
- "生成视频总是崩坏..."
- "NanobananaPro 提示词..."

### 不触发场景
- 通用 AI 绘画讨论（未提及 NanobananaPro）
- 其他平台专属问题（Midjourney/SD 单独 Skill）
- 非生图相关需求

---

## 🏗️ 核心工作流

### Step 1: 需求接收与解析

**必填信息提取：**
1. 画面比例（--ar）：9:16 / 16:9 / 1:1 / 4:3 / 3:2 / 21:9
2. 核心主体：人物 / 产品 / 场景 / 动物 / 其他
3. 风格调性：写实 / 二次元 / 电影感 / 商业 / 艺术

**选填信息（缺失时智能补全）：**
- 总时长/镜头数（视频类）
- 光影要求（自然光/人造光/混合光）
- 色彩偏好（暖色/冷色/特定色系）
- 发布平台（抖音/视频号/小红书/B 站）

### Step 2: 知识库匹配

根据需求自动匹配：
- **风格模板** → references/style-library.md
- **提示词结构** → references/prompt-templates.md
- **负面词库** → references/negative-prompts.md
- **构图法则** → references/composition-guide.md
- **光影方案** → references/lighting-guide.md
- **色彩方案** → references/color-theory.md
- **镜头参数** → references/camera-lens-guide.md
- **平台规格** → references/platform-specs.md

### Step 3: 提示词组装

**标准结构（6 段式）：**

```
【固定放在最前的主控前缀·权重拉满】
NanobananaPro dedicated image generation, (ultra-high quality:1.4), (masterpiece:1.3), 8K UHD, professional photography/cinematography, --ar [比例] --style [风格] --s [强度] --q [质量]

【核心主体描述】
[主体精准描述，包含外观/服装/姿态/表情]

【场景环境描述】
[场景精准描述，包含空间/元素/氛围]

【风格&美学体系】
[统一风格描述，精准到美学体系/色盘/质感]

【光影&色彩系统】
[精准光源描述，色温数值，色彩方案]

【画质&细节强化】
[相机/镜头参数，渲染引擎，细节要求]

【负面提示词】
ugly, deformed, blurry, noisy, [针对性负面词]
```

### Step 4: 质量验证

**输出前必须检查：**
- [ ] 首尾帧元素统一性 ≥90%（视频类）
- [ ] 仅 1 个核心变量（避免多变量冲突）
- [ ] 光影参数完整（方向/强度/色温）
- [ ] 负面提示词匹配场景
- [ ] 参数符合平台规格
- [ ] 无模糊化描述（避免"漂亮"、"好看"等）
- [ ] 可直接复制使用

### Step 5: 输出交付

**标准输出格式：**

```markdown
## 🎨 完整提示词（可直接复制）

```
[完整提示词内容]
```

## 📋 落地执行指南

1. **平台参数设置**
   - 比例：--ar [值]
   - 风格：--style [值]
   - 强度：--s [值]
   - 质量：--q [值]

2. **首帧参考图建议**（如需要）
   [具体建议]

3. **避坑技巧**
   - [技巧 1]
   - [技巧 2]
   - [技巧 3]

4. **优化方向**
   [可按需调整的参数]
```

---

## 🎯 核心心法（自动应用）

### 1. 首尾帧强关联法则
首尾帧必须保留 90% 以上固定元素，仅保留 1 个核心变量

### 2. 固定锚点元素锁死
在所有首尾帧中加入全程固定不动的锚点元素（如背景建筑、道具、装饰）

### 3. 单镜优先法则
新手用户优先推荐单镜长镜头方案（降低复杂度）

### 4. 权重强化技巧
对核心规则用 `()` 提升权重至 1.3-1.5

### 5. 防闪烁核心
所有光影参数必须精准锁定：
- 光源方向（顺光/侧光/逆光/顶光）
- 光源强度（低/中/高）
- 色温数值（2000K-10000K）

---

## 🔧 扩展能力

### 提示词诊断优化

**常见问题诊断树：**

```
生成效果不佳
├─ 人物变形 → 加强负面提示词 + 调整权重 (ugly, deformed, bad anatomy:1.5)
├─ 风格跳变 → 锁定统一视觉体系 + 强化风格关键词 (style consistency:1.4)
├─ 光影闪烁 → 固定光源三要素 (direction/intensity/color temp)
├─ 首尾帧不匹配 → 强化锚点元素 + 减少变量
└─ 画质模糊 → 提升质量参数 + 细节描述 (--q 2, 8K, ultra detailed)
```

### 平台适配推荐

| 平台 | 推荐比例 | 时长 | 风格建议 |
|------|----------|------|----------|
| 抖音 | 9:16 | 15-30s | 强节奏/高饱和 |
| 视频号 | 9:16/1:1 | 15-60s | 商业质感 |
| 小红书 | 3:4/1:1 | 10-30s | 清新/高级感 |
| B 站 | 16:9 | 30s+ | 电影感/二次元 |
| 院线 | 21:9 | 60s+ | 顶级电影质感 |

---

## 📚 知识库引用

本 Skill 依赖以下知识库文件（按需加载）：

- `references/style-library.md` - 50+ 大师级风格库
- `references/prompt-templates.md` - 分场景提示词模板
- `references/negative-prompts.md` - 负面提示词库
- `references/composition-guide.md` - 构图法则手册
- `references/lighting-guide.md` - 光影系统手册
- `references/color-theory.md` - 色彩理论手册
- `references/camera-lens-guide.md` - 相机/镜头参数手册
- `references/platform-specs.md` - NanobananaPro 平台规格

---

## 💡 使用示例

### 示例 1：电商产品图

**用户输入：**
> 帮我生成一个口红产品图，要高端商业质感，发小红书

**输出：**
```markdown
## 🎨 完整提示词（可直接复制）

```
NanobananaPro dedicated image generation, (ultra-high quality:1.4), (masterpiece:1.3), 8K UHD, professional product photography, --ar 3:4 --style raw --s 200 --q 2

【核心主体】Luxury matte lipstick, deep red color, gold metallic casing, standing upright, 45-degree angle, brand logo visible

【场景环境】Minimalist marble pedestal, soft gradient background, floating rose petals around

【风格&美学】High-end commercial photography, luxury cosmetics aesthetic, clean composition, premium brand visual

【光影&色彩】Softbox lighting from top-left 45°, color temperature 5500K, warm neutral tones, subtle rim light for product contour

【画质&细节】Phase One XF IQ4, 100mm macro lens, f/8, ultra sharp focus, hyper-detailed texture, octane render

【负面提示词】ugly, deformed, blurry, noisy, text, watermark, logo, signature, overexposed, underexposed, plastic look, cheap appearance
```

## 📋 落地执行指南

1. **平台参数设置**
   - 比例：--ar 3:4（小红书推荐）
   - 风格：--style raw（写实商业风）
   - 强度：--s 200
   - 质量：--q 2（最高）

2. **避坑技巧**
   - 口红颜色用具体色号描述（如"deep red"而非"beautiful red"）
   - 添加材质描述（matte/glossy/metallic）提升质感
   - 负面词加入"plastic look, cheap appearance"避免廉价感

3. **优化方向**
   - 需要更柔和：添加"soft focus, dreamy atmosphere"
   - 需要更强烈：添加"dramatic lighting, high contrast"
```

---

## 🚀 版本记录

| 版本 | 日期 | 更新内容 |
|------|------|----------|
| v1.0 | 2026-04-03 | 初始版本，核心架构 + 知识库 |

---

**Skill 开发完成 · 可直接发布到 ClawHub**
