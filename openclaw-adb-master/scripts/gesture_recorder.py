#!/usr/bin/env python3
"""
OpenClaw ADB Master - 手势录制与回放系统
录制手势 | 回放手势 | 手势库 | 复杂操作自动化
"""

import os
import sys
import json
import time
import subprocess
from datetime import datetime
from typing import List, Dict, Any

class GestureRecorder:
    """手势录制器"""
    
    def __init__(self, serial):
        self.serial = serial
        self.events = []
        self.start_time = None
        self.recording = False
    
    def start_recording(self):
        """开始录制"""
        self.events = []
        self.start_time = time.time()
        self.recording = True
        print("[RECORDING] Started. Perform gestures on device...")
    
    def stop_recording(self):
        """停止录制"""
        self.recording = False
        elapsed = time.time() - self.start_time
        print(f"[RECORDING] Stopped. {len(self.events)} events recorded in {elapsed:.2f}s")
        return self.events
    
    def record_tap(self, x, y):
        """录制点击"""
        if self.recording:
            self.events.append({
                'type': 'tap',
                'x': x,
                'y': y,
                'timestamp': time.time() - self.start_time
            })
    
    def record_swipe(self, x1, y1, x2, y2, duration=300):
        """录制滑动"""
        if self.recording:
            self.events.append({
                'type': 'swipe',
                'x1': x1,
                'y1': y1,
                'x2': x2,
                'y2': y2,
                'duration': duration,
                'timestamp': time.time() - self.start_time
            })
    
    def record_long_press(self, x, y, duration=1000):
        """录制长按"""
        if self.recording:
            self.events.append({
                'type': 'long_press',
                'x': x,
                'y': y,
                'duration': duration,
                'timestamp': time.time() - self.start_time
            })
    
    def save(self, filepath):
        """保存手势"""
        data = {
            'version': '1.0',
            'created_at': datetime.now().isoformat(),
            'device_serial': self.serial,
            'event_count': len(self.events),
            'events': self.events
        }
        
        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2)
        
        print(f"[SAVE] Gesture saved to: {filepath}")
        return filepath
    
    def load(self, filepath):
        """加载手势"""
        with open(filepath, 'r') as f:
            data = json.load(f)
        
        self.events = data.get('events', [])
        print(f"[LOAD] {len(self.events)} events loaded from: {filepath}")
        return self.events


class GesturePlayer:
    """手势回放器"""
    
    def __init__(self, serial):
        self.serial = serial
    
    def play(self, events, speed=1.0, loop=1):
        """
        回放手势
        
        Args:
            events: 手势事件列表
            speed: 回放速度 (1.0=原速，2.0=双倍速)
            loop: 回放次数
        """
        print(f"[PLAY] Starting playback ({len(events)} events, speed={speed}x, loop={loop})")
        
        for i in range(loop):
            if loop > 1:
                print(f"[PLAY] Loop {i+1}/{loop}")
            
            for event in events:
                self._execute_event(event, speed)
        
        print("[PLAY] Completed")
    
    def _execute_event(self, event, speed):
        """执行单个事件"""
        event_type = event.get('type')
        
        if event_type == 'tap':
            subprocess.run([
                'adb', '-s', self.serial,
                'shell', 'input', 'tap',
                str(event['x']), str(event['y'])
            ])
        
        elif event_type == 'swipe':
            subprocess.run([
                'adb', '-s', self.serial,
                'shell', 'input', 'swipe',
                str(event['x1']), str(event['y1']),
                str(event['x2']), str(event['y2']),
                str(int(event.get('duration', 300) / speed))
            ])
        
        elif event_type == 'long_press':
            subprocess.run([
                'adb', '-s', self.serial,
                'shell', 'input', 'swipe',
                str(event['x']), str(event['y']),
                str(event['x']), str(event['y']),
                str(int(event.get('duration', 1000) / speed))
            ])
        
        # 等待到下一个事件
        if 'timestamp' in event:
            next_timestamp = event['timestamp']
            time.sleep(next_timestamp / speed)
    
    def play_file(self, filepath, speed=1.0, loop=1):
        """回放手势文件"""
        recorder = GestureRecorder(self.serial)
        events = recorder.load(filepath)
        self.play(events, speed, loop)


class GestureLibrary:
    """手势库"""
    
    def __init__(self, library_dir=None):
        if library_dir is None:
            library_dir = os.path.join(os.path.dirname(__file__), '..', 'gestures')
        
        self.library_dir = library_dir
        if not os.path.exists(library_dir):
            os.makedirs(library_dir)
        
        self.gestures = {}
        self._load_library()
    
    def _load_library(self):
        """加载手势库"""
        for filename in os.listdir(self.library_dir):
            if filename.endswith('.json'):
                filepath = os.path.join(self.library_dir, filename)
                name = filename.replace('.json', '')
                
                with open(filepath, 'r') as f:
                    data = json.load(f)
                
                self.gestures[name] = {
                    'name': name,
                    'filepath': filepath,
                    'event_count': data.get('event_count', 0),
                    'created_at': data.get('created_at', ''),
                    'description': data.get('description', '')
                }
    
    def list_gestures(self):
        """列出手势"""
        return list(self.gestures.values())
    
    def get_gesture(self, name):
        """获取手势"""
        return self.gestures.get(name)
    
    def save_gesture(self, name, events, description=''):
        """保存手势"""
        filepath = os.path.join(self.library_dir, f'{name}.json')
        
        data = {
            'name': name,
            'description': description,
            'created_at': datetime.now().isoformat(),
            'event_count': len(events),
            'events': events
        }
        
        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2)
        
        self.gestures[name] = {
            'name': name,
            'filepath': filepath,
            'event_count': len(events),
            'created_at': data['created_at'],
            'description': description
        }
        
        return filepath


class ComplexActionBuilder:
    """复杂操作构建器"""
    
    def __init__(self, serial):
        self.serial = serial
        self.actions = []
    
    def tap(self, x, y, wait=0):
        """添加点击动作"""
        self.actions.append({'type': 'tap', 'x': x, 'y': y, 'wait': wait})
        return self
    
    def swipe(self, direction, duration=300, wait=0):
        """添加滑动动作"""
        self.actions.append({
            'type': 'swipe',
            'direction': direction,
            'duration': duration,
            'wait': wait
        })
        return self
    
    def long_press(self, x, y, duration=1000, wait=0):
        """添加长按动作"""
        self.actions.append({
            'type': 'long_press',
            'x': x,
            'y': y,
            'duration': duration,
            'wait': wait
        })
        return self
    
    def wait(self, duration):
        """添加等待"""
        self.actions.append({'type': 'wait', 'duration': duration})
        return self
    
    def input_text(self, text, wait=0):
        """添加输入"""
        self.actions.append({'type': 'input', 'text': text, 'wait': wait})
        return self
    
    def key(self, key, wait=0):
        """添加按键"""
        self.actions.append({'type': 'key', 'key': key, 'wait': wait})
        return self
    
    def execute(self, loop=1):
        """执行动作序列"""
        print(f"[EXECUTE] Running {len(self.actions)} actions (loop={loop})")
        
        for i in range(loop):
            if loop > 1:
                print(f"[EXECUTE] Loop {i+1}/{loop}")
            
            for action in self.actions:
                self._execute_action(action)
        
        print("[EXECUTE] Completed")
    
    def _execute_action(self, action):
        """执行单个动作"""
        action_type = action.get('type')
        
        if action_type == 'tap':
            subprocess.run([
                'adb', '-s', self.serial,
                'shell', 'input', 'tap',
                str(action['x']), str(action['y'])
            ])
        
        elif action_type == 'swipe':
            # 获取屏幕尺寸
            size_result = subprocess.run([
                'adb', '-s', self.serial,
                'shell', 'wm', 'size'
            ], capture_output=True, text=True)
            
            size = size_result.stdout.split(': ')[1].strip()
            width, height = map(int, size.split('x'))
            
            # 计算滑动坐标
            direction = action['direction']
            if direction == 'up':
                x1, y1 = width // 2, height * 3 // 4
                x2, y2 = width // 2, height // 4
            elif direction == 'down':
                x1, y1 = width // 2, height // 4
                x2, y2 = width // 2, height * 3 // 4
            elif direction == 'left':
                x1, y1 = width * 3 // 4, height // 2
                x2, y2 = width // 4, height // 2
            elif direction == 'right':
                x1, y1 = width // 4, height // 2
                x2, y2 = width * 3 // 4, height // 2
            else:
                return
            
            subprocess.run([
                'adb', '-s', self.serial,
                'shell', 'input', 'swipe',
                str(x1), str(y1), str(x2), str(y2),
                str(action.get('duration', 300))
            ])
        
        elif action_type == 'long_press':
            subprocess.run([
                'adb', '-s', self.serial,
                'shell', 'input', 'swipe',
                str(action['x']), str(action['y']),
                str(action['x']), str(action['y']),
                str(action.get('duration', 1000))
            ])
        
        elif action_type == 'wait':
            time.sleep(action['duration'] / 1000.0)
        
        elif action_type == 'input':
            text = action['text'].replace(' ', '%')
            subprocess.run([
                'adb', '-s', self.serial,
                'shell', 'input', 'text',
                text
            ])
        
        elif action_type == 'key':
            keymap = {
                'HOME': 3, 'BACK': 4, 'ENTER': 66,
                'TAB': 61, 'DEL': 67, 'POWER': 26
            }
            keycode = keymap.get(action['key'], 0)
            subprocess.run([
                'adb', '-s', self.serial,
                'shell', 'input', 'keyevent',
                str(keycode)
            ])
        
        # 等待
        if action.get('wait', 0) > 0:
            time.sleep(action['wait'] / 1000.0)
    
    def save(self, filepath):
        """保存动作序列"""
        data = {
            'version': '1.0',
            'created_at': datetime.now().isoformat(),
            'device_serial': self.serial,
            'action_count': len(self.actions),
            'actions': self.actions
        }
        
        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2)
        
        print(f"[SAVE] Action sequence saved to: {filepath}")
        return filepath


# 命令行接口
def cmd_record(args):
    """录制手势"""
    recorder = GestureRecorder(args.get('serial', ''))
    recorder.start_recording()
    
    # 等待用户操作（简化实现：等待 10 秒）
    print("Perform gestures on device for 10 seconds...")
    time.sleep(10)
    
    events = recorder.stop_recording()
    
    if args.get('output'):
        recorder.save(args['output'])
    
    return True


def cmd_play(args):
    """回放手势"""
    player = GesturePlayer(args.get('serial', ''))
    
    if args.get('file'):
        player.play_file(args['file'], args.get('speed', 1.0), args.get('loop', 1))
    else:
        print("Error: --file required")
        return False
    
    return True


def cmd_library(args):
    """手势库管理"""
    library = GestureLibrary()
    
    if args.get('action') == 'list':
        gestures = library.list_gestures()
        print(f"Gesture Library ({len(gestures)} gestures):")
        for g in gestures:
            print(f"  - {g['name']} ({g['event_count']} events)")
        return True
    
    return False


def cmd_build(args):
    """构建复杂动作"""
    builder = ComplexActionBuilder(args.get('serial', ''))
    
    # 示例：抖音滑动
    if args.get('preset') == 'douyin_scroll':
        builder \
            .wait(1000) \
            .swipe('up', duration=300, wait=500) \
            .swipe('up', duration=300, wait=500) \
            .swipe('up', duration=300, wait=500)
    
    # 示例：微信聊天
    elif args.get('preset') == 'wechat_chat':
        builder \
            .tap(540, 960, wait=500) \
            .input_text('Hello', wait=500) \
            .key('ENTER', wait=1000)
    
    if args.get('output'):
        builder.save(args['output'])
    else:
        builder.execute(args.get('loop', 1))
    
    return True


def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Gesture Recording & Playback')
    subparsers = parser.add_subparsers(dest='command')
    
    # record 命令
    rec_parser = subparsers.add_parser('record', help='Record gestures')
    rec_parser.add_argument('--serial', default='')
    rec_parser.add_argument('--output', required=True)
    
    # play 命令
    play_parser = subparsers.add_parser('play', help='Play gestures')
    play_parser.add_argument('--serial', default='')
    play_parser.add_argument('--file', required=True)
    play_parser.add_argument('--speed', type=float, default=1.0)
    play_parser.add_argument('--loop', type=int, default=1)
    
    # library 命令
    lib_parser = subparsers.add_parser('library', help='Gesture library')
    lib_parser.add_argument('action', choices=['list'])
    
    # build 命令
    build_parser = subparsers.add_parser('build', help='Build complex actions')
    build_parser.add_argument('--serial', default='')
    build_parser.add_argument('--preset', choices=['douyin_scroll', 'wechat_chat'])
    build_parser.add_argument('--output', default='')
    build_parser.add_argument('--loop', type=int, default=1)
    
    args = parser.parse_args()
    
    if args.command == 'record':
        success = cmd_record(vars(args))
    elif args.command == 'play':
        success = cmd_play(vars(args))
    elif args.command == 'library':
        success = cmd_library(vars(args))
    elif args.command == 'build':
        success = cmd_build(vars(args))
    else:
        parser.print_help()
        return
    
    sys.exit(0 if success else 1)


if __name__ == '__main__':
    main()
