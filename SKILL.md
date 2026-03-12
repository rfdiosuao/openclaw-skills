# OpenClaw 双机互修助手 ⚡

> **当有两只 OpenClaw 时，可以互相修复对方的问题**

## 📖 技能说明

本 Skill 基于《OpenClaw 高并发场景稳定性优化》文档开发，专为多 OpenClaw 实例部署场景设计。通过双机互相监控、诊断和修复，实现 7×24 小时稳定运行。

### 🎯 核心能力

| 能力 | 说明 | 触发关键词 |
|------|------|----------|
| **内存监控** | 检测内存泄漏，建议重启 | `内存`、`memory`、`泄漏` |
| **进程守护** | 检查 PM2/systemd 状态 | `进程`、`崩溃`、`守护` |
| **连接诊断** | WebSocket 断连分析 | `断连`、`连接`、`websocket` |
| **配置优化** | 生成最佳实践配置 | `配置`、`优化`、`pm2` |
| **健康检查** | 全面健康状态评估 | `健康`、`检查`、`status` |
| **互修模式** | 双机互相修复 | `修复`、`repair`、`互修` |

## 🚀 快速开始

### 1. 安装 Skill

```bash
claw skill install openclaw-mutual-repair
```

### 2. 配置双机环境

在两台机器上分别配置 OpenClaw，确保可以互相访问：

```json5
// ~/.openclaw/openclaw.json
{
  "agents": {
    list: [
      {
        id: "main",
        workspace: "~/.openclaw/workspace",
        model: { primary: "anthropic/claude-sonnet-4-5" }
      },
      {
        id: "repair",
        workspace: "~/.openclaw/workspace-repair",
        triggers: [
          { type: "messageContains", values: ["修复", "repair", "诊断", "diagnose"] }
        ]
      }
    ]
  },
  "tools": {
    allow: ["exec", "read", "write", "edit", "process"]
  }
}
```

### 3. 使用示例

#### 单机模式（自我诊断）

```
帮我检查内存使用情况
```

#### 双机模式（互相修复）

在机器 A 上：
```
@openclaw-b 请检查机器 B 的 PM2 状态
```

在机器 B 上：
```
@openclaw-a 机器 A 的 WebSocket 断连了，帮忙修复
```

## 📋 功能详解

### 1. 内存监控与优化

**检测命令：**
```
检查内存泄漏
内存使用正常吗？
memory status
```

**输出示例：**
```json
{
  "status": "warning",
  "rss": "1.2 GB",
  "heapUsed": "950 MB",
  "recommendation": "建议配置 max_memory_restart: 1G"
}
```

**自动修复建议：**
```bash
# 修改 PM2 配置
pm2 start app.js --max-memory-restart 1G
```

### 2. 进程守护检查

**检测命令：**
```
检查 PM2 状态
进程守护配置
systemd 状态
```

**输出示例：**
```plaintext
✅ PM2 运行中
├─ openclaw online 0ms
├─ 重启次数：2
└─ 内存：450MB

建议：配置 autorestart: true
```

### 3. WebSocket 连接诊断

**检测命令：**
```
检查 WebSocket 连接
断连原因分析
连接池状态
```

**输出示例：**
```plaintext
⚠️ 检测到断连（过去 1 小时 5 次）

可能原因：
1. 网络波动（40%）
2. 服务端超时（30%）
3. 心跳间隔过长（20%）

建议配置：
- heartbeat.interval: 30000
- reconnect.maxRetries: 10
```

### 4. 健康检查接口

**检测命令：**
```
健康检查
health check
全面诊断
```

**输出示例：**
```json
{
  "status": "healthy",
  "uptime": "72h 15m",
  "memory": { "status": "ok", "usage": "45%" },
  "connections": { "status": "ok", "active": 12 },
  "cpu": { "status": "ok", "usage": "23%" }
}
```

### 5. 双机互修协议

**工作流程：**

```
机器 A                          机器 B
  │                              │
  ├──── 定期发送心跳 ────────────►│
  │                              │
  │◄──── 返回健康状态 ───────────┤
  │                              │
  ├──── 发现异常 ────────────────►│
  │    (请求协助)                 │
  │                              │
  │◄──── 诊断建议 ───────────────┤
  │    (或自动修复)               │
```

**互修命令：**
```
请检查对方的 PM2 状态
帮对方重启 openclaw 进程
同步配置文件到对方机器
```

## 🔧 配置模板

### PM2 配置（推荐）

创建 `ecosystem.config.js`：

```javascript
module.exports = {
  apps: [{
    name: 'openclaw',
    script: './app.js',
    instances: 1,
    exec_mode: 'fork',
    
    // 重启策略
    autorestart: true,
    watch: false,
    max_restarts: 10,
    min_uptime: '10s',
    restart_delay: 4000,
    
    // 资源限制
    max_memory_restart: '1G',
    
    // 日志配置
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    
    env: {
      NODE_ENV: 'production',
      MAX_CONNECTIONS: 100,
      HEARTBEAT_INTERVAL: 30000
    }
  }]
};
```

### systemd 配置（Linux 生产环境）

创建 `/etc/systemd/system/openclaw.service`：

```ini
[Unit]
Description=OpenClaw Service
After=network.target

[Service]
Type=simple
User=deploy
WorkingDirectory=/opt/openclaw
ExecStart=/usr/bin/node app.js
Restart=always
RestartSec=5
StartLimitBurst=5
StartLimitInterval=60s

LimitNOFILE=65536
LimitNPROC=4096

StandardOutput=journal
StandardError=journal
SyslogIdentifier=openclaw

[Install]
WantedBy=multi-user.target
```

### 健康检查脚本

创建 `health-check.sh`：

```bash
#!/bin/bash
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health)

if [ "$RESPONSE" -eq 200 ]; then
  echo "✅ Health check passed"
  exit 0
else
  echo "❌ Health check failed (HTTP $RESPONSE)"
  exit 1
fi
```

## 📊 监控指标

### 核心指标

| 指标类别 | 具体指标 | 告警阈值 |
|---------|---------|---------|
| **资源** | CPU 使用率 | > 80% |
| **资源** | 内存使用率 | > 85% |
| **资源** | 磁盘使用率 | > 90% |
| **连接** | WebSocket 连接数 | < 预期值 |
| **连接** | 断连频率 | > 5 次/小时 |
| **业务** | 消息处理延迟 | > 5 秒 |
| **业务** | 任务失败率 | > 1% |

### Prometheus 配置示例

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'openclaw'
    static_configs:
      - targets: ['localhost:9090']
    metrics_path: '/metrics'
```

## 🛠️ 故障排查

### 常见问题

#### 1. 内存持续增长

**症状：** RSS 内存随时间增长，不下降

**排查步骤：**
```bash
# 1. 生成堆快照
node --inspect app.js

# 2. 使用 clinic 分析
npx clinic doctor -- node app.js

# 3. 检查事件监听器
node -e "console.log(process.listeners('message').length)"
```

**解决方案：**
- 配置 `max_memory_restart`
- 使用 LRU 缓存替代普通对象
- 及时清理事件监听器

#### 2. 频繁断连

**症状：** WebSocket 连接不断断开重连

**排查步骤：**
```bash
# 查看日志
tail -f logs/error.log | grep -i "disconnect"

# 检查网络
ping gateway.example.com
```

**解决方案：**
- 配置指数退避重连
- 添加心跳保活机制
- 检查防火墙/代理设置

#### 3. 进程崩溃

**症状：** OpenClaw 进程无预警退出

**排查步骤：**
```bash
# 查看 systemd 日志
journalctl -u openclaw -n 50

# 查看 PM2 日志
pm2 logs openclaw --lines 50
```

**解决方案：**
- 配置 `Restart=always`
- 添加未捕获异常处理
- 检查系统资源限制（ulimit）

## 🤝 双机互修最佳实践

### 1. 配置同步

使用 rsync 定期同步配置：

```bash
#!/bin/bash
# sync-config.sh
REMOTE="user@remote-host:/opt/openclaw/"
rsync -avz ~/.openclaw/openclaw.json $REMOTE
```

### 2. 互相监控

在两台机器上配置互相检查：

```json5
{
  "agents": {
    defaults: {
      heartbeat: {
        every: "5m",
        target: "last",
        prompt: "请检查对方机器的健康状态"
      }
    }
  }
}
```

### 3. 故障转移

配置自动故障转移：

```javascript
// failover.js
const primary = 'http://primary:18789';
const backup = 'http://backup:18789';

async function checkAndFailover() {
  try {
    await fetch(primary + '/health');
  } catch {
    console.log('Primary down, switching to backup');
    // 切换到备用机器
  }
}
```

## 📚 参考资料

- [OpenClaw 高并发稳定性优化文档](https://my.feishu.cn/docx/Tgu7dwKX5ol7m8xNF4ycadjznPe)
- [PM2 生产环境部署](https://pm2.keymetrics.io/)
- [Node.js 性能调优](https://nodejs.org/en/docs/guides/)
- [Prometheus 监控](https://prometheus.io/)

## 📝 更新日志

### v1.0.0 (2026-03-12)
- ✨ 初始版本发布
- 🎯 支持内存监控、进程守护、连接诊断
- 🔧 提供 PM2/systemd 配置模板
- 🤝 实现双机互修协议

---

**作者：** OpenClaw Skill Master  
**许可：** MIT  
**反馈：** 欢迎在 GitHub 提交 Issue 或 PR
