# Seedance 2.0 电影级漫剧生成大师

> 🎬 融合好莱坞工业标准 × Seedance 2.0 专属多模态控制能力的电影级漫剧视频生成工具

## 🎯 定位

专为 **火山引擎 Seedance 2.0** 深度优化的电影级漫剧视频生成工具，提供从故事构思到成片输出的全流程创作能力。

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

## 🎛️ 命令系统

| 命令 | 功能 | 输入 | 输出 |
|------|------|------|------|
| `/seedance-story` | 故事规划 | 主题/类型 | 大纲 + 人物 + 世界观 |
| `/seedance-character` | 角色设定 | 角色名/特征 | DNA 档案 + 参考图提示词 |
| `/seedance-storyboard` | 分镜设计 | 剧本/场景 | 分镜表格 + 镜头列表 |
| `/seedance-prompt` | 提示词生成 | 镜头描述 | 6 阶结构提示词 |
| `/seedance-generate` | 视频生成 | 提示词 + 素材 | 视频 URL+ 音频 URL |
| `/seedance-project` | 完整项目 | 故事创意 | 全套制作方案 |

## 🚀 快速开始

### 安装
```bash
claw skill install seedance-movie-master
```

### 配置
```bash
export VOLCENGINE_ARK_API_KEY="your-api-key-here"
```

### 示例
```bash
# 完整项目一键生成
/seedance-project "赛博朋克武侠：机械剑客在霓虹长安城复仇" \
  --type 武侠/科幻 \
  --style 赛博朋克国漫 \
  --episodes 3 \
  --duration 5

# 单独生成视频
/seedance-generate "第一人称视角，机械剑客拔剑，剑身反射霓虹灯光，雨水打在剑刃上" \
  --ratio 16:9 \
  --duration 8 \
  --watermark false
```

## 📋 6 阶权重提示词结构

```
Stage 1 [主体]: 核心角色/物体 (权重 1.5)
Stage 2 [动作]: 具体行为/运动 (权重 1.3)
Stage 3 [场景]: 环境/背景 (权重 1.2)
Stage 4 [镜头]: 视角/运镜 (权重 1.1)
Stage 5 [光影]: 光线/色彩 (权重 1.0)
Stage 6 [风格]: 艺术风格 (权重 0.9)
```

## 🔗 相关链接

- [火山引擎 Ark 平台](https://console.volcengine.com/ark)
- [Seedance 2.0 文档](https://www.volcengine.com/docs/82379)
- [GitHub 仓库](https://github.com/rfdiosuao/openclaw-skills)
