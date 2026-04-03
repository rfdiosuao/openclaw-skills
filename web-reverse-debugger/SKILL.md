# 🔓 Web Reverse Debugger - 网页逆向调试助手

> **自动破解参数签名 | 实现加密接口自动化调用**

**作者**: 郑宇航  
**版本**: 1.0.0  
**分类**: 开发工具  
**标签**: #逆向 #加密 #签名 #浏览器自动化 #Playwright #数据采集

---

## 🎯 功能特性

- 🔐 **自动提取加密参数** - 拦截请求，自动提取 sign、token、timestamp 等签名参数
- 💉 **Hook 加密函数** - 注入浏览器，跟踪加密函数调用栈
- 🌐 **拦截 HTTP/WebSocket** - 捕获完整请求和响应报文
- ⚡ **OpenClaw 集成** - 配合工作流实现自动化调用
- 🛡️ **反检测支持** - 可选 stealth 模式，绕过自动化检测

---

## 🚀 快速开始

### 安装

```bash
claw skill install web-reverse-debugger
```

### 基础使用

```typescript
import { createDebugger } from 'web-reverse-debugger';

async function main() {
  const debugger = createDebugger({
    targetUrl: 'https://www.example.com',
    headless: false
  });

  await debugger.init();
  await debugger.navigate();
  await debugger.injectFetchHook();
  
  // 触发接口
  await debugger.click('#load-btn');
  await debugger.wait(3000);
  
  // 获取捕获的请求
  const requests = debugger.getCapturedRequests();
  console.log(requests);
  
  await debugger.close();
}
```

---

## 📦 API 参考

### 创建调试器

```typescript
const debugger = createDebugger({
  targetUrl: 'https://target.com',  // 目标网站
  headless: false,                  // 是否无头模式
  apiPattern: '**/api/**',          // API 匹配模式
  stealth: true                     // 启用反检测
});
```

### 核心方法

| 方法 | 说明 |
|------|------|
| `init()` | 初始化浏览器 |
| `navigate(url?)` | 访问网页 |
| `injectFetchHook()` | 注入 Fetch Hook |
| `injectXHRHook()` | 注入 XHR Hook |
| `callEncryptFunction(name, params)` | 调用页面加密函数 |
| `getCapturedRequests()` | 获取捕获的请求 |
| `click(selector)` | 点击元素 |
| `fill(selector, value)` | 填充表单 |
| `evaluate(script)` | 执行自定义 JS |
| `screenshot(path?)` | 截图 |
| `close()` | 关闭浏览器 |

---

## 🎬 使用场景

### 1. 提取签名参数

```typescript
await debugger.injectFetchHook();
await debugger.click('#submit-btn');
await debugger.wait(3000);

const requests = debugger.getCapturedRequests();
const sign = requests.find(r => r.url.includes('/api/data'))?.sign;
```

### 2. 调用加密函数

```typescript
const sign = await debugger.callEncryptFunction('generateSign', {
  page: 1,
  timestamp: Date.now()
});
```

### 3. OpenClaw 工作流集成

```yaml
steps:
  - name: init
    action: evaluate
    params:
      fn: |
        () => {
          const { createDebugger } = require('web-reverse-debugger');
          global.dbg = createDebugger({ targetUrl: 'https://example.com' });
          return global.dbg.init();
        }
  
  - name: capture
    action: evaluate
    params:
      fn: |
        () => {
          global.dbg.click('#btn');
          return global.dbg.wait(3000).then(() => global.dbg.getCapturedRequests());
        }
    output: captured
```

---

## ⚠️ 注意事项

1. **合法使用** - 仅用于学习研究，遵守 robots.txt
2. **控制频率** - 避免对目标服务器造成压力
3. **优先官方 API** - 有官方接口时优先使用
4. **调试模式** - 建议 `headless: false` 便于观察

---

## 📚 依赖

- Node.js >= 18.0.0
- Playwright >= 1.40.0

---

## 📄 许可证

MIT License

---

**完整文档**: https://github.com/rfdiosuao/openclaw-skills/tree/main/web-reverse-debugger
