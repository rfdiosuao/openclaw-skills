#!/usr/bin/env python3
"""
OpenClaw ADB Master - 视觉定位系统
使用视觉模型（GPT-4o/Claude）定位 UI 元素
支持自然语言描述： "红色登录按钮"、"右上角搜索图标"
"""

import base64
import json
import sys
import os
import requests
from typing import Optional, Dict, Any

class VisionLocator:
    """视觉定位器 - 使用视觉模型定位 UI 元素"""
    
    def __init__(self, api_key: Optional[str] = None, model: str = "gpt-4o"):
        self.api_key = api_key or os.getenv('OPENAI_API_KEY')
        self.model = model
        self.api_url = "https://api.openai.com/v1/chat/completions"
    
    def locate(self, screenshot_path: str, description: str) -> Optional[Dict[str, Any]]:
        """
        定位元素
        
        Args:
            screenshot_path: 截图路径
            description: 自然语言描述，如"红色登录按钮"
        
        Returns:
            {'x': int, 'y': int, 'confidence': float, 'reasoning': str}
        """
        # 编码截图
        with open(screenshot_path, 'rb') as f:
            image_base64 = base64.b64encode(f.read()).decode('utf-8')
        
        # 构建提示词
        prompt = f"""Analyze this screenshot and find the UI element described as: "{description}"

Return the center coordinates (x, y) of the element as a JSON object:
{{
  "x": <center x coordinate>,
  "y": <center y coordinate>,
  "confidence": <0.0-1.0>,
  "reasoning": "<brief explanation>"
}}

Only return the JSON object, no other text."""

        # 调用视觉模型
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }
        
        payload = {
            "model": self.model,
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": prompt
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/png;base64,{image_base64}"
                            }
                        }
                    ]
                }
            ],
            "max_tokens": 200
        }
        
        try:
            response = requests.post(self.api_url, headers=headers, json=payload, timeout=30)
            response.raise_for_status()
            
            result = response.json()
            content = result['choices'][0]['message']['content']
            
            # 解析 JSON 响应
            coords = json.loads(content.strip())
            return {
                'x': int(coords.get('x', 0)),
                'y': int(coords.get('y', 0)),
                'confidence': float(coords.get('confidence', 0)),
                'reasoning': coords.get('reasoning', '')
            }
        except Exception as e:
            print(f"Vision locate error: {e}")
            return None


class DeepLinkResolver:
    """Deep Link 解析器 - 将自然语言转换为 Deep Link"""
    
    def __init__(self):
        # 常用 App 的 Deep Link 模板
        self.templates = {
            'douyin': {
                'search': 'snssdk1128://search/result?keyword={keyword}&type={type}',
                'user': 'snssdk1128://user/profile/{user_id}',
                'live': 'snssdk1128://live?room_id={room_id}',
                'video': 'snssdk1128://video/{video_id}',
            },
            'wechat': {
                'profile': 'weixin://dl/profile?username={username}',
                'scan': 'weixin://scanqrcode',
                'pay': 'weixin://wap/pay?orderid={orderid}',
            },
            'alipay': {
                'scan': 'alipayqr://platformapi/startapp?saId=10000007',
                'pay': 'alipays://platformapi/startapp?appId=09999988&url={url}',
                'transfer': 'alipays://platformapi/startapp?saId=10000001&userId={user_id}',
            },
            'taobao': {
                'search': 'taobao://search?q={keyword}',
                'item': 'taobao://item.taobao.com/item.htm?id={item_id}',
                'shop': 'taobao://shop.m.taobao.com/shop/shop_index.htm?shop_id={shop_id}',
            },
            'meituan': {
                'search': 'imeituan://www.meituan.com/search?keyword={keyword}',
                'shop': 'imeituan://www.meituan.com/shop/{shop_id}',
                'order': 'imeituan://www.meituan.com/order/{order_id}',
            },
            'didichuxing': {
                'ride': 'diditaxi://ride?pickup={pickup}&destination={destination}',
                'bike': 'diditaxi://bike',
            },
        }
    
    def resolve(self, app: str, action: str, params: Dict[str, str]) -> Optional[str]:
        """
        解析 Deep Link
        
        Args:
            app: App 名称（douyin/wechat/alipay 等）
            action: 动作（search/user/pay 等）
            params: 参数
        
        Returns:
            Deep Link URL 或 None
        """
        app_templates = self.templates.get(app)
        if not app_templates:
            return None
        
        template = app_templates.get(action)
        if not template:
            return None
        
        try:
            return template.format(**params)
        except KeyError as e:
            print(f"Missing parameter for Deep Link: {e}")
            return None
    
    def get_supported_apps(self) -> list:
        """获取支持的 App 列表"""
        return list(self.templates.keys())


class AppProfile:
    """App 配置文件"""
    
    def __init__(self, package_name: str, profile_data: Dict[str, Any]):
        self.package_name = package_name
        self.name = profile_data.get('name', '')
        self.deep_links = profile_data.get('deep_links', {})
        self.known_layouts = profile_data.get('known_layouts', {})
        self.workarounds = profile_data.get('workarounds', {})
        self.common_texts = profile_data.get('common_texts', {})
    
    def get_deep_link(self, action: str, params: Dict[str, str]) -> Optional[str]:
        """获取 Deep Link"""
        template = self.deep_links.get(action)
        if not template:
            return None
        try:
            return template.format(**params)
        except:
            return None
    
    def get_known_element(self, element_name: str) -> Optional[Dict]:
        """获取已知元素位置"""
        return self.known_layouts.get(element_name)
    
    def get_workaround(self, issue: str) -> Optional[str]:
        """获取解决方案"""
        return self.workarounds.get(issue)


class AppProfileManager:
    """App 配置管理器"""
    
    def __init__(self, profiles_dir: str = None):
        self.profiles_dir = profiles_dir or os.path.join(os.path.dirname(__file__), '..', 'profiles')
        self.profiles = {}
        self._load_profiles()
    
    def _load_profiles(self):
        """加载所有配置文件"""
        if not os.path.exists(self.profiles_dir):
            os.makedirs(self.profiles_dir)
            self._create_default_profiles()
        
        for filename in os.listdir(self.profiles_dir):
            if filename.endswith('.json'):
                filepath = os.path.join(self.profiles_dir, filename)
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                        profile = AppProfile(data['package_name'], data)
                        self.profiles[data['package_name']] = profile
                except Exception as e:
                    print(f"Failed to load profile {filename}: {e}")
    
    def _create_default_profiles(self):
        """创建默认配置文件"""
        # 抖音配置
        douyin_profile = {
            "package_name": "com.ss.android.ugc.aweme",
            "name": "抖音",
            "deep_links": {
                "search": "snssdk1128://search/result?keyword={keyword}&type={type}",
                "user": "snssdk1128://user/profile/{user_id}",
                "live": "snssdk1128://live?room_id={room_id}",
                "video": "snssdk1128://video/{video_id}",
            },
            "known_layouts": {
                "search_button": {"text": "搜索", "position": "top_right"},
                "home_tab": {"text": "首页", "position": "bottom_nav_0"},
                "friends_tab": {"text": "朋友", "position": "bottom_nav_1"},
                "message_tab": {"text": "消息", "position": "bottom_nav_3"},
                "me_tab": {"text": "我", "position": "bottom_nav_4"},
            },
            "workarounds": {
                "video_playing": "Tap screen center to pause before UI dump",
                "chinese_input": "Use deep links instead of type command",
            },
            "common_texts": {
                "skip": "跳过",
                "agree": "同意",
                "allow": "允许",
                "cancel": "取消",
            }
        }
        
        # 微信配置
        wechat_profile = {
            "package_name": "com.tencent.mm",
            "name": "微信",
            "deep_links": {
                "scan": "weixin://scanqrcode",
                "profile": "weixin://dl/profile?username={username}",
                "pay": "weixin://wap/pay?orderid={orderid}",
            },
            "known_layouts": {
                "chats_tab": {"text": "微信", "position": "bottom_nav_0"},
                "contacts_tab": {"text": "通讯录", "position": "bottom_nav_1"},
                "discover_tab": {"text": "发现", "position": "bottom_nav_2"},
                "me_tab": {"text": "我", "position": "bottom_nav_3"},
            },
            "workarounds": {},
            "common_texts": {}
        }
        
        # 支付宝配置
        alipay_profile = {
            "package_name": "com.eg.android.AlipayGphone",
            "name": "支付宝",
            "deep_links": {
                "scan": "alipayqr://platformapi/startapp?saId=10000007",
                "pay": "alipays://platformapi/startapp?appId=09999988&url={url}",
                "transfer": "alipays://platformapi/startapp?saId=10000001&userId={user_id}",
            },
            "known_layouts": {
                "home_tab": {"text": "首页", "position": "bottom_nav_0"},
                "wealth_tab": {"text": "理财", "position": "bottom_nav_1"},
                "message_tab": {"text": "消息", "position": "bottom_nav_3"},
                "me_tab": {"text": "我的", "position": "bottom_nav_4"},
            },
            "workarounds": {},
            "common_texts": {}
        }
        
        # 保存配置文件
        for profile_data in [douyin_profile, wechat_profile, alipay_profile]:
            filepath = os.path.join(self.profiles_dir, f"{profile_data['package_name']}.json")
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(profile_data, f, ensure_ascii=False, indent=2)
    
    def get_profile(self, package_name: str) -> Optional[AppProfile]:
        """获取 App 配置"""
        return self.profiles.get(package_name)
    
    def list_profiles(self) -> list:
        """列出所有配置"""
        return list(self.profiles.keys())


# 命令行接口
def cmd_locate(args):
    """视觉定位命令"""
    screenshot = args.get('screenshot')
    description = args.get('description')
    api_key = args.get('api_key')
    
    if not screenshot or not description:
        print("Usage: vision locate --screenshot FILE --description '描述' [--api-key KEY]")
        return False
    
    locator = VisionLocator(api_key)
    result = locator.locate(screenshot, description)
    
    if result:
        print(json.dumps(result, indent=2))
        return True
    else:
        print("Failed to locate element")
        return False


def cmd_deep_link(args):
    """Deep Link 命令"""
    app = args.get('app')
    action = args.get('action')
    params = args.get('params', '{}')
    
    resolver = DeepLinkResolver()
    link = resolver.resolve(app, action, json.loads(params))
    
    if link:
        print(f"Deep Link: {link}")
        return True
    else:
        print(f"Failed to resolve Deep Link for {app}/{action}")
        print(f"Supported apps: {resolver.get_supported_apps()}")
        return False


def cmd_profile(args):
    """App 配置命令"""
    action = args.get('subaction')
    package = args.get('package')
    
    manager = AppProfileManager()
    
    if action == 'list':
        print("Available profiles:")
        for pkg in manager.list_profiles():
            print(f"  - {pkg}")
        return True
    
    elif action == 'get' and package:
        profile = manager.get_profile(package)
        if profile:
            print(f"Package: {profile.package_name}")
            print(f"Name: {profile.name}")
            print(f"Deep Links: {list(profile.deep_links.keys())}")
            print(f"Known Layouts: {list(profile.known_layouts.keys())}")
            return True
        else:
            print(f"Profile not found: {package}")
            return False
    
    else:
        print("Usage: profile list | profile get --package PACKAGE")
        return False


def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Vision & Deep Link Tools')
    subparsers = parser.add_subparsers(dest='command')
    
    # vision locate 命令
    vision_parser = subparsers.add_parser('vision', help='Vision-based location')
    vision_parser.add_argument('subaction', choices=['locate'])
    vision_parser.add_argument('--screenshot', required=True)
    vision_parser.add_argument('--description', required=True)
    vision_parser.add_argument('--api-key', default='')
    
    # deep-link 命令
    dl_parser = subparsers.add_parser('deep-link', help='Resolve Deep Link')
    dl_parser.add_argument('--app', required=True)
    dl_parser.add_argument('--action', required=True)
    dl_parser.add_argument('--params', default='{}')
    
    # profile 命令
    profile_parser = subparsers.add_parser('profile', help='App Profile')
    profile_parser.add_argument('subaction', choices=['list', 'get'])
    profile_parser.add_argument('--package', default='')
    
    args = parser.parse_args()
    
    if args.command == 'vision':
        success = cmd_locate(vars(args))
    elif args.command == 'deep-link':
        success = cmd_deep_link(vars(args))
    elif args.command == 'profile':
        success = cmd_profile(vars(args))
    else:
        parser.print_help()
        return
    
    sys.exit(0 if success else 1)


if __name__ == '__main__':
    main()
