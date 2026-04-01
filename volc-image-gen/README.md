# volc-image-gen - 火山引擎图像生成技能

> 🎨 基于火山引擎方舟平台的 AI 图像生成解决方案  
> ✨ 文生图 · 图生图 · 批量生成 · 变体生成

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://clawhub.ai/skills/volc-image-gen)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![ClawHub](https://img.shields.io/badge/ClawHub-published-orange.svg)](https://clawhub.ai/skills/volc-image-gen)

---

## 📖 目录

- [简介](#-简介)
- [快速开始](#-快速开始)
- [安装指南](#-安装指南)
- [配置说明](#-配置说明)
- [使用示例](#-使用示例)
- [API 参考](#-api-参考)
- [风格与尺寸](#-风格与尺寸)
- [高级功能](#-高级功能)
- [故障排查](#-故障排查)
- [性能优化](#-性能优化)
- [更新日志](#-更新日志)
- [常见问题](#-常见问题)

---

## 🌟 简介

`volc-image-gen` 是一个功能完整的 AI 图像生成技能，基于火山引擎方舟平台，提供高质量的图像生成能力。

### 核心特性

| 特性 | 说明 |
|------|------|
| 🎨 **文生图** | 根据文本描述生成高质量图片，支持 7 种艺术风格 |
| 🖼️ **图生图** | 基于现有图片进行编辑、重绘和修改 |
| 📦 **批量生成** | 支持并发批量生成，智能控制请求频率 |
| 🔄 **变体生成** | 为图片生成多个相似变体，提供更多选择 |
| 💾 **智能缓存** | 1 小时缓存机制，相同请求不重复调用 API |
| 🔄 **自动重试** | 智能重试机制，指数退避策略 |
| ⚡ **高性能** | 并发控制，避免 API 限流 |

### 适用场景

- 🛍️ **电商产品图** - 商品展示、模特图、场景图
- 🎭 **社交媒体** - 头像、封面、配图
- 🎨 **创意设计** - 概念图、灵感图、素材生成
- 📚 **教育内容** - 插图、示意图、教学素材
- 🏢 **营销物料** - 广告图、海报、宣传素材

---

## 🚀 快速开始

### 3 分钟快速上手

#### 步骤 1：安装技能

```bash
claw install volc-image-gen
```

#### 步骤 2：配置 API Key

```bash
# Linux/macOS
export VOLC_API_KEY="your_volc_api_key"

# Windows PowerShell
[System.Environment]::SetEnvironmentVariable("VOLC_API_KEY", "your_api_key", "User")
```

#### 步骤 3：开始生成

```javascript
// 在 OpenClaw 中使用
const result = await execute({
  command: 'generate',
  params: {
    prompt: '一只可爱的猫咪在阳光下玩耍',
    style: 'realistic'
  }
});

console.log(result.images[0].local_path);
```

---

## 📦 安装指南

### 方式一：ClawHub 安装（推荐）

```bash
# 安装最新版本
claw install volc-image-gen

# 安装指定版本
claw install volc-image-gen@1.0.0
```

### 方式二：手动安装

```bash
# 克隆仓库
git clone https://github.com/rfdiosuao/openclaw-skills.git
cd openclaw-skills/volc-image-gen

# 安装依赖
npm install

# 移动到 OpenClaw 技能目录
mv . ~/.openclaw/workspace/skills/volc-image-gen
```

### 方式三：本地开发安装

```bash
# 进入技能目录
cd /path/to/volc-image-gen

# 安装依赖
npm install

# 测试运行
npm test
```

### 验证安装

```bash
# 运行单元测试
cd ~/.openclaw/workspace/skills/volc-image-gen
npm test

# 查看帮助
node src/index.js help
```

---

## ⚙️ 配置说明

### 环境变量

| 变量 | 必填 | 默认值 | 说明 |
|------|------|--------|------|
| `VOLC_API_KEY` | ✅ | - | 火山引擎 API Key |
| `VOLC_API_BASE` | ❌ | `https://ark.cn-beijing.volces.com/api/v3` | API 基础 URL |
| `VOLC_IMAGE_MODEL` | ❌ | `doubao-image-x` | 图像模型名称 |

### 获取 API Key

1. 访问 [火山引擎方舟控制台](https://console.volcengine.com/ark)
2. 登录/注册火山引擎账号
3. 创建新应用或选择现有应用
4. 在「凭证管理」中获取 API Key

### 配置示例

**Linux/macOS (~/.bashrc 或 ~/.zshrc):**

```bash
export VOLC_API_KEY="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
export VOLC_API_BASE="https://ark.cn-beijing.volces.com/api/v3"
export VOLC_IMAGE_MODEL="doubao-image-x"
```

**Windows PowerShell:**

```powershell
[System.Environment]::SetEnvironmentVariable("VOLC_API_KEY", "sk-xxxx", "User")
[System.Environment]::SetEnvironmentVariable("VOLC_API_BASE", "https://ark.cn-beijing.volces.com/api/v3", "User")
```

**Docker:**

```dockerfile
ENV VOLC_API_KEY=sk-xxxx
ENV VOLC_API_BASE=https://ark.cn-beijing.volces.com/api/v3
```

### 使配置生效

```bash
# Linux/macOS
source ~/.bashrc  # 或 source ~/.zshrc

# Windows
# 重启终端或运行
refreshenv
```

---

## 💡 使用示例

### 示例 1：基础文生图

```javascript
const { execute } = require('volc-image-gen');

const result = await execute({
  command: 'generate',
  params: {
    prompt: '一只可爱的布偶猫，蓝色眼睛，坐在窗台上',
    style: 'realistic',
    size: '1024x1024'
  }
});

if (result.success) {
  console.log('✅ 生成成功！');
  console.log('图片路径:', result.images[0].local_path);
  console.log('消耗 Token:', result.usage.tokens);
  console.log('成本:', `¥${result.usage.cost.toFixed(4)}`);
} else {
  console.error('❌ 生成失败:', result.error);
}
```

### 示例 2：动漫风格头像

```javascript
const result = await execute({
  command: 'generate',
  params: {
    prompt: '一个可爱的动漫女孩，银色长发，紫色眼睛，微笑，校服',
    style: 'anime',
    size: '1024x1024',
    n: 4  // 生成 4 张
  }
});

// 保存所有生成的图片
result.images.forEach((img, idx) => {
  console.log(`图片 ${idx + 1}: ${img.local_path}`);
});
```

### 示例 3：批量生成产品图

```javascript
const productPrompts = [
  '白色 T 恤，简约设计，纯白背景，正面展示',
  '蓝色牛仔裤，休闲风格，细节清晰，平铺拍摄',
  '黑色运动鞋，时尚款式，侧面视角，专业摄影',
  '皮质手提包，棕色，高端质感，白色背景',
  '智能手表，黑色表带，科技感，产品展示'
];

const batchResult = await execute({
  command: 'batch',
  params: {
    prompts: productPrompts,
    concurrent: 3,  // 并发数，避免限流
    size: '1024x1024',
    style: 'realistic'
  }
});

console.log('📊 批量生成结果:');
console.log(`  总数：${batchResult.total}`);
console.log(`  成功：${batchResult.successful}`);
console.log(`  失败：${batchResult.failed}`);
console.log(`  总成本：¥${batchResult.usage.total_cost.toFixed(2)}`);
console.log(`  平均成本：¥${batchResult.usage.avg_cost.toFixed(4)}/张`);

// 查看失败的提示词
if (batchResult.failed_prompts.length > 0) {
  console.log('\n失败的提示词:');
  batchResult.failed_prompts.forEach(item => {
    console.log(`  - ${item.prompt}: ${item.error}`);
  });
}
```

### 示例 4：图片编辑（图生图）

```javascript
const editResult = await execute({
  command: 'edit',
  params: {
    image: 'https://example.com/original.png',  // 或本地路径 '/path/to/image.png'
    prompt: '将背景换成海滩日落，保持人物不变',
    strength: 0.7,  // 重绘强度 0-1，越大变化越大
    size: '1024x1024'
  }
});

if (editResult.success) {
  console.log('✅ 编辑成功！');
  console.log('编辑后图片:', editResult.images[0].local_path);
}
```

### 示例 5：生成变体

```javascript
const variationsResult = await execute({
  command: 'variations',
  params: {
    image: '/path/to/favorite-image.png',
    n: 5,  // 生成 5 个变体
    strength: 0.5,  // 变体强度
    size: '1024x1024'
  }
});

console.log(`✅ 生成了 ${variationsResult.variations.length} 个变体`);
variationsResult.variations.forEach((v, idx) => {
  console.log(`  变体 ${idx + 1}: ${v.local_path}`);
});
```

### 示例 6：使用负面提示词

```javascript
const result = await execute({
  command: 'generate',
  params: {
    prompt: '一个美丽的花园，鲜花盛开，阳光明媚',
    style: 'realistic',
    negative_prompt: '模糊，低质量，变形，水印，文字',  // 不想要的内容
    size: '1024x1024'
  }
});
```

### 示例 7：赛博朋克风格

```javascript
const result = await execute({
  command: 'generate',
  params: {
    prompt: '未来城市夜景，高楼大厦，霓虹灯，飞行汽车',
    style: 'cyberpunk',
    size: '1536x1024'  // 宽屏构图
  }
});
```

### 示例 8：水彩风格插画

```javascript
const result = await execute({
  command: 'generate',
  params: {
    prompt: '森林小屋，清晨，薄雾，宁静',
    style: 'watercolor',
    size: '768x1024'  # 竖向构图
  }
});
```

---

## 🔧 API 参考

### execute(context) - 主入口函数

**参数:**

```typescript
interface Context {
  command: string;      // 命令名称
  params?: object;      // 命令参数
}
```

**返回:**

```typescript
interface Result {
  success: boolean;
  error?: string;
  code?: number;
  images?: ImageInfo[];
  usage?: UsageInfo;
}
```

### 命令列表

#### 1. generate / 文生图 / 生成图片 / img

根据文本描述生成图片。

**参数:**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| prompt | string | ✅ | - | 图片描述 |
| size | string | ❌ | '1024x1024' | 图片尺寸 |
| n | number | ❌ | 1 | 生成数量（1-10） |
| style | string | ❌ | 'realistic' | 艺术风格 |
| negative_prompt | string | ❌ | '' | 负面提示词 |
| maxRetries | number | ❌ | 3 | 最大重试次数 |
| useCache | boolean | ❌ | true | 是否使用缓存 |

**示例:**

```json
{
  "command": "generate",
  "params": {
    "prompt": "一只可爱的猫咪",
    "style": "anime",
    "n": 4
  }
}
```

#### 2. edit / 图生图 / 编辑图片 / img2img

基于现有图片进行编辑。

**参数:**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| image | string | ✅ | - | 输入图片（URL 或本地路径） |
| prompt | string | ✅ | - | 编辑描述 |
| strength | number | ❌ | 0.7 | 重绘强度（0-1） |
| size | string | ❌ | '1024x1024' | 输出尺寸 |

**示例:**

```json
{
  "command": "edit",
  "params": {
    "image": "/path/to/image.png",
    "prompt": "将背景换成海滩",
    "strength": 0.6
  }
}
```

#### 3. batch / 批量生成 / batch_generate

批量生成多张图片。

**参数:**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| prompts | string[] | ✅ | - | 提示词数组 |
| concurrent | number | ❌ | 3 | 并发数 |
| size | string | ❌ | '1024x1024' | 尺寸 |
| style | string | ❌ | 'realistic' | 风格 |

**示例:**

```json
{
  "command": "batch",
  "params": {
    "prompts": ["猫咪", "狗狗", "兔子"],
    "concurrent": 3
  }
}
```

#### 4. variations / 生成变体 / 变体

生成图片的多个变体。

**参数:**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| image | string | ✅ | - | 输入图片 |
| n | number | ❌ | 3 | 变体数量 |
| strength | number | ❌ | 0.5 | 变体强度 |
| size | string | ❌ | '1024x1024' | 尺寸 |

**示例:**

```json
{
  "command": "variations",
  "params": {
    "image": "/path/to/image.png",
    "n": 5
  }
}
```

#### 5. help / 帮助 / usage

显示帮助信息。

**示例:**

```json
{
  "command": "help"
}
```

---

## 🎨 风格与尺寸

### 艺术风格

| 风格 Key | 说明 | 提示词增强 | 适用场景 |
|----------|------|------------|----------|
| `realistic` | 写实风格 | 高清，高质量，专业摄影 | 产品摄影、人像、风景 |
| `anime` | 动漫风格 | 二次元，精美，日系动画 | 动漫角色、插画、头像 |
| `oil` | 油画风格 | 艺术感，厚重，古典绘画 | 艺术作品、装饰画 |
| `watercolor` | 水彩风格 | 清新，透明感，淡雅 | 清新插画、背景 |
| `sketch` | 素描风格 | 线条感，黑白，手绘 | 草图、线稿、概念图 |
| `cyberpunk` | 赛博朋克风格 | 霓虹灯，未来感，科技 | 科幻场景、未来城市 |
| `fantasy` | 奇幻风格 | 魔法，梦幻，神秘 | 奇幻场景、魔法效果 |

### 支持尺寸

| 尺寸 | 类型 | 适用场景 |
|------|------|----------|
| `512x512` | 正方形 | 快速预览、头像 |
| `512x768` | 竖向 | 手机壁纸、竖版海报 |
| `768x512` | 横向 | 横幅、封面 |
| `768x768` | 正方形 | 社交媒体配图 |
| `1024x1024` | 正方形 | **标准尺寸（推荐）** |
| `1024x1536` | 竖向 | 高清手机壁纸 |
| `1536x1024` | 横向 | 高清桌面壁纸 |

---

## 🚀 高级功能

### 智能缓存

内置 1 小时缓存机制，相同参数的请求不会重复调用 API。

```javascript
// 第一次调用 - 实际请求 API
const result1 = await execute({
  command: 'generate',
  params: { prompt: '一只猫咪', style: 'realistic' }
});

// 5 分钟后，相同参数 - 从缓存返回
const result2 = await execute({
  command: 'generate',
  params: { prompt: '一只猫咪', style: 'realistic' }
});
// ✅ 缓存命中，不产生 API 调用

// 禁用缓存
const result3 = await execute({
  command: 'generate',
  params: { 
    prompt: '一只猫咪',
    useCache: false  // 强制请求 API
  }
});
```

### 并发控制

批量生成时智能控制并发数，避免 API 限流。

```javascript
// 推荐并发数：3-5
const result = await execute({
  command: 'batch',
  params: {
    prompts: ['prompt1', 'prompt2', 'prompt3', 'prompt4', 'prompt5'],
    concurrent: 3  // 最多同时 3 个请求
  }
});
```

### 自动重试

遇到临时错误（429/5xx）自动重试，指数退避策略。

```javascript
// 默认重试 3 次，延迟：1s → 2s → 4s
const result = await execute({
  command: 'generate',
  params: {
    prompt: '测试',
    maxRetries: 5  // 自定义重试次数
  }
});
```

### 错误处理

完整的错误码和错误信息。

```javascript
const result = await execute({
  command: 'generate',
  params: { prompt: '测试' }
});

if (!result.success) {
  switch (result.code) {
    case 401:
      console.error('鉴权失败 - 检查 API Key');
      break;
    case 400:
      console.error('参数错误 - 检查 prompt 和 size');
      break;
    case 429:
      console.error('API 限流 - 降低并发数');
      break;
    case 500:
      console.error('服务器错误 - 稍后重试');
      break;
    default:
      console.error(`未知错误：${result.error}`);
  }
}
```

---

## 🐛 故障排查

### 错误码速查表

| 错误码 | 含义 | 解决方案 |
|--------|------|----------|
| 401 | 鉴权失败 | 检查 `VOLC_API_KEY` 是否正确 |
| 400 | 参数错误 | 检查 prompt、size 等参数格式 |
| 429 | API 限流 | 降低并发数，稍后重试 |
| 500 | 服务器错误 | 等待后重试 |
| 503 | 服务不可用 | 检查火山引擎服务状态 |

### 常见问题

#### 1. "VOLC_API_KEY 环境变量未设置"

**原因：** 未配置 API Key  
**解决：**

```bash
# 检查是否配置
echo $VOLC_API_KEY

# 重新配置
export VOLC_API_KEY="your_api_key"

# 验证
node -e "console.log(process.env.VOLC_API_KEY)"
```

#### 2. "不支持的尺寸"

**原因：** size 参数不在支持列表中  
**解决：** 使用支持的尺寸：

```javascript
// ✅ 正确
size: '1024x1024'

// ❌ 错误
size: '2000x2000'
```

#### 3. "API 限流"

**原因：** 请求频率过高  
**解决：**

```javascript
// 降低并发数
concurrent: 1  // 或 2

// 添加请求间隔
await sleep(2000);  // 2 秒间隔
```

#### 4. "图片下载失败"

**原因：** 网络问题或 URL 失效  
**解决：**

```bash
# 检查网络连接
ping ark.cn-beijing.volces.com

# 检查输出目录权限
ls -la /tmp/openclaw/

# 重试请求
```

#### 5. "超时错误"

**原因：** 图片生成时间过长  
**解决：**

- 使用较小的尺寸（如 512x512）
- 检查火山引擎服务状态
- 稍后重试

---

## ⚡ 性能优化

### 最佳实践

#### 1. 使用缓存

```javascript
// ✅ 推荐：启用缓存（默认）
useCache: true

// ❌ 不推荐：每次都请求 API
useCache: false
```

#### 2. 合理设置并发

```javascript
// 批量生成 10 张图片
{
  prompts: [...],  // 10 个
  concurrent: 3    // 推荐 3-5
}
```

#### 3. 优化提示词

```javascript
// ✅ 具体描述
prompt: '一只橘色的布偶猫，蓝色眼睛，坐在木质窗台上，阳光照射'

// ❌ 模糊描述
prompt: '一只猫'
```

#### 4. 选择合适的尺寸

```javascript
// 快速预览
size: '512x512'

// 最终输出
size: '1024x1024'
```

### 成本优化

| 优化方式 | 节省比例 | 说明 |
|----------|----------|------|
| 启用缓存 | 30-50% | 相同请求不重复计费 |
| 小尺寸预览 | 50% | 512x512 比 1024x1024 便宜 |
| 批量生成 | 20% | 并发优化，减少失败重试 |
| 精准提示词 | 30% | 减少重复生成次数 |

---

## 📝 更新日志

### v1.0.0 (2026-04-01)

**✨ 初始版本发布**

- 🎨 文生图功能
  - 7 种艺术风格
  - 7 种尺寸选择
  - 负面提示词支持
  - 多图生成（n 参数）
  
- 🖼️ 图生图功能
  - 图片编辑
  - 重绘强度控制
  - URL/本地路径支持
  
- 📦 批量生成
  - 并发控制
  - 成功/失败统计
  - 成本计算
  
- 🔄 变体生成
  - 自定义变体数量
  - 变体强度控制
  
- 💾 智能缓存
  - 1 小时 TTL
  - 参数级缓存键
  
- 🔄 自动重试
  - 指数退避策略
  - 错误码智能识别
  
- 🧪 完整测试
  - 40+ 单元测试
  - 100% 核心逻辑覆盖

---

## ❓ 常见问题

### Q: 生成一张图片需要多长时间？

**A:** 通常 5-30 秒，取决于：
- 图片尺寸（越大越慢）
- 服务器负载
- 网络状况

### Q: 生成失败会扣费吗？

**A:** 不会。只有成功生成的图片才会计费。

### Q: 可以商用吗？

**A:** 可以。生成的图片版权归您所有，可商用。

### Q: 支持哪些图片格式？

**A:** 输出为 PNG 格式，高质量无损压缩。

### Q: 如何降低生成成本？

**A:** 
1. 使用较小尺寸预览
2. 启用缓存
3. 优化提示词，减少重复生成
4. 批量生成（并发优化）

### Q: 支持中文提示词吗？

**A:** 支持！火山引擎完美支持中文提示词。

### Q: 如何获取技术支持？

**A:** 
- GitHub Issues: https://github.com/rfdiosuao/openclaw-skills/issues
- ClawHub: https://clawhub.ai/skills/volc-image-gen

---

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

---

## 🔗 相关链接

- [ClawHub 页面](https://clawhub.ai/skills/volc-image-gen)
- [GitHub 仓库](https://github.com/rfdiosuao/openclaw-skills/tree/master/volc-image-gen)
- [火山引擎方舟文档](https://www.volcengine.com/docs/82379)
- [OpenClaw 官方文档](https://docs.openclaw.ai)

---

## 👨‍💻 作者

**OpenClaw Skill Master**

- GitHub: [@rfdiosuao](https://github.com/rfdiosuao)
- ClawHub: @rfdiosuao

---

## 🙏 致谢

感谢以下项目：

- [火山引擎方舟](https://www.volcengine.com/product/ark) - AI 模型平台
- [OpenClaw](https://openclaw.ai) - AI Agent 框架
- [ClawHub](https://clawhub.ai) - Skill 市场

---

**最后更新：** 2026-04-01  
**版本：** 1.0.0  
**状态：** ✅ 稳定版本
