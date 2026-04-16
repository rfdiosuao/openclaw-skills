#!/bin/bash
# 检查当前连接的安卓设备是否为 DuoPlus 云机（版本 >= 2.0.0）
# 用法: check_env.sh [DEVICE_ID]
# 返回: 退出码 0 表示支持，非 0 表示不支持
set -euo pipefail

DEVICE_ID="${1:-}"
VERSION_FILE="/data/misc/dplus/version"
MIN_VERSION="2.0.0"

# 构建 adb 命令前缀
if [ -n "$DEVICE_ID" ]; then
  ADB_CMD="adb -s $DEVICE_ID"
else
  ADB_CMD="adb"
fi

# 检查 adb 是否可用
if ! command -v adb &>/dev/null; then
  echo "❌ adb not found in PATH"
  exit 1
fi

# 检查设备是否连接
if ! $ADB_CMD get-state &>/dev/null; then
  echo "❌ No device connected${DEVICE_ID:+ (device: $DEVICE_ID)}"
  exit 1
fi

# 读取版本文件
DEVICE_VERSION=$($ADB_CMD shell "cat $VERSION_FILE 2>/dev/null" | tr -d '[:space:]')

if [ -z "$DEVICE_VERSION" ]; then
  echo "❌ Not a DuoPlus cloud phone: version file $VERSION_FILE not found"
  exit 1
fi

# 比较版本号（使用 sort -V 进行语义化版本比较）
# 如果 MIN_VERSION 排在前面或相等，说明 DEVICE_VERSION >= MIN_VERSION
LOWEST=$(printf '%s\n%s' "$MIN_VERSION" "$DEVICE_VERSION" | sort -V | head -n1)

if [ "$LOWEST" = "$MIN_VERSION" ]; then
  echo "✅ DuoPlus cloud phone detected: v$DEVICE_VERSION (>= $MIN_VERSION)"
  exit 0
else
  echo "❌ DuoPlus version too low: v$DEVICE_VERSION (requires >= $MIN_VERSION)"
  exit 1
fi
