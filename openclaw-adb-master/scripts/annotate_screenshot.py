#!/usr/bin/env python3
"""
OpenClaw ADB Master - 标注截图生成器
为视觉模型生成带元素编号和边界框的标注截图
"""

import sys
import xml.etree.ElementTree as ET
from PIL import Image, ImageDraw, ImageFont
import os

def parse_ui_tree(xml_file):
    """解析 UI 树"""
    tree = ET.parse(xml_file)
    root = tree.getroot()
    
    elements = []
    index = 0
    
    def traverse(node):
        nonlocal index
        
        text = node.get('text', '')
        content_desc = node.get('content-desc', '')
        resource_id = node.get('resource-id', '')
        bounds = node.get('bounds', '')
        clickable = node.get('clickable', 'false')
        
        if clickable == 'true' or text or content_desc:
            if bounds:
                try:
                    coords = bounds.strip('[]').split('][')
                    x1, y1 = map(int, coords[0].split(','))
                    x2, y2 = map(int, coords[1].split(','))
                    
                    elements.append({
                        'index': index,
                        'text': text or content_desc or resource_id,
                        'bounds': (x1, y1, x2, y2),
                        'center': ((x1 + x2) // 2, (y1 + y2) // 2)
                    })
                    index += 1
                except:
                    pass
        
        for child in node:
            traverse(child)
    
    traverse(root)
    return elements

def annotate_screenshot(screenshot_path, ui_path, output_path):
    """生成标注截图"""
    # 加载截图
    img = Image.open(screenshot_path)
    draw = ImageDraw.Draw(img)
    
    # 加载字体（尝试系统字体）
    font_size = max(16, min(img.size[0], img.size[1]) // 40)
    font = None
    
    # 尝试常见字体路径
    font_paths = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
        "C:\\Windows\\Fonts\\arial.ttf",
        "/usr/share/fonts/TTF/DejaVuSans-Bold.ttf"
    ]
    
    for font_path in font_paths:
        if os.path.exists(font_path):
            try:
                font = ImageFont.truetype(font_path, font_size)
                break
            except:
                pass
    
    if font is None:
        font = ImageFont.load_default()
    
    # 解析 UI 树
    elements = parse_ui_tree(ui_path)
    
    # 绘制标注
    for elem in elements:
        x1, y1, x2, y2 = elem['bounds']
        index = elem['index']
        
        # 绘制边界框（红色）
        draw.rectangle([x1, y1, x2, y2], outline='red', width=2)
        
        # 绘制元素编号（白色背景 + 黑色文字）
        text = str(index)
        
        # 计算文字大小
        try:
            bbox = draw.textbbox((0, 0), text, font=font)
            text_width = bbox[2] - bbox[0]
            text_height = bbox[3] - bbox[1]
        except:
            text_width = font_size
            text_height = font_size
        
        # 绘制背景
        padding = 2
        label_x1 = x1
        label_y1 = y1 - text_height - padding * 2
        label_x2 = x1 + text_width + padding * 2
        label_y2 = y1
        
        # 确保标签在图片内
        if label_y1 < 0:
            label_y1 = y1
            label_y2 = y1 + text_height + padding * 2
        
        draw.rectangle([label_x1, label_y1, label_x2, label_y2], fill='white')
        
        # 绘制文字
        text_x = label_x1 + padding
        text_y = label_y1 + padding
        draw.text((text_x, text_y), text, fill='black', font=font)
    
    # 保存结果
    img.save(output_path)
    print(f"Annotated screenshot saved to: {output_path}")
    print(f"Total elements annotated: {len(elements)}")

if __name__ == '__main__':
    if len(sys.argv) < 4:
        print("Usage: annotate_screenshot.py <screenshot.png> <ui.xml> <output.png>")
        sys.exit(1)
    
    screenshot_path = sys.argv[1]
    ui_path = sys.argv[2]
    output_path = sys.argv[3]
    
    if not os.path.exists(screenshot_path):
        print(f"Error: Screenshot not found: {screenshot_path}")
        sys.exit(1)
    
    if not os.path.exists(ui_path):
        print(f"Error: UI file not found: {ui_path}")
        sys.exit(1)
    
    annotate_screenshot(screenshot_path, ui_path, output_path)
