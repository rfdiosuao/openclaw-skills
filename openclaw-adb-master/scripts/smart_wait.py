#!/usr/bin/env python3
"""
OpenClaw ADB Master - 智能等待与动画检测系统
速度优化 | 自动重试 | 动画检测 | 错误恢复
"""

import subprocess
import time
import json
import sys
from datetime import datetime

class SmartWait:
    """智能等待系统"""
    
    def __init__(self, serial, timeout=10000, poll_interval=200):
        self.serial = serial
        self.timeout = timeout
        self.poll_interval = poll_interval  # ms
        
    def wait_for_element(self, selector, timeout=None):
        """等待元素出现"""
        if timeout is None:
            timeout = self.timeout
            
        start_time = time.time()
        attempts = 0
        
        while (time.time() - start_time) * 1000 < timeout:
            # 获取当前 UI 状态
            result = self._dump_ui()
            
            if result and self._find_element(result, selector):
                return True
            
            # 检测是否动画中
            if self._is_animating(result):
                continue  # 动画中，继续等待
            
            attempts += 1
            time.sleep(self.poll_interval / 1000.0)
        
        return False
    
    def wait_for_text(self, text, timeout=None):
        """等待文本出现"""
        return self.wait_for_element({'text': text}, timeout)
    
    def wait_for_activity(self, activity, timeout=None):
        """等待 Activity 切换完成"""
        if timeout is None:
            timeout = self.timeout
            
        start_time = time.time()
        last_activity = None
        
        while (time.time() - start_time) * 1000 < timeout:
            current = self._get_current_activity()
            
            if current == activity:
                # 稳定等待 500ms 确认
                time.sleep(0.5)
                if self._get_current_activity() == activity:
                    return True
            
            last_activity = current
            time.sleep(self.poll_interval / 1000.0)
        
        return False
    
    def wait_for_stability(self, min_stable_time=500, timeout=5000):
        """等待 UI 稳定（无变化）"""
        start_time = time.time()
        last_hash = None
        stable_start = None
        
        while (time.time() - start_time) * 1000 < timeout:
            result = self._dump_ui()
            if not result:
                time.sleep(self.poll_interval / 1000.0)
                continue
            
            # 计算 UI 树哈希
            current_hash = hash(json.dumps(result, sort_keys=True))
            
            if current_hash == last_hash:
                if stable_start is None:
                    stable_start = time.time()
                elif (time.time() - stable_start) * 1000 >= min_stable_time:
                    return True  # UI 已稳定
            else:
                stable_start = None
                last_hash = current_hash
            
            time.sleep(self.poll_interval / 1000.0)
        
        return False
    
    def _dump_ui(self):
        """获取 UI 树"""
        try:
            subprocess.run([
                'adb', '-s', self.serial,
                'shell', 'uiautomator', 'dump', '/sdcard/view.xml'
            ], check=True, capture_output=True, timeout=5)
            
            result = subprocess.run([
                'adb', '-s', self.serial,
                'pull', '/sdcard/view.xml', '-'
            ], check=True, capture_output=True, timeout=5)
            
            return result.stdout
        except:
            return None
    
    def _find_element(self, ui_data, selector):
        """查找元素"""
        # TODO: 实现 XML 解析和查找
        return False
    
    def _is_animating(self, ui_data):
        """检测是否动画中"""
        # TODO: 实现动画检测逻辑
        return False
    
    def _get_current_activity(self):
        """获取当前 Activity"""
        try:
            result = subprocess.run([
                'adb', '-s', self.serial,
                'shell', 'dumpsys', 'window', 'windows'
            ], check=True, capture_output=True, timeout=5, text=True)
            
            for line in result.stdout.split('\n'):
                if 'mCurrentFocus' in line:
                    return line.split('/')[0].split()[-1]
        except:
            pass
        return None


class AutoRetry:
    """自动重试系统"""
    
    def __init__(self, max_attempts=3, base_delay=1000, exponential=True):
        self.max_attempts = max_attempts
        self.base_delay = base_delay  # ms
        self.exponential = exponential
    
    def execute(self, func, *args, **kwargs):
        """执行函数，自动重试"""
        last_error = None
        
        for attempt in range(1, self.max_attempts + 1):
            try:
                result = func(*args, **kwargs)
                if result and result.get('success', False):
                    return result
                last_error = result.get('error', 'Unknown error')
            except Exception as e:
                last_error = str(e)
            
            if attempt < self.max_attempts:
                delay = self._calculate_delay(attempt)
                print(f"[RETRY] Attempt {attempt} failed, retrying in {delay}ms...")
                time.sleep(delay / 1000.0)
        
        raise Exception(f"Failed after {self.max_attempts} attempts: {last_error}")
    
    def _calculate_delay(self, attempt):
        """计算延迟时间"""
        if self.exponential:
            return self.base_delay * (2 ** (attempt - 1))
        return self.base_delay


class AnimationDetector:
    """动画检测器"""
    
    def __init__(self, serial):
        self.serial = serial
    
    def is_animating(self):
        """检测是否有动画进行中"""
        try:
            # 检查过渡动画
            result = subprocess.run([
                'adb', '-s', self.serial,
                'shell', 'dumpsys', 'window'
            ], check=True, capture_output=True, timeout=5, text=True)
            
            # 检查窗口动画
            if 'mWinAnimation' in result.stdout:
                return True
            
            # 检查过渡状态
            if 'inTransaction' in result.stdout:
                return True
            
            return False
        except:
            return False
    
    def wait_for_animation_end(self, timeout=5000, poll_interval=100):
        """等待动画结束"""
        start_time = time.time()
        
        while (time.time() - start_time) * 1000 < timeout:
            if not self.is_animating():
                # 额外等待 100ms 确保动画完全结束
                time.sleep(0.1)
                return True
            time.sleep(poll_interval / 1000.0)
        
        return False  # 超时


class ErrorRecovery:
    """错误恢复系统"""
    
    def __init__(self, serial):
        self.serial = serial
        self.error_handlers = {
            'DEVICE_NOT_FOUND': self._handle_device_not_found,
            'UI_DUMP_FAILED': self._handle_ui_dump_failed,
            'TAP_FAILED': self._handle_tap_failed,
            'APP_CRASH': self._handle_app_crash,
        }
    
    def recover(self, error_type, context=None):
        """尝试恢复错误"""
        handler = self.error_handlers.get(error_type)
        if handler:
            return handler(context)
        return False
    
    def _handle_device_not_found(self, context):
        """设备未找到"""
        print("[RECOVERY] Attempting to reconnect device...")
        try:
            subprocess.run(['adb', 'kill-server'], capture_output=True)
            time.sleep(1)
            subprocess.run(['adb', 'start-server'], capture_output=True)
            time.sleep(2)
            result = subprocess.run(['adb', 'devices'], capture_output=True, text=True)
            return 'device' in result.stdout
        except:
            return False
    
    def _handle_ui_dump_failed(self, context):
        """UI dump 失败"""
        print("[RECOVERY] Retrying UI dump...")
        try:
            # 等待屏幕稳定
            time.sleep(1)
            subprocess.run([
                'adb', '-s', self.serial,
                'shell', 'uiautomator', 'dump', '/sdcard/view.xml'
            ], check=True, timeout=10)
            return True
        except:
            return False
    
    def _handle_tap_failed(self, context):
        """点击失败"""
        print("[RECOVERY] Attempting alternative tap method...")
        # TODO: 尝试备用点击方法
        return False
    
    def _handle_app_crash(self, context):
        """App 崩溃"""
        print("[RECOVERY] Restarting app...")
        try:
            package = context.get('package') if context else None
            if package:
                subprocess.run([
                    'adb', '-s', self.serial,
                    'shell', 'monkey', '-p', package,
                    '-c', 'android.intent.category.LAUNCHER', '1'
                ], check=True, timeout=10)
                return True
        except:
            pass
        return False


# 命令行接口
def cmd_wait(args):
    """等待命令"""
    serial = args.get('serial', '')
    timeout = args.get('timeout', 10000)
    
    waiter = SmartWait(serial, timeout)
    
    if args.get('element'):
        success = waiter.wait_for_element(json.loads(args['element']))
    elif args.get('text'):
        success = waiter.wait_for_text(args['text'])
    elif args.get('activity'):
        success = waiter.wait_for_activity(args['activity'])
    elif args.get('stable'):
        success = waiter.wait_for_stability()
    else:
        print("Usage: wait --element JSON | --text TEXT | --activity ACTIVITY | --stable")
        return False
    
    if success:
        print("[SUCCESS] Wait condition met")
        return True
    else:
        print("[TIMEOUT] Wait condition not met")
        return False


def cmd_detect_animation(args):
    """检测动画"""
    serial = args.get('serial', '')
    detector = AnimationDetector(serial)
    
    if detector.is_animating():
        print("[ANIMATION] Animation in progress")
        return True
    else:
        print("[NO_ANIMATION] No animation detected")
        return False


def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Smart Wait & Animation Detection')
    subparsers = parser.add_subparsers(dest='command')
    
    # wait 命令
    wait_parser = subparsers.add_parser('wait', help='Wait for condition')
    wait_parser.add_argument('--serial', default='')
    wait_parser.add_argument('--timeout', type=int, default=10000)
    wait_parser.add_argument('--element', help='Element selector (JSON)')
    wait_parser.add_argument('--text', help='Text to wait for')
    wait_parser.add_argument('--activity', help='Activity to wait for')
    wait_parser.add_argument('--stable', action='store_true', help='Wait for UI stable')
    
    # detect-animation 命令
    anim_parser = subparsers.add_parser('detect-animation', help='Detect animation')
    anim_parser.add_argument('--serial', default='')
    
    args = parser.parse_args()
    
    if args.command == 'wait':
        success = cmd_wait(vars(args))
        sys.exit(0 if success else 1)
    elif args.command == 'detect-animation':
        success = cmd_detect_animation(vars(args))
        sys.exit(0 if success else 1)
    else:
        parser.print_help()


if __name__ == '__main__':
    main()
