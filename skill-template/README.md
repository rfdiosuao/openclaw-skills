# Skill Name

> Skill 简短描述

## 📦 安装

```bash
# 从 ClawHub 安装
openclaw skills install skill-name
```

## 🚀 使用

```typescript
import { main } from 'skill-name';

// 使用示例
await main(ctx, { message: '你好' });
```

## 📖 API

### `main(ctx, args)`

Skill 主函数。

**参数：**
- `ctx` - 会话上下文
- `args` - 参数对象
  - `message` - 消息内容

**返回：**
- `Promise<void>`

## 🧪 测试

```bash
npm test
```

## 📝 更新日志

### v1.0.0 (2026-03-09)
- 初始版本

## 📄 许可证

MIT
