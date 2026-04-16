---
name: adb-claw
description: "Control Android devices via adbclaw CLI — tap, swipe, type, screenshot, UI inspection, and app management. Use when: (1) user asks to control or automate an Android device, (2) testing mobile apps or UI, (3) taking screenshots or inspecting UI elements on Android, (4) launching/stopping apps. NOT for: iOS devices (use peekaboo), desktop automation, or ADB installation issues."
homepage: https://github.com/AdbClaw/adbclaw
metadata:
  {
    "openclaw":
      {
        "emoji": "🤖",
        "os": ["darwin", "linux"],
        "requires": { "bins": ["adbclaw", "adb"] },
        "install":
          [
            {
              "id": "adbclaw-curl",
              "kind": "script",
              "script": "curl -fsSL https://github.com/AdbClaw/adbclaw/releases/latest/download/install.sh | bash",
              "bins": ["adbclaw"],
              "label": "Install adbclaw (curl)",
            },
            {
              "id": "adb-brew",
              "kind": "brew",
              "formula": "android-platform-tools",
              "bins": ["adb"],
              "label": "Install ADB (brew)",
            },
          ],
      },
  }
---

# ADB Claw — Android Device Control

Control Android devices via the `adbclaw` CLI. Supports tap, swipe, type, screenshot, UI tree inspection, and app management through ADB.

## When to Use

- User asks to control, interact with, or automate an Android device
- User asks to test a mobile app or UI
- User mentions tapping, swiping, screenshots, or app launching on Android
- User wants to install, launch, or manage apps on a connected Android device

## When NOT to Use

- iOS devices — use peekaboo or other iOS tools
- Desktop UI automation — use peekaboo (macOS)
- ADB not available and user can't install it

## Setup

Requires two binaries:

1. **adbclaw** — the control CLI
2. **adb** — Android Debug Bridge (from Android SDK Platform-Tools)

The Android device must have **USB debugging enabled** and be connected via USB.

```bash
# Verify setup
adbclaw doctor
```

## Global Flags

| Flag | Short | Description | Default |
|------|-------|-------------|---------|
| `--serial` | `-s` | Target device serial (when multiple devices connected) | auto-detect |
| `--output` | `-o` | Output format: `json`, `text`, `quiet` | `json` |
| `--timeout` | | Command timeout in milliseconds | `30000` |
| `--verbose` | | Enable debug output to stderr | `false` |

## Commands

### observe — Screenshot + UI Tree (Primary Command)

Captures screenshot and UI element tree in one call. **Always use this before and after actions.**

```bash
adbclaw observe              # Default
adbclaw observe --width 540  # Scale screenshot width
```

Returns: base64 PNG screenshot, indexed UI elements with text/id/bounds/center coordinates.

### screenshot — Capture Screen

```bash
adbclaw screenshot                      # Returns base64 PNG in JSON
adbclaw screenshot -f output.png        # Save to file
adbclaw screenshot --width 540          # Scale down
```

### tap — Tap UI Element

Tap by element index (preferred), resource ID, text, or coordinates:

```bash
adbclaw tap --index 5            # Tap element #5 from observe output
adbclaw tap --id "com.app:id/btn" # Tap by resource ID
adbclaw tap --text "Submit"       # Tap by visible text
adbclaw tap 540 960              # Tap coordinates (x y)
```

**Always prefer `--index` over coordinates.** Index values come from `observe` output.

### long-press — Long Press

```bash
adbclaw long-press 540 960              # Default duration
adbclaw long-press 540 960 --duration 2000  # 2 seconds
```

### swipe — Swipe Gesture

```bash
adbclaw swipe 540 1800 540 600           # Swipe up (scroll down)
adbclaw swipe 540 600 540 1800           # Swipe down (scroll up)
adbclaw swipe 900 960 100 960            # Swipe left
adbclaw swipe 540 1800 540 600 --duration 500  # Slow swipe
```

### type — Input Text (ASCII only)

```bash
adbclaw type "Hello world"
```

**Important**: Only ASCII text is supported. For CJK/emoji input, use app deep links or clipboard workarounds.

### key — Press System Key

```bash
adbclaw key HOME        # Home screen
adbclaw key BACK        # Navigate back
adbclaw key ENTER       # Confirm / submit
adbclaw key TAB         # Next field
adbclaw key DEL         # Delete character
adbclaw key POWER       # Power button
adbclaw key VOLUME_UP   # Volume up
adbclaw key VOLUME_DOWN # Volume down
```

### app — App Management

```bash
adbclaw app list         # Third-party apps
adbclaw app list --all   # Include system apps
adbclaw app current      # Current foreground app
adbclaw app launch <pkg> # Launch app by package name
adbclaw app stop <pkg>   # Force stop app
```

### device — Device Info

```bash
adbclaw device list      # List connected devices
adbclaw device info      # Model, Android version, screen size, density
```

### ui — UI Element Inspection

```bash
adbclaw ui tree                    # Full UI element tree
adbclaw ui find --text "Settings"  # Find by text
adbclaw ui find --id "com.app:id/title"  # Find by resource ID
adbclaw ui find --index 3          # Find by index
```

## Workflow Patterns

### Always Observe First

Before any action, run `observe` to see the screen. After every action, `observe` again to verify.

```
1. adbclaw observe          → See what's on screen
2. adbclaw tap --index 3    → Perform action
3. adbclaw observe          → Verify result
```

### Prefer Index-Based Targeting

Use `--index N` over coordinates. Indices from `observe` are stable across screen sizes.

### Type After Focus

Always tap an input field first, then type:

```
1. adbclaw tap --index 7       → Focus the text field
2. adbclaw type "search query" → Enter text
3. adbclaw key ENTER           → Submit
```

### Scroll Pattern

```
Scroll down:  adbclaw swipe 540 1500 540 500
Scroll up:    adbclaw swipe 540 500 540 1500
```

Adjust coordinates based on `device info` screen size. After scrolling, always `observe`.

### CJK Text Input Workaround

`adbclaw type` only supports ASCII. For Chinese/Japanese/Korean input:

1. **Preferred**: Use app deep links (e.g., `adb shell am start -a android.intent.action.VIEW -d 'scheme://search?keyword=中文'`)
2. **Fallback**: Use ADB broadcast or clipboard if the app supports it

### Device Form Factor Detection

Use `adbclaw device info` to get screen size, then determine form factor:
- Short edge < 1200px → **Phone** (portrait-first)
- Short edge >= 1200px → **Pad/Fold** (landscape-first)

Swipe coordinates and UI layouts differ between Phone and Pad.

## App Profiles

For popular apps, pre-built profiles contain deep links, known layouts, and workarounds. Check the profile **before** operating an app — it can reduce 15 steps to 3.

### Douyin (抖音) — `com.ss.android.ugc.aweme`

**Deep links** (use these instead of manual UI navigation):

```bash
# Search (supports Chinese keywords natively)
adb shell am start -a android.intent.action.VIEW \
  -d 'snssdk1128://search/result?keyword={keyword}&type={type}'
# type: 0=综合, 1=直播, 2=视频, 3=用户

# User profile
adb shell am start -a android.intent.action.VIEW \
  -d 'snssdk1128://user/profile/{user_id}'

# Live room
adb shell am start -a android.intent.action.VIEW \
  -d 'snssdk1128://live?room_id={room_id}'
```

**Known layout**:
- Search button: `content_desc="搜索"`, top-right corner
- Bottom nav: 首页 | 朋友 | 拍摄 | 消息 | 我
- Top tabs: resource_id contains `5j4`, horizontally scrollable

**Known issues**:
- **UI dump fails during video playback** — Tap screen center to pause first, wait 1s, then dump
- **Chinese input** — Always use deep links, never `adbclaw type` for Chinese
- **First launch** — May show onboarding/login dialogs; look for "跳过" or "同意" buttons

**Pad vs Phone**:
- Pad (landscape): wider nav bar, single-column live search results, video area centered
- Phone (portrait): full-screen immersive video, dual-column search results

## Output Format

All commands return JSON:

```json
{
  "ok": true,
  "command": "tap",
  "data": { ... },
  "duration_ms": 150,
  "timestamp": "2025-03-01T10:00:00Z"
}
```

On error:

```json
{
  "ok": false,
  "error": {
    "code": "DEVICE_NOT_FOUND",
    "message": "No device connected",
    "suggestion": "Connect a device via USB and enable USB debugging"
  }
}
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| No devices found | Connect device via USB with USB debugging enabled |
| adb not found | `brew install android-platform-tools` (macOS) |
| Tap hits wrong element | Use `--index` instead of coordinates; re-run `observe` |
| `type` doesn't work | Tap input field first to focus; ASCII only |
| UI dump fails | Pause animations (tap to pause video), wait 1s, retry |
| Command timeout | Increase with `--timeout 60000` |
| Permission dialog | Use `observe` to see it, tap the allow/skip button |
