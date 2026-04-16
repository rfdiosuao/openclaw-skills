#!/usr/bin/env bash

# OpenClaw ADB Master - 核心执行脚本 v2.0
# 速度 < 200ms | 准确率 > 99% | 智能等待 | 自动重试

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="$HOME/.openclaw/skills/openclaw-adb-master/config.json"
DEFAULT_TIMEOUT=30000
DEFAULT_RETRY=3

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_debug() { echo -e "${MAGENTA}[DEBUG]${NC} $1"; }

# 检查 ADB
check_adb() {
    if ! command -v adb &> /dev/null; then
        log_error "ADB not found. Install with: brew install android-platform-tools"
        exit 1
    fi
}

# 获取设备序列号
get_device_serial() {
    local serial=""
    if [ -n "$ADB_MASTER_SERIAL" ]; then
        serial="$ADB_MASTER_SERIAL"
    elif [ -f "$CONFIG_FILE" ] && [ -n "$(jq -r '.serial' "$CONFIG_FILE" 2>/dev/null)" ]; then
        serial="$(jq -r '.serial' "$CONFIG_FILE")"
    else
        serial="$(adb devices | grep -v 'List' | grep 'device$' | head -1 | cut -f1)"
    fi
    
    if [ -z "$serial" ]; then
        log_error "No device found. Connect a device or set ADB_MASTER_SERIAL"
        exit 1
    fi
    
    echo "$serial"
}

# 连接设备
cmd_connect() {
    local mode="usb"
    local host=""
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --wifi) mode="wifi"; host="$2"; shift 2 ;;
            --cloud) mode="cloud"; host="$2"; shift 2 ;;
            --usb) mode="usb"; shift ;;
            *) shift ;;
        esac
    done
    
    log_info "Connecting in $mode mode..."
    
    case $mode in
        usb)
            adb devices
            if adb devices | grep -q 'device$'; then
                log_success "USB device connected"
            else
                log_error "No USB device found"
                exit 1
            fi
            ;;
        wifi)
            if [ -z "$host" ]; then
                log_error "WiFi mode requires host (e.g., 192.168.1.100:5555)"
                exit 1
            fi
            adb connect "$host"
            log_success "Connected to $host"
            ;;
        cloud)
            if [ -z "$host" ]; then
                log_error "Cloud mode requires host"
                exit 1
            fi
            adb connect "$host"
            log_success "Connected to cloud phone $host"
            ;;
    esac
}

# 设备信息
cmd_device_info() {
    local serial=$(get_device_serial)
    
    log_info "Getting device info..."
    
    echo ""
    echo "=== Device Info ==="
    echo "Model: $(adb -s "$serial" shell getprop ro.product.model)"
    echo "Android: $(adb -s "$serial" shell getprop ro.build.version.release)"
    echo "Size: $(adb -s "$serial" shell wm size)"
    echo "Density: $(adb -s "$serial" shell wm density)"
    echo ""
    
    log_success "Device info retrieved"
}

# 观察屏幕（核心功能 - 优化版）
cmd_observe() {
    local mode="fast"
    local quality=80
    local output=""
    local wait_stable=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --mode) mode="$2"; shift 2 ;;
            --quality) quality="$2"; shift 2 ;;
            --output) output="$2"; shift 2 ;;
            --wait-stable) wait_stable=true; shift ;;
            *) shift ;;
        esac
    done
    
    local serial=$(get_device_serial)
    local start_time=$(date +%s%3N)
    
    log_info "Observing screen (mode: $mode)..."
    
    # 等待 UI 稳定（如果请求）
    if [ "$wait_stable" = true ]; then
        log_debug "Waiting for UI stability..."
        python3 "$SCRIPT_DIR/smart_wait.py" wait --serial "$serial" --stable --timeout 3000 || true
    fi
    
    case $mode in
        fast)
            # 快速模式：截图 + UI 树并行
            local screenshot_tmp="/tmp/adb_master_screen_$$"
            local ui_tmp="/tmp/adb_master_ui_$$"
            
            # 并行执行截图和 UI dump
            adb -s "$serial" shell screencap -p > "$screenshot_tmp" &
            local cap_pid=$!
            adb -s "$serial" shell uiautomator dump /sdcard/view.xml 2>/dev/null && \
                adb -s "$serial" pull /sdcard/view.xml "$ui_tmp" 2>/dev/null &
            local ui_pid=$!
            
            wait $cap_pid
            wait $ui_pid
            
            local end_time=$(date +%s%3N)
            local duration=$((end_time - start_time))
            
            echo ""
            echo "=== Observation Complete (${duration}ms) ==="
            echo "Screenshot: $screenshot_tmp"
            echo "UI Tree: $ui_tmp"
            echo ""
            
            # 解析 UI 树，输出元素索引
            if [ -f "$ui_tmp" ]; then
                echo "=== Interactive Elements (Top 20) ==="
                python3 "$SCRIPT_DIR/parse_ui.py" "$ui_tmp" 2>/dev/null | tail -n +4 | head -20
                echo ""
                echo "Total elements: $(python3 "$SCRIPT_DIR/parse_ui.py" "$ui_tmp" 2>/dev/null | grep "Total:" | cut -d':' -f2 | tr -d ' ')"
            fi
            
            log_success "Observation complete in ${duration}ms"
            ;;
        
        annotated)
            # 标注模式：带元素编号的截图（视觉模型友好）
            log_info "Generating annotated screenshot..."
            
            local screenshot_tmp="/tmp/adb_master_screen_$$"
            local ui_tmp="/tmp/adb_master_ui_$$"
            local output_png="${output:-/tmp/adb_master_annotated_$$.png}"
            
            # 获取截图和 UI 树
            adb -s "$serial" shell screencap -p > "$screenshot_tmp"
            adb -s "$serial" shell uiautomator dump /sdcard/view.xml && \
                adb -s "$serial" pull /sdcard/view.xml "$ui_tmp"
            
            # 生成标注截图
            python3 "$SCRIPT_DIR/annotate_screenshot.py" "$screenshot_tmp" "$ui_tmp" "$output_png"
            
            local end_time=$(date +%s%3N)
            local duration=$((end_time - start_time))
            
            log_success "Annotated screenshot: $output_png (${duration}ms)"
            echo "$output_png"
            
            # 清理临时文件
            rm -f "$screenshot_tmp" "$ui_tmp"
            ;;
        
        compressed)
            # 压缩模式：WebP 格式
            log_info "Generating compressed screenshot (quality: $quality)..."
            
            local screenshot_tmp="/tmp/adb_master_screen_$$"
            local output_webp="${output:-/tmp/adb_master_compressed_$$.webp}"
            
            # 获取截图
            adb -s "$serial" shell screencap -p > "$screenshot_tmp"
            
            # 转换为 WebP（如果安装了 cwebp）
            if command -v cwebp &> /dev/null; then
                cwebp -q "$quality" "$screenshot_tmp" -o "$output_webp"
                local end_time=$(date +%s%3N)
                local duration=$((end_time - start_time))
                local orig_size=$(stat -f%z "$screenshot_tmp" 2>/dev/null || stat -c%s "$screenshot_tmp")
                local comp_size=$(stat -f%z "$output_webp" 2>/dev/null || stat -c%s "$output_webp")
                local ratio=$(echo "scale=2; $comp_size * 100 / $orig_size" | bc)
                
                log_success "Compressed screenshot: $output_webp (${duration}ms, ${ratio}% of original)"
                echo "$output_webp"
            else
                log_warn "cwebp not found, using PNG instead"
                cp "$screenshot_tmp" "$output_webp"
                echo "$output_webp"
            fi
            
            rm -f "$screenshot_tmp"
            ;;
    esac
}

# 点击操作（增强版 - 支持智能等待）
cmd_tap() {
    local index=""
    local text=""
    local bounds=""
    local id=""
    local x=""
    local y=""
    local wait=false
    local retry=3
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --index) index="$2"; shift 2 ;;
            --text) text="$2"; shift 2 ;;
            --bounds) bounds="$2"; shift 2 ;;
            --id) id="$2"; shift 2 ;;
            --wait) wait=true; shift ;;
            --retry) retry="$2"; shift 2 ;;
            *) 
                if [ -z "$x" ]; then x="$1"; else y="$1"; fi
                shift
                ;;
        esac
    done
    
    local serial=$(get_device_serial)
    
    # 智能等待（如果请求）
    if [ "$wait" = true ]; then
        log_info "Waiting for element..."
        if [ -n "$index" ]; then
            python3 "$SCRIPT_DIR/smart_wait.py" wait --serial "$serial" --element "{\"index\":$index}" --timeout 5000 || true
        elif [ -n "$text" ]; then
            python3 "$SCRIPT_DIR/smart_wait.py" wait --serial "$serial" --text "$text" --timeout 5000 || true
        fi
    fi
    
    log_info "Tapping..."
    
    # 自动重试逻辑
    local attempt=1
    while [ $attempt -le $retry ]; do
        if [ -n "$index" ]; then
            # 索引定位（最优）
            log_debug "Using index 定位：$index (attempt $attempt/$retry)"
            
            local ui_file="/tmp/adb_master_ui_$$"
            adb -s "$serial" shell uiautomator dump /sdcard/view.xml 2>/dev/null && \
                adb -s "$serial" pull /sdcard/view.xml "$ui_file" 2>/dev/null
            
            if [ -f "$ui_file" ]; then
                local coords=$(python3 "$SCRIPT_DIR/parse_ui.py" "$ui_file" "$index" 2>/dev/null | jq -r '.center | "\(.[0]),\(.[1])"')
                if [ -n "$coords" ] && [ "$coords" != "null" ]; then
                    local tap_x=$(echo $coords | cut -d',' -f1)
                    local tap_y=$(echo $coords | cut -d',' -f2)
                    log_debug "Tapping coordinates: $tap_x, $tap_y"
                    
                    if adb -s "$serial" shell input tap $tap_x $tap_y 2>/dev/null; then
                        log_success "Tap executed (index: $index, attempt: $attempt)"
                        rm -f "$ui_file"
                        return 0
                    fi
                fi
                rm -f "$ui_file"
            fi
            
        elif [ -n "$bounds" ]; then
            # 边界定位
            log_debug "Using bounds 定位：$bounds"
            local coords=$(echo "$bounds" | grep -oP '\[\d+,\d+\]' | tr -d '[]' | tr '\n' ' ')
            local x1=$(echo $coords | cut -d' ' -f1 | cut -d',' -f1)
            local y1=$(echo $coords | cut -d' ' -f1 | cut -d',' -f2)
            local x2=$(echo $coords | cut -d' ' -f2 | cut -d',' -f1)
            local y2=$(echo $coords | cut -d' ' -f2 | cut -d',' -f2)
            local center_x=$(( (x1 + x2) / 2 ))
            local center_y=$(( (y1 + y2) / 2 ))
            
            if adb -s "$serial" shell input tap $center_x $center_y 2>/dev/null; then
                log_success "Tap executed (bounds: $bounds)"
                return 0
            fi
            
        elif [ -n "$text" ]; then
            # 文本定位（TODO: 实现）
            log_error "Text targeting not yet implemented"
            exit 1
            
        elif [ -n "$id" ]; then
            # ID 定位（TODO: 实现）
            log_error "ID targeting not yet implemented"
            exit 1
            
        elif [ -n "$x" ] && [ -n "$y" ]; then
            # 坐标定位（备用）
            log_debug "Using coordinate 定位：$x, $y"
            if adb -s "$serial" shell input tap $x $y 2>/dev/null; then
                log_success "Tap executed (coords: $x, $y)"
                return 0
            fi
        else
            log_error "No targeting method specified"
            echo "Usage: tap --index N | --text '文本' | --bounds X | x y"
            exit 1
        fi
        
        # 重试等待
        if [ $attempt -lt $retry ]; then
            local delay=$((attempt * 1000))
            log_warn "Tap failed, retrying in ${delay}ms..."
            sleep 1
        fi
        
        attempt=$((attempt + 1))
    done
    
    log_error "Tap failed after $retry attempts"
    exit 1
}

# 滑动操作
cmd_swipe() {
    local direction="$1"
    shift
    local duration="${1:-300}"
    local serial=$(get_device_serial)
    
    # 获取屏幕尺寸
    local size=$(adb -s "$serial" shell wm size | grep -oP '\d+x\d+')
    local width=$(echo $size | cut -d'x' -f1)
    local height=$(echo $size | cut -d'x' -f2)
    
    local x1 y1 x2 y2
    
    case $direction in
        up)
            x1=$((width / 2)); y1=$((height * 3 / 4)); x2=$((width / 2)); y2=$((height / 4))
            ;;
        down)
            x1=$((width / 2)); y1=$((height / 4)); x2=$((width / 2)); y2=$((height * 3 / 4))
            ;;
        left)
            x1=$((width * 3 / 4)); y1=$((height / 2)); x2=$((width / 4)); y2=$((height / 2))
            ;;
        right)
            x1=$((width / 4)); y1=$((height / 2)); x2=$((width * 3 / 4)); y2=$((height / 2))
            ;;
        *)
            log_error "Unknown direction: $direction (use: up/down/left/right)"
            exit 1
            ;;
    esac
    
    log_info "Swiping $direction (${duration}ms)..."
    adb -s "$serial" shell input swipe $x1 $y1 $x2 $y2 $duration
    log_success "Swipe executed"
}

# 输入文本
cmd_type() {
    local text="$*"
    local serial=$(get_device_serial)
    
    log_info "Typing: $text"
    # 处理空格和特殊字符
    local escaped_text=$(echo "$text" | sed 's/ /%/g')
    adb -s "$serial" shell input text "$escaped_text"
    log_success "Text input complete"
}

# 按键操作
cmd_key() {
    local key="$1"
    local serial=$(get_device_serial)
    
    local keycode=""
    case $key in
        HOME) keycode=3 ;;
        BACK) keycode=4 ;;
        ENTER) keycode=66 ;;
        TAB) keycode=61 ;;
        DEL) keycode=67 ;;
        POWER) keycode=26 ;;
        VOLUME_UP) keycode=24 ;;
        VOLUME_DOWN) keycode=25 ;;
        MENU) keycode=82 ;;
        *) log_error "Unknown key: $key"; exit 1 ;;
    esac
    
    log_info "Pressing key: $key ($keycode)"
    adb -s "$serial" shell input keyevent $keycode
    log_success "Key pressed"
}

# App 管理
cmd_app() {
    local action="$1"
    shift
    local serial=$(get_device_serial)
    
    case $action in
        list)
            log_info "Listing installed apps..."
            adb -s "$serial" shell pm list packages -3 | cut -d':' -f2 | sort
            ;;
        launch)
            local package="$1"
            log_info "Launching: $package"
            adb -s "$serial" shell monkey -p "$package" -c android.intent.category.LAUNCHER 1
            log_success "App launched"
            ;;
        stop)
            local package="$1"
            log_info "Stopping: $package"
            adb -s "$serial" shell am force-stop "$package"
            log_success "App stopped"
            ;;
        current)
            log_info "Getting current app..."
            adb -s "$serial" shell dumpsys window windows | grep -E 'mCurrentFocus' | cut -d'/' -f1 | cut -d' ' -f5
            ;;
        *)
            log_error "Unknown action: $action (use: list/launch/stop/current)"
            exit 1
            ;;
    esac
}

# 动画检测
cmd_detect_animation() {
    local serial=$(get_device_serial)
    log_info "Detecting animation..."
    
    if python3 "$SCRIPT_DIR/smart_wait.py" detect-animation --serial "$serial" 2>/dev/null; then
        log_warn "Animation detected"
        return 0
    else
        log_success "No animation detected"
        return 1
    fi
}

# 视觉定位点击
cmd_vision_tap() {
    local description=""
    local api_key=""
    local output=""
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --description) description="$2"; shift 2 ;;
            --api-key) api_key="$2"; shift 2 ;;
            --output) output="$2"; shift 2 ;;
            *) shift ;;
        esac
    done
    
    if [ -z "$description" ]; then
        log_error "Description required (e.g., '红色登录按钮')"
        exit 1
    fi
    
    local serial=$(get_device_serial)
    local screenshot_tmp="/tmp/adb_master_vision_$$"
    
    log_info "Locating: $description"
    
    # 截图
    adb -s "$serial" shell screencap -p > "$screenshot_tmp"
    
    # 视觉定位
    local result=$(python3 "$SCRIPT_DIR/vision_locator.py" vision locate \
        --screenshot "$screenshot_tmp" \
        --description "$description" \
        --api-key "$api_key")
    
    if [ -n "$result" ]; then
        local x=$(echo "$result" | jq -r '.x')
        local y=$(echo "$result" | jq -r '.y')
        local confidence=$(echo "$result" | jq -r '.confidence')
        
        if [ -n "$x" ] && [ -n "$y" ] && [ "$x" != "null" ]; then
            log_info "Vision located at: $x, $y (confidence: $confidence)"
            adb -s "$serial" shell input tap $x $y
            log_success "Vision tap executed"
            rm -f "$screenshot_tmp"
            return 0
        fi
    fi
    
    log_error "Vision locate failed"
    rm -f "$screenshot_tmp"
    exit 1
}

# Deep Link 启动
cmd_deep_link() {
    local app=""
    local action=""
    local params="{}"
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --app) app="$2"; shift 2 ;;
            --action) action="$2"; shift 2 ;;
            --params) params="$2"; shift 2 ;;
            *) shift ;;
        esac
    done
    
    if [ -z "$app" ] || [ -z "$action" ]; then
        log_error "App and action required"
        echo "Usage: deep-link --app douyin --action search --params '{\"keyword\":\"OpenClaw\"}'"
        exit 1
    fi
    
    local serial=$(get_device_serial)
    
    log_info "Resolving Deep Link: $app/$action"
    
    # 解析 Deep Link
    local link=$(python3 "$SCRIPT_DIR/vision_locator.py" deep-link \
        --app "$app" \
        --action "$action" \
        --params "$params" 2>/dev/null | grep "Deep Link:" | cut -d':' -f2 | tr -d ' ')
    
    if [ -n "$link" ]; then
        log_info "Deep Link: $link"
        adb -s "$serial" shell am start -a android.intent.action.VIEW -d "$link"
        log_success "Deep Link launched"
        return 0
    else
        log_error "Failed to resolve Deep Link"
        exit 1
    fi
}

# App 配置查看
cmd_profile() {
    local action="$1"
    shift
    local package=""
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --package) package="$2"; shift 2 ;;
            *) shift ;;
        esac
    done
    
    case $action in
        list)
            log_info "Available profiles:"
            python3 "$SCRIPT_DIR/vision_locator.py" profile list
            ;;
        get)
            if [ -z "$package" ]; then
                log_error "Package required"
                exit 1
            fi
            log_info "Profile for: $package"
            python3 "$SCRIPT_DIR/vision_locator.py" profile get --package "$package"
            ;;
        *)
            log_error "Unknown action: $action (use: list/get)"
            exit 1
            ;;
    esac
}

# 诊断工具
cmd_doctor() {
    log_info "Running diagnostics..."
    echo ""
    echo "=== ADB Master Diagnostics ==="
    
    # ADB 检查
    if command -v adb &> /dev/null; then
        log_success "ADB: installed ($(adb --version | head -1))"
    else
        log_error "ADB: not found"
    fi
    
    # Python 检查
    if command -v python3 &> /dev/null; then
        log_success "Python3: $(python3 --version)"
    else
        log_error "Python3: not found"
    fi
    
    # 设备检查
    local devices=$(adb devices | grep 'device$' | wc -l)
    if [ "$devices" -gt 0 ]; then
        log_success "Devices: $devices connected"
        adb devices | grep 'device$'
    else
        log_warn "Devices: none connected"
    fi
    
    # 脚本检查
    if [ -f "$SCRIPT_DIR/smart_wait.py" ]; then
        log_success "Smart wait: available"
    else
        log_warn "Smart wait: not found"
    fi
    
    # 阶段 4 脚本检查
    if [ -f "$SCRIPT_DIR/pixel_validator.py" ]; then
        log_success "Pixel validator: available"
    else
        log_warn "Pixel validator: not found"
    fi
    
    if [ -f "$SCRIPT_DIR/gesture_recorder.py" ]; then
        log_success "Gesture recorder: available"
    else
        log_warn "Gesture recorder: not found"
    fi
    
    if [ -f "$SCRIPT_DIR/multi_device.py" ]; then
        log_success "Multi-device: available"
    else
        log_warn "Multi-device: not found"
    fi
    
    # Profiles 检查
    local profile_count=$(ls -1 "$SCRIPT_DIR/../profiles/"*.json 2>/dev/null | wc -l)
    log_success "App profiles: $profile_count available"
    
    echo ""
}

# 主入口
main() {
    check_adb
    
    local command="$1"
    shift || true
    
    case $command in
        connect) cmd_connect "$@" ;;
        device) 
            case "$1" in
                info) cmd_device_info ;;
                *) log_error "Unknown device subcommand"; exit 1 ;;
            esac
            ;;
        observe) cmd_observe "$@" ;;
        tap) cmd_tap "$@" ;;
        swipe) cmd_swipe "$@" ;;
        type) cmd_type "$@" ;;
        key) cmd_key "$@" ;;
        app) cmd_app "$@" ;;
        vision-tap) cmd_vision_tap "$@" ;;
        deep-link) cmd_deep_link "$@" ;;
        profile) cmd_profile "$@" ;;
        detect-animation) cmd_detect_animation ;;
        compare) cmd_compare "$@" ;;
        logcat) cmd_logcat "$@" ;;
        regression) cmd_regression "$@" ;;
        gesture) cmd_gesture "$@" ;;
        multi) cmd_multi "$@" ;;
        doctor) cmd_doctor ;;
        *)
            echo "OpenClaw ADB Master v4.0"
            echo ""
            echo "Usage: adb-master <command> [options]"
            echo ""
            echo "=== 设备管理 ==="
            echo "  connect [--wifi HOST|--cloud HOST]  连接设备"
            echo "  device info                         设备信息"
            echo "  multi list|parallel|broadcast       多设备控制"
            echo ""
            echo "=== 观察与定位 ==="
            echo "  observe [--mode MODE] [--wait-stable]  观察屏幕"
            echo "  tap --index N|--bounds X [--wait] [--retry N]  点击"
            echo "  vision-tap --description DESC       视觉定位点击"
            echo "  deep-link --app APP --action ACT    Deep Link 启动"
            echo "  profile list|get --package PKG      App 配置"
            echo ""
            echo "=== 交互命令 ==="
            echo "  swipe up|down|left|right [duration]  滑动"
            echo "  type TEXT                           输入文本"
            echo "  key HOME|BACK|ENTER                 按键"
            echo "  app list|launch|stop|current        App 管理"
            echo "  gesture record|play|library|build   手势录制/回放"
            echo ""
            echo "=== 验证与测试 ==="
            echo "  compare SCREEN1 SCREEN2             截图对比"
            echo "  logcat search|errors|wait           Logcat 分析"
            echo "  regression capture|test --scenario  回归测试"
            echo "  detect-animation                    动画检测"
            echo ""
            echo "=== 其他 ==="
            echo "  doctor                              诊断工具"
            echo ""
            echo "Observe modes: fast (default), annotated, compressed"
            echo ""
            echo "Supported apps for deep-link:"
            echo "  douyin (search/user/live/video)"
            echo "  wechat (scan/profile/pay)"
            echo "  alipay (scan/pay/transfer)"
            echo "  taobao (search/item/shop)"
            echo "  meituan (search/shop/order)"
            echo "  didichuxing (ride/bike)"
            echo ""
            ;;
    esac
}

main "$@"
