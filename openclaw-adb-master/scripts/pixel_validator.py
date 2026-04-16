#!/usr/bin/env python3
"""
OpenClaw ADB Master - 像素级验证系统
截图对比 | 元素验证 | 变化检测 | 回归测试
"""

import os
import sys
import json
import hashlib
import subprocess
from datetime import datetime
from PIL import Image, ImageChops
import numpy as np

class PixelValidator:
    """像素级验证器"""
    
    def __init__(self, tolerance=0.02):
        self.tolerance = tolerance  # 允许的像素差异比例
    
    def compare_screenshots(self, screenshot1_path, screenshot2_path, tolerance=None):
        """
        对比两张截图
        
        Returns:
            {
                'identical': bool,
                'similarity': float,  # 0-1
                'diff_pixels': int,
                'total_pixels': int,
                'diff_regions': list,  # 差异区域
                'diff_image_path': str  # 差异图路径
            }
        """
        if tolerance is None:
            tolerance = self.tolerance
        
        # 加载截图
        img1 = Image.open(screenshot1_path)
        img2 = Image.open(screenshot2_path)
        
        # 调整尺寸一致
        if img1.size != img2.size:
            img2 = img2.resize(img1.size, Image.LANCZOS)
        
        # 转换为 RGB
        img1 = img1.convert('RGB')
        img2 = img2.convert('RGB')
        
        # 计算差异
        diff = ImageChops.difference(img1, img2)
        
        # 转换为 numpy 数组
        arr1 = np.array(img1)
        arr2 = np.array(img2)
        diff_arr = np.array(diff)
        
        # 计算差异像素
        total_pixels = arr1.size
        diff_pixels = np.sum(np.any(diff_arr != 0, axis=2))
        similarity = 1.0 - (diff_pixels / total_pixels)
        
        # 查找差异区域
        diff_regions = self._find_diff_regions(diff_arr)
        
        # 生成差异图
        diff_image_path = f"/tmp/adb_master_diff_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
        diff.save(diff_image_path)
        
        return {
            'identical': similarity >= (1.0 - tolerance),
            'similarity': float(similarity),
            'diff_pixels': int(diff_pixels),
            'total_pixels': int(total_pixels),
            'diff_percent': float(diff_pixels / total_pixels * 100),
            'diff_regions': diff_regions,
            'diff_image_path': diff_image_path
        }
    
    def _find_diff_regions(self, diff_arr):
        """查找差异区域"""
        # 简化实现：返回差异的边界框
        rows = np.any(diff_arr != 0, axis=1)
        cols = np.any(diff_arr != 0, axis=0)
        
        if not np.any(rows) or not np.any(cols):
            return []
        
        rmin, rmax = np.where(rows)[0][[0, -1]]
        cmin, cmax = np.where(cols)[0][[0, -1]]
        
        return [{
            'x1': int(cmin),
            'y1': int(rmin),
            'x2': int(cmax),
            'y2': int(rmax),
            'width': int(cmax - cmin),
            'height': int(rmax - rmin)
        }]
    
    def verify_element_exists(self, screenshot_path, template_path, threshold=0.8):
        """
        验证元素是否存在（模板匹配）
        
        Returns:
            {
                'found': bool,
                'confidence': float,
                'location': {'x': int, 'y': int}
            }
        """
        try:
            import cv2
            
            # 加载截图和模板
            screenshot = cv2.imread(screenshot_path)
            template = cv2.imread(template_path)
            
            if screenshot is None or template is None:
                return {'found': False, 'error': 'Failed to load images'}
            
            # 模板匹配
            result = cv2.matchTemplate(screenshot, template, cv2.TM_CCOEFF_NORMED)
            min_val, max_val, min_loc, max_loc = cv2.minMaxLoc(result)
            
            if max_val >= threshold:
                return {
                    'found': True,
                    'confidence': float(max_val),
                    'location': {'x': int(max_loc[0]), 'y': int(max_loc[1])}
                }
            else:
                return {
                    'found': False,
                    'confidence': float(max_val),
                    'location': None
                }
        except ImportError:
            return {'found': False, 'error': 'OpenCV not installed'}
        except Exception as e:
            return {'found': False, 'error': str(e)}
    
    def detect_ui_change(self, serial, baseline_path, timeout=5000):
        """
        检测 UI 变化
        
        Returns:
            {
                'changed': bool,
                'change_time_ms': int,
                'screenshot_path': str
            }
        """
        start_time = datetime.now()
        screenshot_path = f"/tmp/adb_master_ui_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
        
        # 获取当前截图
        subprocess.run(['adb', '-s', serial, 'shell', 'screencap', '-p', '>', screenshot_path])
        
        # 对比
        result = self.compare_screenshots(baseline_path, screenshot_path)
        
        elapsed = (datetime.now() - start_time).total_seconds() * 1000
        
        return {
            'changed': not result['identical'],
            'change_time_ms': int(elapsed),
            'similarity': result['similarity'],
            'screenshot_path': screenshot_path,
            'diff_image_path': result['diff_image_path']
        }


class LogcatAnalyzer:
    """Logcat 日志分析器"""
    
    def __init__(self, serial):
        self.serial = serial
        self.process = None
    
    def start_monitoring(self, tags=None, filter_text=None):
        """
        开始监控 logcat
        
        Args:
            tags: 关注的标签列表，如 ['ReactNativeJS', 'ActivityManager']
            filter_text: 过滤文本
        """
        cmd = ['adb', '-s', self.serial, 'logcat', '-v', 'time']
        
        if tags:
            for tag in tags:
                cmd.extend(['-s', f'{tag}:I', '*:S'])
        
        self.process = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            bufsize=1
        )
    
    def stop_monitoring(self):
        """停止监控"""
        if self.process:
            self.process.terminate()
            self.process = None
    
    def get_recent_logs(self, lines=100, tag=None):
        """获取最近的日志"""
        cmd = ['adb', '-s', self.serial, 'logcat', '-d', '-t', str(lines)]
        
        if tag:
            cmd.extend(['-s', f'{tag}:I'])
        
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
        return result.stdout.split('\n')
    
    def search_logs(self, pattern, lines=1000):
        """搜索日志"""
        logs = self.get_recent_logs(lines)
        matches = []
        
        for log in logs:
            if pattern in log:
                matches.append(log)
        
        return matches
    
    def wait_for_log(self, pattern, timeout=10000):
        """等待特定日志出现"""
        import time
        start_time = time.time()
        
        while (time.time() - start_time) * 1000 < timeout:
            logs = self.get_recent_logs(50)
            for log in logs:
                if pattern in log:
                    return {'found': True, 'log': log}
            time.sleep(0.5)
        
        return {'found': False, 'timeout': True}
    
    def detect_errors(self, lines=100):
        """检测错误日志"""
        logs = self.get_recent_logs(lines)
        errors = []
        
        for log in logs:
            if any(keyword in log for keyword in ['FATAL', 'ERROR', 'CRASH', 'Exception']):
                errors.append(log)
        
        return errors


class RegressionTester:
    """回归测试器"""
    
    def __init__(self, serial, baseline_dir='/tmp/adb_baselines'):
        self.serial = serial
        self.baseline_dir = baseline_dir
        
        if not os.path.exists(baseline_dir):
            os.makedirs(baseline_dir)
    
    def capture_baseline(self, scenario_name):
        """捕获基准截图"""
        screenshot_path = os.path.join(self.baseline_dir, f'{scenario_name}_baseline.png')
        
        subprocess.run([
            'adb', '-s', self.serial,
            'shell', 'screencap', '-p', '/sdcard/screen.png'
        ], check=True)
        
        subprocess.run([
            'adb', '-s', self.serial,
            'pull', '/sdcard/screen.png', screenshot_path
        ], check=True)
        
        # 保存元数据
        metadata = {
            'scenario': scenario_name,
            'timestamp': datetime.now().isoformat(),
            'device': self._get_device_info()
        }
        
        metadata_path = screenshot_path.replace('.png', '.json')
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        return screenshot_path
    
    def run_regression_test(self, scenario_name):
        """运行回归测试"""
        baseline_path = os.path.join(self.baseline_dir, f'{scenario_name}_baseline.png')
        
        if not os.path.exists(baseline_path):
            return {'error': 'Baseline not found', 'scenario': scenario_name}
        
        # 获取当前截图
        current_path = f"/tmp/adb_master_regression_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
        
        subprocess.run([
            'adb', '-s', self.serial,
            'shell', 'screencap', '-p', '/sdcard/screen.png'
        ], check=True)
        
        subprocess.run([
            'adb', '-s', self.serial,
            'pull', '/sdcard/screen.png', current_path
        ], check=True)
        
        # 对比
        validator = PixelValidator()
        result = validator.compare_screenshots(baseline_path, current_path)
        
        return {
            'scenario': scenario_name,
            'passed': result['identical'],
            'similarity': result['similarity'],
            'diff_percent': result['diff_percent'],
            'diff_image_path': result['diff_image_path'],
            'current_screenshot': current_path,
            'baseline_screenshot': baseline_path
        }
    
    def _get_device_info(self):
        """获取设备信息"""
        result = subprocess.run(
            ['adb', '-s', self.serial, 'shell', 'getprop'],
            capture_output=True, text=True
        )
        
        info = {}
        for line in result.stdout.split('\n'):
            if '[' in line:
                parts = line.split(']: [')
                if len(parts) == 2:
                    key = parts[0].strip('[')
                    value = parts[1].strip(']')
                    info[key] = value
        
        return info


# 命令行接口
def cmd_compare(args):
    """对比截图"""
    validator = PixelValidator(tolerance=args.get('tolerance', 0.02))
    
    result = validator.compare_screenshots(
        args['screenshot1'],
        args['screenshot2']
    )
    
    print(json.dumps(result, indent=2))
    return result['identical']


def cmd_monitor_logcat(args):
    """监控 logcat"""
    analyzer = LogcatAnalyzer(args.get('serial', ''))
    
    if args.get('action') == 'search':
        logs = analyzer.search_logs(args['pattern'])
        for log in logs:
            print(log)
        return len(logs) > 0
    
    elif args.get('action') == 'wait':
        result = analyzer.wait_for_log(args['pattern'], timeout=args.get('timeout', 10000))
        print(json.dumps(result, indent=2))
        return result['found']
    
    elif args.get('action') == 'errors':
        errors = analyzer.detect_errors()
        for error in errors:
            print(error)
        return len(errors) == 0
    
    return False


def cmd_regression(args):
    """回归测试"""
    tester = RegressionTester(args.get('serial', ''))
    
    if args.get('action') == 'capture':
        path = tester.capture_baseline(args['scenario'])
        print(f"Baseline captured: {path}")
        return True
    
    elif args.get('action') == 'test':
        result = tester.run_regression_test(args['scenario'])
        print(json.dumps(result, indent=2))
        return result['passed']
    
    return False


def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Pixel Validation & Logcat Analysis')
    subparsers = parser.add_subparsers(dest='command')
    
    # compare 命令
    cmp_parser = subparsers.add_parser('compare', help='Compare screenshots')
    cmp_parser.add_argument('screenshot1')
    cmp_parser.add_argument('screenshot2')
    cmp_parser.add_argument('--tolerance', type=float, default=0.02)
    
    # logcat 命令
    logcat_parser = subparsers.add_parser('logcat', help='Logcat analysis')
    logcat_parser.add_argument('action', choices=['search', 'wait', 'errors'])
    logcat_parser.add_argument('--serial', default='')
    logcat_parser.add_argument('--pattern', default='')
    logcat_parser.add_argument('--timeout', type=int, default=10000)
    
    # regression 命令
    reg_parser = subparsers.add_parser('regression', help='Regression testing')
    reg_parser.add_argument('action', choices=['capture', 'test'])
    reg_parser.add_argument('--serial', default='')
    reg_parser.add_argument('--scenario', required=True)
    
    args = parser.parse_args()
    
    if args.command == 'compare':
        success = cmd_compare(vars(args))
    elif args.command == 'logcat':
        success = cmd_monitor_logcat(vars(args))
    elif args.command == 'regression':
        success = cmd_regression(vars(args))
    else:
        parser.print_help()
        return
    
    sys.exit(0 if success else 1)


if __name__ == '__main__':
    main()
