#!/usr/bin/env python3
"""
OpenClaw ADB Master - UI 树解析工具
解析 uiautomator dump 生成的 view.xml，提取元素索引和坐标
"""

import xml.etree.ElementTree as ET
import sys
import json

def parse_ui_tree(xml_file):
    """解析 UI 树，返回元素列表"""
    tree = ET.parse(xml_file)
    root = tree.getroot()
    
    elements = []
    index = 0
    
    def traverse(node, depth=0):
        nonlocal index
        
        # 提取元素信息
        text = node.get('text', '')
        content_desc = node.get('content-desc', '')
        resource_id = node.get('resource-id', '')
        bounds = node.get('bounds', '')
        clickable = node.get('clickable', 'false')
        
        # 只保留可交互的元素
        if clickable == 'true' or text or content_desc:
            # 解析边界
            if bounds:
                try:
                    coords = bounds.strip('[]').split('][')
                    x1, y1 = map(int, coords[0].split(','))
                    x2, y2 = map(int, coords[1].split(','))
                    center_x = (x1 + x2) // 2
                    center_y = (y1 + y2) // 2
                    
                    elements.append({
                        'index': index,
                        'text': text,
                        'content_desc': content_desc,
                        'resource_id': resource_id,
                        'bounds': bounds,
                        'center': (center_x, center_y),
                        'depth': depth
                    })
                    index += 1
                except:
                    pass
        
        # 递归遍历子节点
        for child in node:
            traverse(child, depth + 1)
    
    traverse(root)
    return elements

def print_elements(elements):
    """打印元素列表"""
    print("\n=== Interactive Elements ===\n")
    print(f"{'Index':<6} {'Text/Desc':<30} {'Bounds':<20} {'Center':<12}")
    print("-" * 70)
    
    for elem in elements:
        text_desc = elem['text'] or elem['content_desc'] or elem['resource_id']
        if len(text_desc) > 28:
            text_desc = text_desc[:25] + '...'
        
        print(f"{elem['index']:<6} {text_desc:<30} {elem['bounds']:<20} "
              f"{elem['center'][0]},{elem['center'][1]:<12}")

def find_element(elements, **kwargs):
    """查找元素"""
    for elem in elements:
        match = True
        for key, value in kwargs.items():
            if key == 'text' and elem['text'] != value:
                match = False
            elif key == 'index' and elem['index'] != value:
                match = False
            elif key == 'resource_id' and value not in elem['resource_id']:
                match = False
        
        if match:
            return elem
    
    return None

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: parse_ui.py <view.xml> [index|text|id]")
        sys.exit(1)
    
    xml_file = sys.argv[1]
    elements = parse_ui_tree(xml_file)
    
    if len(sys.argv) > 2:
        # 查找特定元素
        query = sys.argv[2]
        if query.isdigit():
            elem = find_element(elements, index=int(query))
        else:
            elem = find_element(elements, text=query)
        
        if elem:
            print(json.dumps(elem, indent=2))
        else:
            print("Element not found")
            sys.exit(1)
    else:
        # 打印所有元素
        print_elements(elements)
        print(f"\nTotal: {len(elements)} interactive elements")
