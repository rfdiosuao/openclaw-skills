# Kie AI 回调方式使用指南

> 生产环境推荐：使用 callBackUrl 接收生成完成通知

---

## 🎯 为什么使用回调？

**优势：**
- ✅ 无需轮询查询状态
- ✅ 实时接收完成通知
- ✅ 包含完整结果（imageUrl）
- ✅ 节省 API 调用次数
- ✅ 适合批量生成场景

---

## 📝 回调方式示例

### 基础示例

```javascript
const result = await kie.createTask({
  prompt: "A cute cartoon panda eating bamboo",
  aspectRatio: "1:1",
  resolution: "1K",
  callBackUrl: "https://your-domain.com/api/callback", // 回调地址
});

console.log("Task ID:", result.data.taskId);
// 生成完成后，系统会 POST 结果到 callBackUrl
```

### 回调 Payload

```json
{
  "taskId": "task_nano-banana-pro_xxx",
  "status": "completed",
  "data": {
    "imageUrl": "https://cdn.kie.ai/generated/xxx.png",
    "thumbnailUrl": "https://cdn.kie.ai/thumbnails/xxx.png",
    "width": 1024,
    "height": 1024,
    "seed": 12345
  }
}
```

---

## 🔧 测试回调（3 种方式）

### 方式 1：Webhook.site（推荐用于测试）

**步骤：**

1. 访问 https://webhook.site
2. 复制生成的唯一 URL
3. 使用该 URL 作为 callBackUrl
4. 在 webhook.site 页面查看回调结果

**示例代码：**
```javascript
const result = await kie.createTask({
  prompt: "测试图片",
  callBackUrl: "https://webhook.site/你的唯一 URL",
});
```

---

### 方式 2：本地服务器 + Ngrok

**步骤：**

1. 安装 ngrok：`npm install -g ngrok`
2. 启动本地服务器（端口 3000）
3. 运行 ngrok：`ngrok http 3000`
4. 使用 ngrok 提供的 URL 作为回调地址

**本地服务器示例：**
```javascript
const http = require('http');

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/api/callback') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      console.log('收到回调:', JSON.parse(body));
      res.end('OK');
    });
  }
});

server.listen(3000, () => {
  console.log('回调服务器已启动：http://localhost:3000');
});
```

**Ngrok 输出：**
```
Forwarding: https://abc123.ngrok.io -> http://localhost:3000
```

使用 `https://abc123.ngrok.io/api/callback` 作为回调地址。

---

### 方式 3：生产环境部署

**服务器端代码（Node.js + Express）：**

```javascript
const express = require('express');
const app = express();

app.use(express.json());

app.post('/api/kie-callback', (req, res) => {
  const { taskId, status, data } = req.body;
  
  if (status === 'completed') {
    console.log(`✅ 任务 ${taskId} 完成!`);
    console.log('图像 URL:', data.imageUrl);
    
    // 在这里处理生成的图片
    // 例如：保存到数据库、发送通知等
  } else if (status === 'failed') {
    console.error(`❌ 任务 ${taskId} 失败!`);
  }
  
  res.json({ success: true });
});

app.listen(3000, () => {
  console.log('回调服务器运行在端口 3000');
});
```

---

## 📋 完整使用流程

### 1. 提交任务

```javascript
const kie = new KieNanoBananaPro(API_KEY);

const result = await kie.createTask({
  prompt: "A beautiful landscape",
  aspectRatio: "16:9",
  resolution: "2K",
  callBackUrl: "https://your-domain.com/api/callback",
});

console.log("Task ID:", result.data.taskId);
```

### 2. 接收回调

```json
POST /api/callback
Content-Type: application/json

{
  "taskId": "dfe2eaaa17794a62aa662c9c0dc3e164",
  "status": "completed",
  "data": {
    "imageUrl": "https://cdn.kie.ai/generated/dfe2eaaa.png",
    "thumbnailUrl": "https://cdn.kie.ai/thumbnails/dfe2eaaa.png",
    "width": 2048,
    "height": 1152,
    "seed": 42
  }
}
```

### 3. 处理结果

```javascript
// 保存图像 URL 到数据库
await db.images.create({
  taskId: result.taskId,
  imageUrl: result.data.imageUrl,
  status: 'completed',
  createdAt: new Date(),
});

// 发送通知给用户
await notifyUser({
  type: 'image_completed',
  imageUrl: result.data.imageUrl,
});
```

---

## 🔐 回调安全验证

**验证签名（推荐）：**

```javascript
const crypto = require('crypto');

function verifySignature(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(payload).digest('hex');
  return digest === signature;
}

app.post('/api/callback', (req, res) => {
  const signature = req.headers['x-kie-signature'];
  const payload = JSON.stringify(req.body);
  
  if (!verifySignature(payload, signature, WEBHOOK_SECRET)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  // 处理回调...
  res.json({ success: true });
});
```

---

## ⚠️ 注意事项

### 1. 回调地址要求
- ✅ 必须是公网可访问的 HTTPS URL
- ✅ 支持 POST 请求
- ✅ 能接收 JSON 格式数据
- ✅ 响应时间 < 5 秒

### 2. 重试机制
- 如果回调失败，系统会重试 3 次
- 重试间隔：1 分钟、5 分钟、15 分钟
- 确保你的服务器能处理重复回调（幂等性）

### 3. 超时处理
- 图像生成通常耗时 30-120 秒
- 如果超过 5 分钟未收到回调，检查：
  - 回调地址是否正确
  - 服务器是否正常运行
  - 防火墙是否阻止请求

---

## 📊 回调 vs 轮询对比

| 特性 | 回调方式 | 轮询方式 |
|------|----------|----------|
| **实时性** | ✅ 即时通知 | ⏳ 依赖查询间隔 |
| **API 调用** | ✅ 1 次创建 | ❌ 多次查询 |
| **服务器负载** | ✅ 低 | ❌ 高 |
| **实现复杂度** | ⚠️ 需要回调服务器 | ✅ 简单 |
| **适用场景** | 生产环境 | 测试/调试 |

---

## 🚀 最佳实践

### 1. 批量生成
```javascript
const tasks = await Promise.all([
  kie.createTask({ prompt: "图片 1", callBackUrl }),
  kie.createTask({ prompt: "图片 2", callBackUrl }),
  kie.createTask({ prompt: "图片 3", callBackUrl }),
]);

console.log("已提交", tasks.length, "个任务");
```

### 2. 错误处理
```javascript
app.post('/api/callback', async (req, res) => {
  try {
    const { taskId, status, data, error } = req.body;
    
    if (status === 'completed') {
      await handleSuccess(taskId, data);
    } else if (status === 'failed') {
      await handleFailure(taskId, error);
    }
    
    res.json({ success: true });
  } catch (err) {
    console.error('回调处理失败:', err);
    res.status(500).json({ error: 'Internal error' });
  }
});
```

### 3. 日志记录
```javascript
// 记录所有回调
fs.appendFileSync('callbacks.log', JSON.stringify({
  timestamp: new Date().toISOString(),
  taskId: req.body.taskId,
  status: req.body.status,
}) + '\n');
```

---

## 🔗 相关资源

- **官方文档：** https://docs.kie.ai/market/google/pro-image-to-image
- **Webhook 验证：** https://docs.kie.ai/common-api/webhook-verification
- **测试工具：** https://webhook.site
- **Ngrok 下载：** https://ngrok.com

---

**使用回调方式，让图像生成更高效！** ⚡
