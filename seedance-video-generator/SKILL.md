# Seedance 2.0 视频生成

> 基于火山引擎 Doubao Seedance 2.0 模型的多模态视频生成工具

## 功能

- 🎬 **多模态输入**: 支持文本 + 参考图片 + 参考视频 + 参考音频组合
- 🎨 **第一视角构图**: 支持第一人称视角视频生成
- 🎵 **音频生成**: 可选生成配套音频或使用参考音频
- 📐 **比例控制**: 支持 16:9、9:16、1:1 等多种比例
- ⏱️ **时长控制**: 支持 5-30 秒视频生成
- 💧 **水印开关**: 可选开启/关闭水印

## 命令

```bash
/seedance-generate <prompt> [options]
```

## 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `prompt` | string | ✅ | 视频生成提示词，支持第一视角描述 |
| `reference_images` | string[] | ❌ | 参考图片 URL 数组 |
| `reference_video` | string | ❌ | 参考视频 URL |
| `reference_audio` | string | ❌ | 参考音频 URL |
| `ratio` | string | ❌ | 视频比例，默认 16:9 |
| `duration` | number | ❌ | 视频时长（秒），默认 10 |
| `generate_audio` | boolean | ❌ | 是否生成音频，默认 true |
| `watermark` | boolean | ❌ | 是否添加水印，默认 false |

## 示例

### 基础生成
```
/seedance-generate 制作一杯苹果冰茶，第一人称视角展示制作过程
```

### 带参考素材
```
/seedance-generate 制作苹果果茶，第一人称视角 --images https://example.com/apple.jpg --video https://example.com/make.mp4 --audio https://example.com/bgm.mp3 --ratio 9:16 --duration 15
```

### 商业广告
```
/seedance-generate 第一人称视角果茶宣传广告，摘下带晨露的苹果，鲜切现摇，倒入透明杯，手持举杯展示 --images img1.jpg,img2.jpg --ratio 16:9 --duration 11
```

## 输出

- ✅ 生成任务提交成功 → 返回任务 ID
- ✅ 轮询任务状态 → 返回生成进度
- ✅ 完成 → 返回视频 URL（和音频 URL）

## 限制

- 单次生成时长：5-30 秒
- 参考图片：最多 4 张
- 支持比例：16:9, 9:16, 1:1, 4:3, 3:4
- API 调用需要火山引擎 Ark 平台 API Key

## 配置

在 `TOOLS.md` 中配置：

```bash
# 火山引擎 Ark API Key
VOLCENGINE_ARK_API_KEY="your-api-key-here"
```
