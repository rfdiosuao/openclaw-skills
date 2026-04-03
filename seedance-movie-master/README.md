# Seedance 2.0 电影级漫剧生成大师

> 🎬 融合好莱坞工业标准 × Seedance 2.0 专属多模态控制能力的电影级漫剧视频生成工具

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://clawhub.ai)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Seedance](https://img.shields.io/badge/Seedance-2.0-purple.svg)](https://www.volcengine.com/docs/82379)

---

## 📖 目录

- [简介](#-简介)
- [核心能力](#-核心能力)
- [快速开始](#-快速开始)
- [命令系统](#-命令系统)
- [6 阶权重提示词](#-6 阶权重提示词)
- [使用示例](#-使用示例)
- [配置说明](#-配置说明)
- [API 参考](#-api-参考)
- [故障排查](#-故障排查)

---

## 🎯 简介

**Seedance 2.0 电影级漫剧生成大师** 是专为火山引擎 Seedance 2.0 模型深度优化的视频生成工具，提供从故事构思到成片输出的全流程创作能力。

### 与传统 AI 视频工具对比

| 维度 | 传统 AI 视频 | 本 Skill |
|------|-------------|---------|
| 角色一致性 | 容易变脸 | ✅ DNA 锁定 + 参考图约束 |
| 镜头控制 | 模糊描述 | ✅ 毫秒级时间线拆解 |
| 提示词工程 | 自由文本 | ✅ 6 阶权重结构 |
| 多模态融合 | 单模态 | ✅ 9 图 +3 视频 +3 音频 |
| 音画同步 | 后期合成 | ✅ 原生双声道生成 |

---

## ✨ 核心能力

### 1️⃣ 全流程创作能力
```
故事构思 → 剧本撰写 → 分镜设计 → 角色设定 → 场景构建 
→ 动作编排 → 镜头语言 → 色彩调色 → 音效配乐 → 成片输出
```

### 2️⃣ Seedance 专属优化
- **@标签引用系统** - 精确锁定参考素材
- **6 阶权重提示词** - 严格遵循 Seedance 模型优先级
- **角色 DNA 档案** - 跨镜头 100% 一致性保障
- **毫秒级动作拆解** - 0.0-2.5s/2.5-5.0s 精确控制
- **原生音画同步** - 5 层音轨自动生成

### 3️⃣ 电影级质量标准
| 指标 | 标准 |
|------|------|
| 分辨率 | 4K 3840×2160（支持 8K） |
| 帧率 | 60fps（关键动作 120fps） |
| 色彩 | Rec.2020 广色域，HDR10+ |
| 光影 | 好莱坞三点布光，体积光，光线追踪 |
| 时长 | 单镜头 4-10 秒（超 10 秒自动分段） |

---

## 🚀 快速开始

### 1. 安装 Skill

```bash
# 从 ClawHub 安装
claw skill install seedance-movie-master-v1

# 或本地安装
cd ~/openclaw-skills/seedance-movie-master
npm install
npm run build
```

### 2. 配置 API Key

```bash
# 方式 1：环境变量（推荐）
export VOLCENGINE_ARK_API_KEY="your-api-key-here"

# 方式 2：在 TOOLS.md 中配置
echo 'export VOLCENGINE_ARK_API_KEY="your-key"' >> ~/.openclaw/workspace/TOOLS.md
source ~/.bashrc
```

**获取 API Key:** [火山引擎 Ark 平台](https://console.volcengine.com/ark)

### 3. 使用命令

```bash
# 完整项目一键生成
/seedance-project "赛博朋克武侠：机械剑客在霓虹长安城复仇" \
  --type 武侠/科幻 \
  --style 赛博朋克国漫 \
  --episodes 3

# 单独生成视频
/seedance-generate "第一人称视角，机械剑客拔剑，剑身反射霓虹灯光" \
  --ratio 16:9 \
  --duration 8 \
  --watermark false
```

---

## 🎛️ 命令系统

| 命令 | 功能 | 输入 | 输出 |
|------|------|------|------|
| `/seedance-story` | 故事规划 | 主题/类型 | 大纲 + 人物 + 世界观 |
| `/seedance-character` | 角色设定 | 角色名/特征 | DNA 档案 + 参考图 |
| `/seedance-storyboard` | 分镜设计 | 剧本/场景 | 分镜表格 + 镜头列表 |
| `/seedance-prompt` | 提示词生成 | 镜头描述 | 6 阶结构提示词 |
| `/seedance-generate` | 视频生成 | 提示词 + 素材 | 视频 URL+ 音频 URL |
| `/seedance-project` | 完整项目 | 故事创意 | 全套制作方案 |

### 命令详解

#### 1. `/seedance-story` - 故事规划

```bash
/seedance-story <主题> [选项]

选项:
  --type <类型>       悬疑/武侠/奇幻/科幻/校园
  --style <风格>      赛博朋克/国漫/日系/美漫
  --episodes <集数>   默认 1
  --duration <分钟>   单集时长，默认 10
```

#### 2. `/seedance-character` - 角色设定

```bash
/seedance-character <角色名> [选项]

选项:
  --age <年龄>        成年/少年/儿童
  --gender <性别>     男/女
  --personality <性格> 坚强，勇敢，正义
  --abilities <能力>  剑术，魔法，轻功
  --backstory <背景>  角色背景故事
```

#### 3. `/seedance-generate` - 视频生成

```bash
/seedance-generate <提示词> [选项]

选项:
  --images <URL 数组>    参考图片，逗号分隔
  --video <URL>          参考视频
  --audio <URL>          参考音频
  --ratio <比例>         16:9/9:16/1:1/4:3/3:4
  --duration <秒数>      5-30 秒
  --generate-audio <布尔> 是否生成音频
  --watermark <布尔>     是否添加水印
```

---

## 🎨 6 阶权重提示词

### 权重结构

| 阶数 | 维度 | 权重 | 说明 |
|------|------|------|------|
| Stage 1 | **主体** | 1.5 | 核心角色/物体 |
| Stage 2 | **动作** | 1.3 | 具体行为/运动 |
| Stage 3 | **场景** | 1.2 | 环境/背景 |
| Stage 4 | **镜头** | 1.1 | 视角/运镜 |
| Stage 5 | **光影** | 1.0 | 光线/色彩 |
| Stage 6 | **风格** | 0.9 | 艺术风格 |

### 示例

**输入:**
```
第一人称视角，机械剑客拔剑，剑身反射霓虹灯光，雨水打在剑刃上
```

**6 阶分解:**
```
Stage 1 [主体 1.5]: 机械剑客，剑
Stage 2 [动作 1.3]: 拔剑，雨水打
Stage 3 [场景 1.2]: 霓虹长安城，雨夜
Stage 4 [镜头 1.1]: 第一人称视角，特写镜头
Stage 5 [光影 1.0]: 霓虹灯光反射，雨水光泽
Stage 6 [风格 0.9]: 赛博朋克国漫，电影级质感
```

**加权输出:**
```
(机械剑客，剑:1.5), (拔剑，雨水打:1.3), (霓虹长安城，雨夜:1.2), 
(第一人称视角，特写镜头:1.1), (霓虹灯光反射，雨水光泽:1.0), 
(赛博朋克国漫，电影级质感:0.9)
```

---

## 💡 使用示例

### 示例 1: 完整项目

```bash
/seedance-project "赛博朋克武侠：机械剑客在霓虹长安城复仇" \
  --type 武侠/科幻 \
  --style 赛博朋克国漫 \
  --episodes 3 \
  --duration 5
```

### 示例 2: 角色设定

```bash
/seedance-character "李玄风" \
  --age 成年 \
  --gender 男 \
  --personality "冷静，果断，重情义" \
  --abilities "机械剑术，轻功，黑客技术" \
  --backstory "前朝禁军教头，被陷害后改造为机械剑客"
```

### 示例 3: 分镜设计

```bash
/seedance-storyboard "第 1 集开场：霓虹长安城全景，雨夜，机械剑客登场" \
  --scenes 5 \
  --style 赛博朋克国漫
```

### 示例 4: 提示词生成

```bash
/seedance-prompt "机械剑客在雨中拔剑，剑身反射霓虹灯光，雨水打在剑刃上溅起水花" \
  --shotType 特写 \
  --cameraAngle 仰视 \
  --cameraMovement 推
```

### 示例 5: 视频生成

```bash
/seedance-generate "(机械剑客:1.5), (拔剑:1.3), (霓虹长安城雨夜:1.2), (特写镜头仰视:1.1), (霓虹灯光反射:1.0), (赛博朋克国漫:0.9)" \
  --ratio 16:9 \
  --duration 8 \
  --watermark false
```

---

## ⚙️ 配置说明

### 环境变量

| 变量 | 说明 | 必填 |
|------|------|------|
| `VOLCENGINE_ARK_API_KEY` | 火山引擎 Ark API Key | ✅ |

### 可选配置

在 `skill.json` 中配置：

```json
{
  "config": {
    "defaultRatio": "16:9",
    "defaultDuration": 8,
    "baseUrl": "https://ark.cn-beijing.volces.com/api/v3"
  }
}
```

---

## 🔧 API 参考

### 提交任务

```bash
curl -X POST https://ark.cn-beijing.volces.com/api/v3/contents/generations/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "model": "doubao-seedance-2-0-260128",
    "content": [...],
    "generate_audio": true,
    "ratio": "16:9",
    "duration": 8,
    "watermark": false
  }'
```

### 查询状态

```bash
curl -X GET https://ark.cn-beijing.volces.com/api/v3/contents/generations/tasks/{task_id} \
  -H "Authorization: Bearer YOUR_API_KEY"
```

---

## 🐛 故障排查

### 常见问题

**Q: 提示"缺少 API Key"**
```bash
# 检查环境变量
echo $VOLCENGINE_ARK_API_KEY

# 重新加载配置
source ~/.bashrc
```

**Q: 任务一直处于 pending 状态**
- 检查网络连接
- 确认 API Key 有效
- 查看火山引擎控制台配额

**Q: 角色一致性不好**
- 使用角色 DNA 锁定关键词
- 提供参考图
- 在提示词中强调角色特征

**Q: 生成失败**
- 检查提示词是否违规
- 确认参考素材 URL 可访问
- 查看错误详情

---

## 📝 更新日志

### v1.0.0 (2026-04-03)
- ✅ 初始版本发布
- ✅ 6 阶权重提示词引擎
- ✅ 角色 DNA 管理系统
- ✅ 故事规划器（三幕式结构）
- ✅ 分镜设计工具
- ✅ 完整命令系统（6 个命令）
- ✅ 多模态输入支持
- ✅ 任务轮询机制

---

## 📄 许可证

MIT License

---

## 👤 作者

**郑宇航** - OpenClaw Skill 大师

- GitHub: https://github.com/rfdiosuao/openclaw-skills
- 项目：OpenClaw Skill 大师培训体系

---

## 🔗 相关链接

- [火山引擎 Ark 平台](https://console.volcengine.com/ark)
- [Seedance 2.0 文档](https://www.volcengine.com/docs/82379)
- [OpenClaw 文档](https://docs.openclaw.ai)
- [ClawHub](https://clawhub.ai)
- [GitHub 仓库](https://github.com/rfdiosuao/openclaw-skills)

---

*最后更新：2026-04-03*
