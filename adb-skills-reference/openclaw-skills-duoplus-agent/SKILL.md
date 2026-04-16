---
name: duoplus-agent
displayName: DuoPlus CloudPhone Agent
description: Control Android cloud phones via ADB - tap, swipe, type, screenshot, read UI elements. Send commands to DuoPlus cloud phones running.
version: 1.0.0
license: MIT-0
metadata:
  clawdbot:
    emoji: "📱"
    requires:
      bins: ["adb"]
changelog: change send_command.sh
---
# DuoPlus CloudPhone Agent
Control Android cloud phones remotely through ADB broadcast commands. The target device must be running **DuoPlus CloudPhone**.

For more information about our product and services, visit [DuoPlus Official Website](https://www.duoplus.net/).

## Connection

Before any operation, connect to the device:

```bash
# List available devices
adb devices -l

# Connect to remote device (if needed)
adb connect <IP>:<PORT>
```

All subsequent commands use `-s <DEVICE_ID>` to target a specific device.

## Environment Check

This skill only works on DuoPlus cloud phones with Service version >= 2.0.0. Before using any commands, verify the device is compatible:

```bash
# Check if device is a supported DuoPlus cloud phone
scripts/check_env.sh <DEVICE_ID>

# Or without device ID (uses default connected device)
scripts/check_env.sh
```

The script checks `/data/misc/dplus/version` on the device. If the file doesn't exist or the version is below 2.0.0, the device is not supported.

You can also check manually:
```bash
adb -s <DEVICE_ID> shell cat /data/misc/dplus/version
```

## How Commands Work

Commands are sent as Base64-encoded JSON via ADB broadcast:

```bash
# 1. Build JSON payload
JSON='{"task_type":"ai","action":"execute","task_id":"TASK_ID","md5":"MD5","action_name":"ACTION","params":{...}}'

# 2. Base64 encode
BASE64=$(echo -n "$JSON" | base64 -w 0)

# 3. Send broadcast
adb -s <DEVICE_ID> shell am broadcast -a com.duoplus.service.PROCESS_DATA --es message "$BASE64"
```

Generate a unique task_id per session (e.g. `openclaw-$(date +%s)`). Use a fixed md5 like `openclaw-md5`.

## Response Model

There are two types of commands with different response behaviors:

### Query command (synchronous response)
`get_ui_state` is the only query command. The broadcast receiver returns a JSON response directly in the broadcast result data, containing UI element descriptions and a Base64-encoded screenshot. You can read the response from the broadcast output.

### Action commands (fire-and-forget)
All `action: "execute"` commands (CLICK_COORDINATE, INPUT_CONTENT, SLIDE_PAGE, etc.) are fire-and-forget. They do NOT return execution results. After sending an action command, you should:
1. Wait 1-3 seconds for the operation to complete
2. Call `get_ui_state` to observe the current screen state and verify the result

## Available Actions

### Screenshot (has response)

**PAGE_SCREENSHOT** - Take a compressed screenshot and optionally save to a specified path
```bash
JSON='{"task_type":"ai","action":"execute","task_id":"ID","md5":"MD5","action_name":"PAGE_SCREENSHOT","params":{"save_path":"/sdcard/screenshot.webp"}}'
```
- `save_path` (optional): file path on device to save the compressed screenshot (also accepts `path` as alias). If omitted, screenshot is only returned as Base64 in the response.

Response JSON contains:
- `screenshot`: Base64-encoded compressed image
- `result_text`: the actual saved file path on success, or error message on failure. Empty if `save_path` was not specified.

To retrieve the saved file from the device:
```bash
adb -s <DEVICE_ID> pull /sdcard/screenshot.webp ./screenshot.webp
```

### Screen Reading (has response)

**get_ui_state** - Get interactive UI elements + compressed screenshot (Base64)
```bash
JSON='{"task_type":"ai","action":"get_ui_state","task_id":"ID","md5":"MD5","lang":"en"}'
```
Note: This uses `action: "get_ui_state"` (NOT `action: "execute"`).

Response JSON contains:
- `success`: boolean
- `message`: text description of all interactive UI elements on screen
- `screenshot`: Base64-encoded compressed image of current screen
- `current_app`: package name of the foreground app

This is the primary way to observe the device screen. Use it before and after every action to understand what happened.

### Navigation (fire-and-forget)

**GO_TO_HOME** - Press Home button
```bash
JSON='{"task_type":"ai","action":"execute","task_id":"ID","md5":"MD5","action_name":"GO_TO_HOME","params":{}}'
```

**PAGE_BACK** - Press Back button
```bash
JSON='{"task_type":"ai","action":"execute","task_id":"ID","md5":"MD5","action_name":"PAGE_BACK","params":{}}'
```

**OPEN_APP** - Launch app by package name
```bash
JSON='{"task_type":"ai","action":"execute","task_id":"ID","md5":"MD5","action_name":"OPEN_APP","params":{"package_name":"com.tencent.mm"}}'
```

### Tap & Click (fire-and-forget)

**CLICK_COORDINATE** - Tap at coordinates (0-1000 relative system, top-left=0,0, bottom-right=1000,1000)
```bash
JSON='{"task_type":"ai","action":"execute","task_id":"ID","md5":"MD5","action_name":"CLICK_COORDINATE","params":{"x":500,"y":500}}'
```

**CLICK_ELEMENT** - Click UI element by text, resource_id, or content_desc
```bash
JSON='{"task_type":"ai","action":"execute","task_id":"ID","md5":"MD5","action_name":"CLICK_ELEMENT","params":{"text":"Login"}}'
```
Optional params: `resource_id`, `class_name`, `content_desc`, `element_order` (0-based index when multiple match)

**LONG_COORDINATE** - Long press at coordinates
```bash
JSON='{"task_type":"ai","action":"execute","task_id":"ID","md5":"MD5","action_name":"LONG_COORDINATE","params":{"x":500,"y":500,"duration":1000}}'
```

**DOUBLE_TAP_COORDINATE** - Double tap at coordinates
```bash
JSON='{"task_type":"ai","action":"execute","task_id":"ID","md5":"MD5","action_name":"DOUBLE_TAP_COORDINATE","params":{"x":500,"y":500}}'
```

### Input (fire-and-forget)

**INPUT_CONTENT** - Type text into focused input field (must tap field first)
```bash
JSON='{"task_type":"ai","action":"execute","task_id":"ID","md5":"MD5","action_name":"INPUT_CONTENT","params":{"content":"Hello","clear_first":true}}'
```

**KEYBOARD_OPERATION** - Press keyboard key (enter/delete/tab/escape/space)
```bash
JSON='{"task_type":"ai","action":"execute","task_id":"ID","md5":"MD5","action_name":"KEYBOARD_OPERATION","params":{"key":"enter"}}'
```

### Swipe (fire-and-forget)

**SLIDE_PAGE** - Swipe with precise coordinates
```bash
JSON='{"task_type":"ai","action":"execute","task_id":"ID","md5":"MD5","action_name":"SLIDE_PAGE","params":{"direction":"up","start_x":500,"start_y":750,"end_x":500,"end_y":300}}'
```
- `direction`: up/down/left/right (required)
- Coordinates are optional; if omitted, uses default swipe for that direction

### Wait (fire-and-forget)

**WAIT_TIME** - Wait for milliseconds
```bash
JSON='{"task_type":"ai","action":"execute","task_id":"ID","md5":"MD5","action_name":"WAIT_TIME","params":{"wait_time":3000}}'
```

**WAIT_FOR_SELECTOR** - Wait for element to appear
```bash
JSON='{"task_type":"ai","action":"execute","task_id":"ID","md5":"MD5","action_name":"WAIT_FOR_SELECTOR","params":{"text":"Loading complete","timeout":10000}}'
```

### Task Control (fire-and-forget)

**END_TASK** - Mark task complete
```bash
JSON='{"task_type":"ai","action":"execute","task_id":"ID","md5":"MD5","action_name":"END_TASK","params":{"success":true,"message":"Done"}}'
```

## Helper Script

Use the helper script `scripts/send_command.sh` for easier command sending:

```bash
# Usage: scripts/send_command.sh <DEVICE_ID> <ACTION_JSON>
scripts/send_command.sh 192.168.1.100:5555 '{"action_name":"CLICK_ELEMENT","params":{"text":"Login"}}'
```

## Typical Workflow

```
0. check_env.sh <DEVICE>  → Verify device is a supported DuoPlus cloud phone (v2.0.0+)
1. get_ui_state            → Observe current screen (get UI elements + screenshot)
2. Execute action          → e.g. CLICK_ELEMENT, INPUT_CONTENT, SLIDE_PAGE
3. sleep 1-3s              → Wait for the action to take effect
4. get_ui_state            → Verify the result, decide next step
5. Repeat 2-4 until done
6. END_TASK                → Mark task complete
```

## Best Practices

1. Always call `get_ui_state` first to understand the current screen before any action
2. After every action, call `get_ui_state` again to verify the result — action commands have no return value
3. Use CLICK_ELEMENT (by text) when possible; fall back to CLICK_COORDINATE for web content or when text matching fails
4. After typing, use KEYBOARD_OPERATION(key="enter") to submit
5. Wait 1-3 seconds after operations that trigger page transitions before calling get_ui_state
6. If element not visible, use SLIDE_PAGE to scroll (max 3 attempts)
7. Coordinates use 0-1000 relative system, not pixels
8. Do NOT use PAGE_SCREENSHOT separately — use `get_ui_state` instead, which already includes a compressed screenshot in the response
