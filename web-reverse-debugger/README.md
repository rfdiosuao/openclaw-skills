# 🔓 Web Reverse Debugger - 网页逆向调试助手

> **自动破解参数签名 | 实现加密接口自动化调用**

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://clawhub.ai)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org)

---

## 📖 简介

**Web Reverse Debugger** 是一个基于 OpenClaw + Playwright 的网页逆向调试工具，专门用于：

- 🔐 **自动提取加密参数**（sign、token、timestamp 等）
- 💉 **Hook 浏览器加密函数**，跟踪调用栈
- 🌐 **拦截 HTTP/WebSocket 请求**，捕获完整报文
- ⚡ **配合 OpenClaw 工作流**，实现自动化调用

**适用场景：**
- 网站数据采集，遇到签名验证
- 接口参数被 AES/RSA 加密
- 需要逆向分析 JS 加密逻辑
- 自动化测试加密接口

---

## 🚀 快速开始

### 1. 安装 Skill

```bash
claw skill install web-reverse-debugger
```

### 2. 安装依赖

```bash
cd web-reverse-debugger
npm install
npx playwright install chromium
```

### 3. 基础使用

```typescript
import { createDebugger } from 'web-reverse-debugger';

async function main() {
  // 创建调试器
  const debugger = createDebugger({
    targetUrl: 'https://www.example.com',
    headless: false,  // 调试时建议设为 false
    stealth: true     // 启用反检测
  });

  try {
    // 初始化浏览器
    await debugger.init();
    
    // 访问目标网站
    await debugger.navigate();
    
    // 注入 Hook 脚本
    await debugger.injectFetchHook();
    await debugger.injectXHRHook();
    
    // 模拟用户操作，触发目标接口
    await debugger.click('#load-data-button');
    await debugger.wait(3000);
    
    // 获取捕获的请求
    const requests = debugger.getCapturedRequests();
    console.log('捕获的请求:', requests);
    
    // 提取签名参数
    const signRequest = requests.find(r => r.url.includes('/api/products'));
    if (signRequest?.sign) {
      console.log('✅ 签名参数:', signRequest.sign);
    }
    
  } finally {
    await debugger.close();
  }
}

main();
```

---

## 📦 API 文档

### 类：WebReverseDebugger

#### 构造函数参数

```typescript
interface ReverseDebuggerConfig {
  targetUrl: string;      // 目标网站 URL
  headless?: boolean;     // 是否无头模式（默认 false）
  apiPattern?: string;    // API 匹配模式（默认：**/api/**）
  stealth?: boolean;      // 是否启用反检测（默认 false）
}
```

#### 核心方法

| 方法 | 说明 | 示例 |
|------|------|------|
| `init()` | 初始化浏览器 | `await debugger.init()` |
| `navigate(url?)` | 访问网页 | `await debugger.navigate()` |
| `injectFetchHook()` | 注入 Fetch Hook | `await debugger.injectFetchHook()` |
| `injectXHRHook()` | 注入 XHR Hook | `await debugger.injectXHRHook()` |
| `callEncryptFunction(fn, params)` | 调用加密函数 | `await debugger.callEncryptFunction('generateSign', data)` |
| `getCapturedRequests()` | 获取捕获的请求 | `const reqs = debugger.getCapturedRequests()` |
| `click(selector)` | 点击元素 | `await debugger.click('#btn')` |
| `fill(selector, value)` | 填充表单 | `await debugger.fill('#input', 'text')` |
| `evaluate(script)` | 执行自定义 JS | `await debugger.evaluate('() => document.cookie')` |
| `screenshot(path?)` | 截图调试 | `await debugger.screenshot('./debug.png')` |
| `close()` | 关闭浏览器 | `await debugger.close()` |

---

## 🎯 实战案例

### 案例 1：提取签名参数

```typescript
const debugger = createDebugger({
  targetUrl: 'https://api.example.com',
  headless: false
});

await debugger.init();
await debugger.navigate();
await debugger.injectFetchHook();

// 触发接口
await debugger.click('#load-products');
await debugger.wait(3000);

// 提取签名
const requests = debugger.getCapturedRequests();
const targetReq = requests.find(r => r.url.includes('/products/list'));

if (targetReq?.sign) {
  console.log('签名:', targetReq.sign);
  console.log('时间戳:', targetReq.timestamp);
  console.log('完整参数:', targetReq.body);
}
```

### 案例 2：调用页面加密函数

```typescript
// 假设页面有 generateSign 函数
const params = {
  page: 1,
  pageSize: 20,
  category: 'electronics'
};

const sign = await debugger.callEncryptFunction('generateSign', params);
console.log('生成的签名:', sign);

// 或者使用 Crypto 对象
const token = await debugger.callEncryptFunction('sign', params);
```

### 案例 3：配合 OpenClaw 工作流

```yaml
# workflows/auto-sign.yaml
name: 加密接口自动化
version: 1.0

steps:
  - name: init_browser
    action: evaluate
    params:
      fn: |
        () => {
          const { createDebugger } = require('web-reverse-debugger');
          global.debugger = createDebugger({
            targetUrl: 'https://www.example.com',
            headless: false
          });
          return global.debugger.init();
        }

  - name: load_page
    action: evaluate
    params:
      fn: |
        () => global.debugger.navigate()

  - name: inject_hooks
    action: evaluate
    params:
      fn: |
        () => {
          global.debugger.injectFetchHook();
          return global.debugger.injectXHRHook();
        }

  - name: trigger_api
    action: evaluate
    params:
      fn: |
        () => {
          global.debugger.click('#load-btn');
          return global.debugger.wait(3000);
        }

  - name: extract_sign
    action: evaluate
    params:
      fn: |
        () => {
          const reqs = global.debugger.getCapturedRequests();
          const req = reqs.find(r => r.url.includes('/api/data'));
          return { sign: req?.sign, body: req?.body };
        }
    output: sign_data

  - name: call_api
    action: http.request
    params:
      url: https://api.example.com/v1/data
      method: POST
      body: "${sign_data.body}"
      headers:
        X-Sign: "${sign_data.sign}"

  - name: cleanup
    action: evaluate
    params:
      fn: |
        () => global.debugger.close()
```

---

## 🔧 调试技巧

### 1. 打印加密函数调用栈

```javascript
await debugger.evaluate(() => {
  const originalSign = window.generateSign;
  window.generateSign = function(params) {
    console.log('🔍 加密函数被调用:', params);
    console.trace();
    return originalSign.call(this, params);
  };
});
```

### 2. 监控所有网络请求

```typescript
await debugger.evaluate(() => {
  window._allRequests = [];
  const originalFetch = window.fetch;
  window.fetch = async function(...args) {
    window._allRequests.push({
      url: args[0],
      method: args[1]?.method || 'GET',
      timestamp: Date.now()
    });
    return originalFetch.apply(this, args);
  };
});
```

### 3. 截图定位问题

```typescript
await debugger.screenshot('./debug-page.png');
```

---

## ⚠️ 常见问题

### Q1: 签名验证失败

**原因：** 时间戳过期或参数顺序不对

**解决：**
```typescript
// 每次请求重新生成时间戳
const params = {
  ...data,
  timestamp: Date.now()
};
const sign = await debugger.callEncryptFunction('generateSign', params);
```

### Q2: 加密函数找不到

**原因：** 代码混淆或函数名被压缩

**解决：**
```javascript
// 在浏览器控制台搜索
// 1. 使用断点调试
// 2. 跟踪调用链
// 3. 查看 window 对象

await debugger.evaluate(() => {
  // 搜索包含 sign 的函数
  const candidates = [];
  for (let key in window) {
    if (typeof window[key] === 'function' && 
        (key.toLowerCase().includes('sign') || key.toLowerCase().includes('encrypt'))) {
      candidates.push(key);
    }
  }
  console.log('候选函数:', candidates);
});
```

### Q3: 被网站检测为自动化脚本

**解决：** 启用 stealth 模式
```typescript
const debugger = createDebugger({
  targetUrl: 'https://target.com',
  stealth: true,
  headless: false
});
```

---

## 📊 性能对比

| 方案 | 开发时间 | 维护成本 | 稳定性 |
|------|----------|----------|--------|
| 传统扣代码 | 2-5 天 | 高 | 中 |
| **Web Reverse Debugger** | **2-5 小时** | **低** | **高** |
| 官方 API | 1 小时 | 无 | 最高 |

---

## ⚖️ 法律与道德

**重要提醒：**

1. ✅ 遵守网站 robots.txt 协议
2. ✅ 控制请求频率，避免 DDOS
3. ✅ 仅用于学习研究和个人项目
4. ✅ 遵守《网络安全法》《数据安全法》
5. ❌ 不要用于商业爬虫或侵犯他人权益
6. ❌ 不要绕过付费墙或权限控制

**优先使用官方 API！**

---

## 📚 扩展阅读

- [OpenClaw 官方文档](https://docs.openclaw.ai)
- [Playwright 文档](https://playwright.dev)
- [JS 逆向工程指南](https://github.com/zhaoolee/JSReverse)

---

## 🤝 社区支持

- **问题反馈**: GitHub Issues
- **技术交流**: OpenClaw Discord
- **案例分享**: ClawHub 社区

---

## 📝 更新日志

### v1.0.0 (2026-03-12)
- ✨ 初始版本发布
- ✅ 支持 Fetch/XHR 请求拦截
- ✅ 支持加密函数调用
- ✅ 支持反检测模式
- ✅ 完整的 TypeScript 类型定义

---

## 📄 许可证

MIT License © 2026 郑宇航

---

**作者**: 郑宇航  
**GitHub**: https://github.com/rfdiosuao/openclaw-skills  
**ClawHub**: https://clawhub.ai
