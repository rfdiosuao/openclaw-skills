#!/usr/bin/env python3
"""
OpenClaw ADB Master - 多设备并行控制系统
设备组管理 | 并行执行 | 广播命令 | 设备同步
"""

import os
import sys
import json
import subprocess
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime
from typing import List, Dict, Any

class DeviceManager:
    """设备管理器"""
    
    def __init__(self):
        self.devices = []
        self._refresh_devices()
    
    def _refresh_devices(self):
        """刷新设备列表"""
        result = subprocess.run(
            ['adb', 'devices'],
            capture_output=True, text=True
        )
        
        self.devices = []
        for line in result.stdout.split('\n')[1:]:
            if '\tdevice' in line:
                parts = line.split('\t')
                self.devices.append({
                    'serial': parts[0],
                    'status': parts[1] if len(parts) > 1 else 'device',
                    'model': self._get_model(parts[0])
                })
    
    def _get_model(self, serial):
        """获取设备型号"""
        try:
            result = subprocess.run(
                ['adb', '-s', serial, 'shell', 'getprop', 'ro.product.model'],
                capture_output=True, text=True, timeout=5
            )
            return result.stdout.strip()
        except:
            return 'Unknown'
    
    def list_devices(self):
        """列出所有设备"""
        self._refresh_devices()
        return self.devices
    
    def get_device_group(self, group_name):
        """获取设备组"""
        group_file = f"/tmp/adb_device_group_{group_name}.json"
        
        if os.path.exists(group_file):
            with open(group_file, 'r') as f:
                return json.load(f)
        
        return []
    
    def save_device_group(self, group_name, devices):
        """保存设备组"""
        group_file = f"/tmp/adb_device_group_{group_name}.json"
        
        with open(group_file, 'w') as f:
            json.dump(devices, f, indent=2)
        
        return group_file


class ParallelExecutor:
    """并行执行器"""
    
    def __init__(self, max_workers=5):
        self.max_workers = max_workers
    
    def execute_on_devices(self, devices, command, timeout=30):
        """
        在多个设备上并行执行命令
        
        Args:
            devices: 设备序列号列表
            command: ADB 命令（不含 adb -s 部分）
            timeout: 超时时间（秒）
        
        Returns:
            {
                'serial': {'success': bool, 'output': str, 'error': str}
            }
        """
        results = {}
        
        def run_on_device(serial):
            try:
                cmd = ['adb', '-s', serial] + command.split()
                result = subprocess.run(
                    cmd,
                    capture_output=True, text=True, timeout=timeout
                )
                
                return {
                    'success': result.returncode == 0,
                    'output': result.stdout,
                    'error': result.stderr
                }
            except subprocess.TimeoutExpired:
                return {
                    'success': False,
                    'output': '',
                    'error': f'Timeout after {timeout}s'
                }
            except Exception as e:
                return {
                    'success': False,
                    'output': '',
                    'error': str(e)
                }
        
        with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
            future_to_serial = {
                executor.submit(run_on_device, serial): serial
                for serial in devices
            }
            
            for future in as_completed(future_to_serial):
                serial = future_to_serial[future]
                results[serial] = future.result()
        
        return results
    
    def parallel_screenshot(self, devices, output_dir='/tmp/adb_screenshots'):
        """并行截图"""
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
        
        command = f"shell screencap -p /sdcard/screen_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
        results = self.execute_on_devices(devices, command)
        
        # 拉取截图
        for serial, result in results.items():
            if result['success']:
                local_path = os.path.join(output_dir, f'{serial}.png')
                subprocess.run([
                    'adb', '-s', serial,
                    'pull', f'/sdcard/screen_*.png', local_path
                ])
        
        return results
    
    def parallel_install(self, devices, apk_path):
        """并行安装 APK"""
        command = f"install -r {apk_path}"
        return self.execute_on_devices(devices, command, timeout=120)
    
    def parallel_uninstall(self, devices, package_name):
        """并行卸载应用"""
        command = f"uninstall {package_name}"
        return self.execute_on_devices(devices, command)


class BroadcastController:
    """广播控制器"""
    
    def __init__(self):
        self.executor = ParallelExecutor()
    
    def broadcast(self, devices, action, extras=None):
        """
        发送广播到多个设备
        
        Args:
            devices: 设备序列号列表
            action: Broadcast action
            extras: 额外参数 dict
        """
        cmd = f"shell am broadcast -a {action}"
        
        if extras:
            for key, value in extras.items():
                if isinstance(value, int):
                    cmd += f" --ei {key} {value}"
                elif isinstance(value, bool):
                    cmd += f" --ez {key} {'true' if value else 'false'}"
                else:
                    cmd += f" --es {key} '{value}'"
        
        return self.executor.execute_on_devices(devices, cmd)
    
    def start_activity(self, devices, action, data=None, package=None):
        """
        启动 Activity 到多个设备
        
        Args:
            devices: 设备序列号列表
            action: Intent action
            data: Intent data (URI)
            package: Package name
        """
        cmd = "shell am start"
        
        if action:
            cmd += f" -a {action}"
        if data:
            cmd += f" -d '{data}'"
        if package:
            cmd += f" -n {package}/.{package.split('.')[-1]}Activity"
        
        return self.executor.execute_on_devices(devices, cmd)


class DeviceSynchronizer:
    """设备同步器"""
    
    def __init__(self, devices):
        self.devices = devices
        self.executor = ParallelExecutor()
    
    def sync_time(self):
        """同步所有设备时间"""
        current_time = datetime.now().strftime('%Y%m%d.%H%M%S')
        
        cmd = f"shell date {current_time}"
        results = self.executor.execute_on_devices(self.devices, cmd)
        
        success_count = sum(1 for r in results.values() if r['success'])
        print(f"[SYNC TIME] {success_count}/{len(self.devices)} devices synced")
        
        return results
    
    def sync_files(self, local_path, remote_path):
        """同步文件到所有设备"""
        results = {}
        
        for serial in self.devices:
            result = subprocess.run([
                'adb', '-s', serial,
                'push', local_path, remote_path
            ], capture_output=True, text=True)
            
            results[serial] = {
                'success': result.returncode == 0,
                'output': result.stdout,
                'error': result.stderr
            }
        
        return results
    
    def wait_for_all_ready(self, timeout=60):
        """等待所有设备就绪"""
        start_time = time.time()
        
        while (time.time() - start_time) < timeout:
            all_ready = True
            
            for serial in self.devices:
                result = subprocess.run([
                    'adb', '-s', serial,
                    'shell', 'getprop', 'sys.boot_completed'
                ], capture_output=True, text=True)
                
                if result.stdout.strip() != '1':
                    all_ready = False
                    break
            
            if all_ready:
                print(f"[SYNC] All {len(self.devices)} devices ready")
                return True
            
            time.sleep(1)
        
        print(f"[SYNC] Timeout waiting for devices")
        return False


# 命令行接口
def cmd_list_devices(args):
    """列出设备"""
    manager = DeviceManager()
    devices = manager.list_devices()
    
    print(f"Connected devices ({len(devices)}):")
    for device in devices:
        print(f"  {device['serial']}\t{device['model']}")
    
    return True


def cmd_parallel_exec(args):
    """并行执行"""
    manager = DeviceManager()
    devices = [d['serial'] for d in manager.list_devices()]
    
    if not devices:
        print("No devices found")
        return False
    
    executor = ParallelExecutor()
    results = executor.execute_on_devices(devices, args['command'])
    
    for serial, result in results.items():
        status = "✓" if result['success'] else "✗"
        print(f"{status} {serial}: {result['output'][:100]}")
    
    return True


def cmd_broadcast(args):
    """广播"""
    manager = DeviceManager()
    devices = [d['serial'] for d in manager.list_devices()]
    
    controller = BroadcastController()
    results = controller.broadcast(
        devices,
        args['action'],
        json.loads(args.get('extras', '{}'))
    )
    
    for serial, result in results.items():
        status = "✓" if result['success'] else "✗"
        print(f"{status} {serial}")
    
    return True


def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Multi-Device Control')
    subparsers = parser.add_subparsers(dest='command')
    
    # list-devices 命令
    list_parser = subparsers.add_parser('list-devices', help='List devices')
    
    # parallel 命令
    par_parser = subparsers.add_parser('parallel', help='Parallel execution')
    par_parser.add_argument('command')
    
    # broadcast 命令
    bc_parser = subparsers.add_parser('broadcast', help='Broadcast')
    bc_parser.add_argument('--action', required=True)
    bc_parser.add_argument('--extras', default='{}')
    
    args = parser.parse_args()
    
    if args.command == 'list-devices':
        success = cmd_list_devices(vars(args))
    elif args.command == 'parallel':
        success = cmd_parallel_exec(vars(args))
    elif args.command == 'broadcast':
        success = cmd_broadcast(vars(args))
    else:
        parser.print_help()
        return
    
    sys.exit(0 if success else 1)


if __name__ == '__main__':
    main()
