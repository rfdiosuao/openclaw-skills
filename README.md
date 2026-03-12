# 📖 OpenClaw 双机互修助手 - 使用文档

> **版本：** v1.0.0  
> **作者：** OpenClaw Skill Master  
> **创建日期：** 2026-03-12  
> **基于文档：** [OpenClaw 高并发场景稳定性优化](https://my.feishu.cn/docx/Tgu7dwKX5ol7m8xNF4ycadjznPe)

---

## 🎯 技能定位

当有**两只 OpenClaw** 时，可以互相修复对方的问题。通过双机互相监控、诊断和修复，实现 7×24 小时稳定运行。

### 适用场景

| 场景 | 说明 | 价值 |
|------|------|------|
| **生产环境双机部署** | 两台服务器各运行一个 OpenClaw 实例 | 互相监控，故障自愈 |
| **主备切换** | 主机故障时备机自动接管 | 业务连续性保障 |
| **负载均衡** | 多实例分担请求压力 | 提高系统吞吐量 |
| **异地容灾** | 跨地域部署，互为备份 | 灾难恢复能力 |

---

## 🚀 快速开始

### 1. 安装 Skill

```bash
# 方式 1：通过 Claw-CLI 安装
claw skill install openclaw-mutual-repair

# 方式 2：手动安装
git clone https://github.com/rfdiosuao/openclaw-skills.git
cd openclaw-skills/openclaw-mutual-repair
npm install
npm run build
```

### 2. 配置双机环境

#### 机器 A 配置

```json5
// ~/.openclaw/openclaw.json
{
  "identity": {
    "name": "OpenClaw-A",
    "emoji": "⚡"
  },
  "agents": {
    list: [
      {
        "id": "main",
        "workspace": "~/.openclaw/workspace",
        "model": { 
          "primary": "anthropic/claude-sonnet-4-5"
        }
      },
      {
        "id": "repair",
        "workspace": "~/.openclaw/workspace-repair",
        "triggers": [
          { 
            "type": "messageContains", 
            "values": ["修复", "repair", "诊断", "diagnose", "检查"]
          }
        ],
        "tools": {
          "allow": ["exec", "process", "read", "write", "edit"]
        }
      }
    ]
  },
  "gateway": {
    "port": 18789,
    "remote": {
      "enabled": true,
      "url": "ws://machine-b:18789"
    }
  }
}
```

#### 机器 B 配置

```json5
// ~/.openclaw/openclaw.json
{
  "identity": {
    "name": "OpenClaw-B",
    "emoji": "🔧"
  },
  "agents": {
    list: [
      {
        "id": "main",
        "workspace": "~/.openclaw/workspace",
        "model": { 
          "primary": "anthropic/claude-sonnet-4-5"
        }
      },
      {
        "id": "repair",
        "workspace": "~/.openclaw/workspace-repair",
        "triggers": [
          { 
            "type": "messageContains", 
            "values": ["修复", "repair", "诊断", "diagnose", "检查"]
          }
        ],
        "tools": {
          "allow": ["exec", "process", "read", "write", "edit"]
        }
      }
    ]
  },
  "gateway": {
    "port": 18789,
    "remote": {
      "enabled": true,
      "url": "ws://machine-a:18789"
    }
  }
}
```

### 3. 启动服务

```bash
# 机器 A
openclaw gateway start

# 机器 B
openclaw gateway start
```

---

## 📋 功能详解

### 1. 内存监控与泄漏检测

**触发关键词：** `内存`、`memory`、`泄漏`、`leak`

**示例对话：**

```
用户：检查内存使用情况
OpenClaw: 
## 🔍 内存检查结果

{
  "status": "warning",
  "processes": [
    {
      "pid": "12345",
      "cpu": 15.2,
      "mem": 87.5,
      "command": "node app.js"
    }
  ],
  "system": {
    "total": 16384,
    "used": 14200,
    "free": 2184,
    "usage": 87
  },
  "recommendations": [
    "系统内存使用率 87%，建议检查内存泄漏",
    "进程 12345 内存使用过高 (87.5%)，建议配置 max_memory_restart"
  ]
}
```

**自动修复建议：**

```bash
# 1. 配置 PM2 内存限制
pm2 start app.js --max-memory-restart 1G

# 2. 生成堆快照分析
node --inspect app.js

# 3. 使用 clinic 分析
npx clinic doctor -- node app.js
```

### 2. PM2 进程守护检查

**触发关键词：** `PM2`、`进程`、`守护`、`process`

**示例对话：**

```
用户：PM2 状态正常吗？
OpenClaw:
## 🔍 PM2 状态检查

{
  "status": "warning",
  "processes": [
    {
      "name": "openclaw",
      "status": "online",
      "pid": 12345,
      "memory": 524288000,
      "cpu": 12.5,
      "restarts": 15
    }
  ],
  "recommendations": [
    "进程 openclaw 重启次数过多：15 次",
    "建议检查日志：pm2 logs openclaw"
  ]
}
```

**自动修复命令：**

```bash
# 重启所有进程
pm2 restart all

# 查看日志
pm2 logs openclaw --lines 50

# 删除并重新添加
pm2 delete openclaw
pm2 start ecosystem.config.js
```

### 3. systemd 服务检查

**触发关键词：** `systemd`、`服务`、`service`

**示例对话：**

```
用户：检查 systemd 服务状态
OpenClaw:
## 🔍 systemd 服务状态

{
  "status": "warning",
  "active": false,
  "subState": "failed",
  "mainPid": null,
  "memoryUsage": null,
  "recommendations": [
    "OpenClaw 服务未运行，建议启动：sudo systemctl start openclaw"
  ]
}
```

**自动修复命令：**

```bash
# 启动服务
sudo systemctl start openclaw

# 查看状态
systemctl status openclaw

# 查看日志
journalctl -u openclaw -n 50
```

### 4. WebSocket 连接诊断

**触发关键词：** `WebSocket`、`连接`、`断连`、`disconnect`

**示例对话：**

```
用户：WebSocket 怎么老是断连？
OpenClaw:
## 🔍 WebSocket 连接诊断

{
  "status": "warning",
  "establishedConnections": 3,
  "gatewayStatus": "200",
  "recentDisconnects": [
    "2026-03-12 13:20:00 - WebSocket disconnected",
    "2026-03-12 13:15:00 - Reconnecting...",
    "2026-03-12 13:10:00 - WebSocket disconnected"
  ],
  "recommendations": [
    "检测到频繁断连，建议检查网络和心跳配置",
    "配置心跳保活：heartbeat.interval: 30000",
    "配置指数退避重连"
  ]
}
```

**优化配置：**

```json5
{
  "agents": {
    defaults: {
      heartbeat: {
        every: "30m",
        interval: 30000,  // 30 秒心跳
        timeout: 10000    // 10 秒超时
      }
    }
  }
}
```

### 5. 全面健康检查

**触发关键词：** `健康`、`health`、`检查`、`status`、`诊断`

**示例对话：**

```
用户：帮我做个全面健康检查
OpenClaw:
## 🏥 全面健康检查

**整体状态：** degraded
**检查时间：** 2026-03-12T13:25:00Z

### 详细结果
{
  "memory": { "status": "warning", "usage": 87 },
  "pm2": { "status": "ok" },
  "systemd": { "status": "ok" },
  "websocket": { "status": "warning" }
}

### 修复建议
1. 🔴 内存使用率过高，建议：
   - 配置 PM2 max_memory_restart: 1G
   - 检查内存泄漏（使用 clinic.js）
   - 考虑增加系统内存或优化代码

2. 🟡 WebSocket 连接异常，建议：
   - 检查 Gateway 状态：openclaw gateway status
   - 配置心跳保活：heartbeat.interval: 30000
   - 配置指数退避重连
```

### 6. 生成优化配置

**触发关键词：** `配置`、`优化`、`config`、`template`

**示例对话：**

```
用户：生成优化配置模板
OpenClaw:
## ⚙️ 优化配置模板

```json5
{
  "identity": {
    "name": "OpenClaw",
    "theme": "stable production instance",
    "emoji": "⚡"
  },
  "agents": {
    defaults: {
      workspace: "~/.openclaw/workspace",
      model: {
        primary": "anthropic/claude-sonnet-4-5",
        fallbacks": ["anthropic/claude-opus-4-6"]
      },
      heartbeat: {
        every: "30m",
        target: "last"
      },
      sandbox: {
        mode": "non-main"
      }
    }
  },
  "session": {
    dmScope": "per-channel-peer",
    reset": {
      mode": "daily",
      atHour": 4,
      idleMinutes": 120
    }
  },
  "tools": {
    allow": ["exec", "process", "read", "write", "edit"],
    exec: {
      backgroundMs: 10000,
      timeoutSec: 1800
    }
  }
}
```
```

---

## 🤝 双机互修协议

### 工作流程

```
机器 A (192.168.1.100)          机器 B (192.168.1.101)
       │                              │
       ├──── 定期发送心跳 ────────────►│
       │    (每 5 分钟)                  │
       │                              │
       │◄──── 返回健康状态 ───────────┤
       │    { status: "ok" }          │
       │                              │
       ├──── 发现异常 ────────────────►│
       │    (请求协助)                 │
       │    "请帮我检查 PM2 状态"        │
       │                              │
       │◄──── 诊断建议 ───────────────┤
       │    (或自动修复)               │
       │    "检测到重启次数过多..."     │
       │                              │
```

### 互修命令示例

#### 在机器 A 上询问机器 B

```
@openclaw-b 请检查机器 B 的 PM2 状态
```

**回复：**
```
## 🔍 机器 B PM2 状态

✅ 运行正常
├─ openclaw online
├─ 内存：450MB
├─ CPU: 12%
└─ 重启次数：2

无需修复。
```

#### 在机器 B 上请求机器 A 协助

```
@openclaw-a 机器 A 的 WebSocket 断连了，帮忙修复
```

**回复：**
```
## 🔧 正在修复机器 A WebSocket 连接

**诊断结果：**
- 网关状态：200 OK
- 断连频率：5 次/小时（过高）
- 心跳间隔：未配置

**修复步骤：**
1. ✅ 已更新配置：heartbeat.interval: 30000
2. ✅ 已重启 Gateway
3. ✅ 连接已恢复

请持续观察断连情况。
```

---

## 📊 监控指标

### 核心指标

| 指标类别 | 具体指标 | 正常值 | 告警阈值 |
|---------|---------|-------|---------|
| **资源** | CPU 使用率 | < 50% | > 80% |
| **资源** | 内存使用率 | < 70% | > 85% |
| **资源** | 磁盘使用率 | < 60% | > 90% |
| **连接** | WebSocket 连接数 | > 10 | < 5 |
| **连接** | 断连频率 | < 2 次/小时 | > 5 次/小时 |
| **业务** | 消息处理延迟 | < 2 秒 | > 5 秒 |
| **业务** | 任务失败率 | < 0.5% | > 1% |

### Prometheus 监控配置

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'openclaw-a'
    static_configs:
      - targets: ['192.168.1.100:9090']
    metrics_path: '/metrics'
    
  - job_name: 'openclaw-b'
    static_configs:
      - targets: ['192.168.1.101:9090']
    metrics_path: '/metrics'
```

### Grafana 仪表盘

导入 Dashboard ID：`openclaw-mutual-repair`

**面板包含：**
- 内存使用趋势
- CPU 使用率
- WebSocket 连接数
- 断连频率
- 消息处理延迟
- 任务成功率

---

## 🛠️ 故障排查

### 常见问题

#### 1. 内存持续增长

**症状：** RSS 内存随时间增长，不下降

**排查步骤：**
```bash
# 1. 查看内存使用
ps aux | grep node

# 2. 生成堆快照
node --inspect app.js

# 3. 使用 Chrome DevTools 分析
# 访问 chrome://inspect

# 4. 使用 clinic 分析
npx clinic doctor -- node app.js
```

**解决方案：**
- 配置 `max_memory_restart: 1G`
- 使用 LRU 缓存替代普通对象
- 及时清理事件监听器
- 流式处理替代批量处理

#### 2. 频繁断连

**症状：** WebSocket 连接不断断开重连

**排查步骤：**
```bash
# 查看日志
tail -f ~/.openclaw/logs/combined.log | grep -i "disconnect"

# 检查网络
ping gateway.example.com
traceroute gateway.example.com

# 检查防火墙
sudo iptables -L -n | grep 18789
```

**解决方案：**
- 配置指数退避重连
- 添加心跳保活机制
- 检查防火墙/代理设置
- 增加重连次数限制

#### 3. 进程崩溃

**症状：** OpenClaw 进程无预警退出

**排查步骤：**
```bash
# 查看 systemd 日志
journalctl -u openclaw -n 50

# 查看 PM2 日志
pm2 logs openclaw --lines 50

# 查看 core dump
ls -lh /var/crash/
```

**解决方案：**
- 配置 `Restart=always`
- 添加未捕获异常处理
- 检查系统资源限制（ulimit）
- 增加重启延迟

---

## 🔧 配置模板

### PM2 配置

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

### systemd 配置

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

---

## 📚 参考资料

- [OpenClaw 高并发稳定性优化文档](https://my.feishu.cn/docx/Tgu7dwKX5ol7m8xNF4ycadjznPe)
- [PM2 生产环境部署](https://pm2.keymetrics.io/)
- [Node.js 性能调优](https://nodejs.org/en/docs/guides/)
- [Prometheus 监控](https://prometheus.io/)
- [Circuit Breaker 模式](https://martinfowler.com/bliki/CircuitBreaker.html)

---

## 📝 更新日志

### v1.0.0 (2026-03-12)
- ✨ 初始版本发布
- 🎯 支持内存监控、进程守护、连接诊断
- 🔧 提供 PM2/systemd 配置模板
- 🤝 实现双机互修协议
- 📊 集成 Prometheus 监控

---

**作者：** OpenClaw Skill Master  
**许可：** MIT  
**GitHub:** https://github.com/rfdiosuao/openclaw-skills/tree/main/openclaw-mutual-repair  
**反馈：** 欢迎提交 Issue 或 PR
