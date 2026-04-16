---
name: openclaw-adb-master-rfd
description: 顶尖 ADB 控制 Skill v3.0 - 视觉定位+Deep Link+智能等待，支持物理机/模拟器/云手机/Android TV
version: 3.0.0
author: OpenClaw Skill Master
metadata:
  openclaw:
    emoji: "🤖"
    os: ["darwin", "linux"]
    requires: { bins: ["adb", "adbclaw"] }
    install:
      - id: adbclaw-install
        kind: script
        script: "curl -fsSL https://github.com/AdbClaw/adbclaw/releases/latest/download/install.sh | bash"
        bins: ["adbclaw"]
        label: "Install adbclaw"
      - id: adb-install
        kind: brew
        formula: android-platform-tools
        bins: ["adb"]
        label: "Install ADB"
---

# OpenClaw ADB Master - 顶尖 Android 设备控制

**核心原则：** 速度 < 200ms | 准确率 > 99% | 流畅自动化 | 视觉友好

## 🚀 快速开始

### 1. 连接设备
```bash
# USB 连接（自动检测）
adb-master connect

# WiFi 连接
adb-master connect --wifi 192.168.1.100:5555

# 云手机连接
adb-master connect --cloud duoplus --host xxx.duoplus.net
```

### 2. 验证连接
```bash
adb-master device info
```

### 3. 开始控制
```bash
# 观察屏幕（快速模式）
adb-master observe

# 点击元素
adb-master tap --index 5

# 输入文本
adb-master type "Hello"

# 滑动
adb-master swipe up
```

## 📋 核心命令

### 观察命令（3 模式）

| 模式 | 命令 | 延迟 | 用途 |
|------|------|------|------|
| **快速** | `observe --mode fast` | <200ms | 默认，日常操作 |
| **标注** | `observe --mode annotated` | <500ms | 视觉模型友好 |
| **压缩** | `observe --mode compressed --quality 80` | <400ms | 远程/云手机 |

### 定位策略（5 种）

```
1. 索引定位 ✅ 最稳定
   tap --index 5

2. 边界定位 ✅ 精确
   tap --bounds "[100,200][300,400]"

3. 视觉定位 ✅ 智能（阶段 3）
   vision-tap --description "红色登录按钮"

4. Deep Link ✅ 最快（阶段 3）
   deep-link --app douyin --action search --params '{"keyword":"OpenClaw"}'

5. 坐标定位 ⚠️ 备用
   tap 540 960
```

### 交互命令

```bash
# 点击
tap --index 5
tap --text "提交"
tap --id "com.app:id/login"

# 长按/双击
long-press --index 3 --duration 2000
double-tap --index 3

# 滑动
swipe up      # 向上滑动（向下滚动）
swipe down    # 向下滑动（向上滚动）
swipe left    # 向左滑动
swipe right   # 向右滑动

# 输入
type "Hello World"
key ENTER     # 回车
key BACK      # 返回
key HOME      # 主屏幕

# App 管理
app launch com.tencent.mm      # 启动微信
app stop com.tencent.mm        # 停止微信
app current                    # 当前 App
app list                       # 已安装 App 列表
```

## 🎯 工作流模式

### 自动化工作流
```bash
# 执行任务（自动观察→执行→验证）
adb-master run "打开抖音并搜索 OpenClaw"
```

### 脚本模式
```bash
# 执行自定义脚本
adb-master script my-script.json
```

## ⚙️ 配置文件

`~/.openclaw/skills/openclaw-adb-master/config.json`:
```json
{
  "defaultMode": "fast",
  "timeout": 30000,
  "retryAttempts": 3,
  "screenshotQuality": 80,
  "autoWait": true,
  "animationDetect": true
}
```

## 📱 App Profiles

内置优化的 App 配置：
- 抖音（Deep Links + 布局缓存）
- 微信（Deep Links + 已知 UI）
- 支付宝（Deep Links + 快捷操作）
- 淘宝（Deep Links + 搜索优化）

## 🔧 故障排查

```bash
# 诊断工具
adb-master doctor

# 查看日志
adb-master logs

# 重置连接
adb-master reset
```

## 📖 完整文档

- 使用指南：`docs/usage.md`
- API 参考：`docs/api.md`
- App Profiles: `profiles/`
- 示例脚本：`examples/`
