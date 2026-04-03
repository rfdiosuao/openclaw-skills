# Seedance 2.0 视频生成工具

> 🎬 基于火山引擎 Doubao Seedance 2.0 模型的多模态 AI 视频生成工具

## 📖 简介

本工具提供火山引擎 Seedance 2.0 视频生成模型的完整封装，支持：

- **多模态输入**：文本 + 参考图片 + 参考视频 + 参考音频
- **第一人称视角**：专为广告、宣传视频优化的第一视角构图
- **灵活控制**：比例、时长、水印、音频生成全可配置
- **异步任务**：提交任务 + 轮询状态，支持超时控制

## ✨ 特性

| 特性 | 说明 |
|------|------|
| 🎨 多模态融合 | 同时使用图片、视频、音频作为参考素材 |
| 📐 多比例支持 | 16:9、9:16、1:1、4:3、3:4 |
| ⏱️ 时长控制 | 5-30 秒灵活调整 |
| 🎵 音频生成 | 可选生成配套音频或使用参考音频 |
| 💧 水印开关 | 商业使用可关闭水印 |
| 🔄 自动轮询 | 内置任务状态轮询，无需手动检查 |

## 🚀 快速开始

### 1. 安装 Skill

```bash
claw skill install seedance-video-generator
```

### 2. 配置 API Key

在 `TOOLS.md` 或环境变量中配置：

```bash
export VOLCENGINE_ARK_API_KEY="your-api-key-here"
```

获取 API Key：[火山引擎 Ark 平台](https://console.volcengine.com/ark)

### 3. 使用命令

```bash
# 基础使用
/seedance-generate 制作一杯苹果冰茶，第一人称视角展示制作过程

# 带参考素材
/seedance-generate 苹果果茶广告 --images https://example.com/apple.jpg --ratio 9:16 --duration 15

# 完整参数
/seedance-generate "第一人称视角果茶宣传" \
  --images img1.jpg,img2.jpg \
  --video ref.mp4 \
  --audio bgm.mp3 \
  --ratio 16:9 \
  --duration 11 \
  --generate-audio true \
  --watermark false
```

## 📋 参数说明

### 命令参数

| 参数 | 别名 | 类型 | 默认值 | 说明 |
|------|------|------|--------|------|
| `prompt` | - | string | **必填** | 视频生成提示词 |
| `--images` | `-i` | string[] | - | 参考图片 URL 数组（逗号分隔） |
| `--video` | `-v` | string | - | 参考视频 URL |
| `--audio` | `-a` | string | - | 参考音频 URL |
| `--ratio` | `-r` | string | `16:9` | 视频比例 |
| `--duration` | `-d` | number | `10` | 视频时长（秒） |
| `--generate-audio` | - | boolean | `true` | 是否生成音频 |
| `--watermark` | `-w` | boolean | `false` | 是否添加水印 |

### 支持的比例

- `16:9` - 横屏（YouTube、B 站）
- `9:16` - 竖屏（抖音、快手、Reels）
- `1:1` - 正方形（Instagram Feed）
- `4:3` - 传统电视比例
- `3:4` - 竖版照片比例

## 💡 使用示例

### 示例 1：简单产品宣传

```bash
/seedance-generate "第一人称视角展示一杯新鲜制作的草莓奶昔，粉色奶昔倒入透明玻璃杯，顶部放新鲜草莓" \
  --ratio 9:16 \
  --duration 8
```

### 示例 2：完整广告制作

```bash
/seedance-generate "第一人称视角果茶宣传广告，seedance 牌「苹苹安安」苹果果茶限定款；首帧为图片 1，你的手摘下一颗带晨露的阿克苏红苹果；2-4 秒：快速切镜，你的手将苹果块投入雪克杯，加入冰块与茶底，用力摇晃；4-6 秒：第一人称成品特写，分层果茶倒入透明杯，在杯身贴上粉红包标；6-8 秒：第一人称手持举杯，将果茶举到镜头前，背景音「来一口鲜爽」" \
  --images https://example.com/apple.jpg,https://example.com/cup.jpg \
  --video https://example.com/make.mp4 \
  --audio https://example.com/bgm.mp3 \
  --ratio 16:9 \
  --duration 11 \
  --watermark false
```

### 示例 3：美食教程

```bash
/seedance-generate "第一人称视角制作意大利面，煮沸的水中加入面条，翻炒肉酱，最后装盘撒上芝士粉" \
  --images https://example.com/pasta1.jpg,https://example.com/pasta2.jpg,https://example.com/pasta3.jpg \
  --ratio 16:9 \
  --duration 15 \
  --generate-audio true
```

## 🔧 编程接口

### TypeScript 使用

```typescript
import { SeedanceVideoGenerator } from 'seedance-video-generator';

const generator = new SeedanceVideoGenerator({
  apiKey: process.env.VOLCENGINE_ARK_API_KEY!,
});

// 提交生成任务
const task = await generator.generate({
  prompt: '制作一杯苹果冰茶，第一人称视角',
  referenceImages: ['https://example.com/apple.jpg'],
  ratio: '9:16',
  duration: 10,
  watermark: false,
});

console.log('任务 ID:', task.taskId);

// 轮询直到完成
const result = await generator.pollTask(task.taskId, 3000, 300000);

if (result.status === 'completed') {
  console.log('视频 URL:', result.videoUrl);
  console.log('音频 URL:', result.audioUrl);
} else {
  console.error('生成失败:', result.error);
}
```

### 状态轮询

```typescript
// 手动查询状态
const status = await generator.getTaskStatus(taskId);
console.log('当前状态:', status.status);

// 自动轮询（推荐）
const result = await generator.pollTask(taskId, {
  intervalMs: 3000,    // 每 3 秒查询一次
  timeoutMs: 300000,   // 5 分钟超时
});
```

## ⚠️ 注意事项

### 限制

- **时长范围**：5-30 秒
- **参考图片**：最多 4 张
- **超时时间**：默认 5 分钟（可配置）
- **API 限流**：请参考火山引擎官方文档

### 最佳实践

1. **提示词优化**：
   - 使用第一人称描述（"你的手"、"你看到"）
   - 包含具体动作和时间节点
   - 描述视觉细节（颜色、纹理、光影）

2. **参考素材**：
   - 图片使用清晰、高分辨率素材
   - 视频参考保持风格一致
   - 音频注意版权

3. **成本控制**：
   - 先用短时长（5-8 秒）测试效果
   - 确认满意后再生成正式版本
   - 合理设置轮询间隔

## 🐛 故障排查

### 常见问题

**Q: 提示"缺少 API Key"**
```bash
# 检查环境变量
echo $VOLCENGINE_ARK_API_KEY

# 或添加到 TOOLS.md
export VOLCENGINE_ARK_API_KEY="your-key"
```

**Q: 任务一直处于 pending 状态**
- 检查网络连接
- 确认 API Key 有效
- 查看火山引擎控制台配额

**Q: 生成失败**
- 检查提示词是否违规
- 确认参考素材 URL 可访问
- 查看错误详情：`result.error`

## 📊 API 参考

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
    "duration": 10,
    "watermark": false
  }'
```

### 查询状态

```bash
curl -X GET https://ark.cn-beijing.volces.com/api/v3/contents/generations/tasks/{task_id} \
  -H "Authorization: Bearer YOUR_API_KEY"
```

## 📝 更新日志

### v1.0.0 (2026-04-03)
- ✅ 初始版本发布
- ✅ 支持多模态输入（文本 + 图片 + 视频 + 音频）
- ✅ 支持 5 种视频比例
- ✅ 支持 5-30 秒时长控制
- ✅ 内置任务轮询机制
- ✅ 完整 TypeScript 支持
- ✅ 单元测试覆盖

## 📄 许可证

MIT License

## 👤 作者

郑宇航 - OpenClaw Skill 大师

## 🔗 相关链接

- [火山引擎 Ark 平台](https://console.volcengine.com/ark)
- [Seedance 2.0 文档](https://www.volcengine.com/docs/82379)
- [OpenClaw 文档](https://docs.openclaw.ai)
- [ClawHub](https://clawhub.ai)
