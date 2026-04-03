/**
 * 命令实现 - 完整项目一键生成
 */

import { StoryPlanner } from '../core/StoryPlanner';
import { CharacterDNAManager } from '../core/CharacterDNAManager';
import { PromptEngine } from '../core/PromptEngine';
import { ProjectCommandArgs, ProjectPlan, CharacterDNA } from '../types';

export async function projectCommand(args: ProjectCommandArgs): Promise<string> {
  // 1. 故事规划
  const story = StoryPlanner.plan({
    theme: args.concept,
    type: args.type,
    style: args.style,
    episodes: args.episodes,
    duration: args.duration,
  });

  // 2. 创建主角 DNA（示例）
  const mainCharacter: CharacterDNA = CharacterDNAManager.create({
    name: '主角',
    age: '成年',
    role: '主人公',
    personality: ['坚强', '勇敢', '正义'],
    backstory: `在${story.worldBuilding.era}的${story.worldBuilding.location}中成长`,
  });

  // 3. 生成分镜示例（第一集第一场）
  const sampleStoryboard = `
## 🎬 分镜示例：第 1 集 - 开场

| 镜头 | 类型 | 时长 | 描述 |
|------|------|------|------|
| 1 | 远景 | 3s | ${story.worldBuilding.location}全景，建立世界观 |
| 2 | 中景 | 2s | 主角登场，展示外貌特征 |
| 3 | 特写 | 2s | 主角面部表情，内心戏 |
| 4 | 全景 | 3s | 触发事件发生 |
`;

  // 4. 生成提示词示例
  const samplePrompt = PromptEngine.parseToSixStage(
    `${mainCharacter.name}在${story.worldBuilding.location}中登场，${args.style || '电影级'}风格`
  );

  const markdown = `
# 🎬 完整项目方案：${story.title}

> **概念**: ${args.concept}  
> **类型**: ${story.type} | **风格**: ${story.style}  
> **规模**: ${story.episodes}集 × ${story.durationPerEpisode}分钟

---

## 📖 故事概览

${story.logline}

---

## 👥 主角设定

${CharacterDNAManager.exportToMarkdown(mainCharacter)}

---

## 🎬 分镜示例

${sampleStoryboard}

---

## ✨ 提示词示例

### 6 阶结构
| 阶数 | 内容 |
|------|------|
| 主体 | ${samplePrompt.subject} |
| 动作 | ${samplePrompt.action} |
| 场景 | ${samplePrompt.scene} |
| 镜头 | ${samplePrompt.camera} |
| 光影 | ${samplePrompt.lighting} |
| 风格 | ${samplePrompt.style} |

### 加权提示词
\`\`\`
${PromptEngine.toWeightedString(samplePrompt)}
\`\`\`

---

## 📺 分集规划

| 集数 | 标题 | 核心事件 |
|------|------|----------|
${story.episodes_plan.map(ep => `| 第${ep.episode}集 | ${ep.title} | ${ep.coreEvent} |`).join('\n')}

---

## 🎯 制作流程

### 阶段 1: 前期准备
- [ ] 完成所有角色 DNA 设定
- [ ] 绘制关键场景概念图
- [ ] 编写完整剧本

### 阶段 2: 分镜设计
- [ ] 为每集创建详细分镜
- [ ] 生成每个镜头的 6 阶提示词
- [ ] 准备参考素材（图片/视频/音频）

### 阶段 3: 视频生成
- [ ] 批量生成镜头视频
- [ ] 检查角色一致性
- [ ] 调整不满意镜头

### 阶段 4: 后期合成
- [ ] 视频剪辑拼接
- [ ] 音画同步调整
- [ ] 添加特效/字幕

---

## 📊 资源估算

| 项目 | 数量 | 说明 |
|------|------|------|
| 总镜头数 | ~${story.episodes * 20}个 | 每集约 20 个镜头 |
| 视频生成次数 | ~${story.episodes * 20}次 | 单镜头生成 |
| 预计时长 | ~${story.episodes * story.durationPerEpisode}分钟 | 成片总时长 |
| 参考素材 | ~${story.episodes * 5}个 | 图片 + 视频 + 音频 |

---

## 🚀 快速开始命令

\`\`\`bash
# 1. 创建更多角色
/seedance-character "反派" --age 中年 --personality "阴险，狡猾"

# 2. 设计分镜
/seedance-storyboard "第 1 集开场：${story.worldBuilding.location}全景"

# 3. 生成提示词
/seedance-prompt "主角在雨中拔剑，赛博朋克霓虹灯光"

# 4. 生成视频
/seedance-generate "<提示词>" --ratio 16:9 --duration 8
\`\`\`

---

## 📁 交付清单

### 视频文件
- [ ] 第 1 集正片
- [ ] 第 2 集正片
${story.episodes > 2 ? `- [ ] ... 第${story.episodes}集正片` : ''}

### 音频文件
- [ ] 原声配乐
- [ ] 音效库
- [ ] 角色台词集

### 文档
- [x] 故事规划文档
- [x] 角色设定集
- [ ] 分镜脚本
- [ ] 制作报告

---

*方案生成时间：${new Date().toLocaleString('zh-CN')}*
*项目 ID: \`${story.title.toLowerCase().replace(/\s+/g, '_').substring(0, 30)}\`*
`.trim();

  return markdown;
}
