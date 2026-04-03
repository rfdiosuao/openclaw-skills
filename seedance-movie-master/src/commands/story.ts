/**
 * 命令实现 - 故事规划
 */

import { StoryPlanner } from '../core/StoryPlanner';
import { StoryCommandArgs, StoryPlan } from '../types';

export async function storyCommand(args: StoryCommandArgs): Promise<string> {
  const storyPlan = StoryPlanner.plan(args);

  const markdown = `
# 📖 漫剧故事规划：${storyPlan.title}

## 🎯 核心信息
- **类型**: ${storyPlan.type}
- **风格**: ${storyPlan.style}
- **集数**: ${storyPlan.episodes}集
- **单集时长**: ${storyPlan.durationPerEpisode}分钟

## 📝 故事梗概（Logline）
${storyPlan.logline}

---

## 🏗️ 三幕式结构

### ${storyPlan.structure.act1_setup.title}
${storyPlan.structure.act1_setup.description}

**关键事件：**
${storyPlan.structure.act1_setup.keyEvents.map(e => `- ${e}`).join('\n')}

### ${storyPlan.structure.act2_confrontation.title}
${storyPlan.structure.act2_confrontation.description}

**关键事件：**
${storyPlan.structure.act2_confrontation.keyEvents.map(e => `- ${e}`).join('\n')}

### ${storyPlan.structure.act3_resolution.title}
${storyPlan.structure.act3_resolution.description}

**关键事件：**
${storyPlan.structure.act3_resolution.keyEvents.map(e => `- ${e}`).join('\n')}

---

## 🌍 世界观设定

| 维度 | 设定 |
|------|------|
| **时代** | ${storyPlan.worldBuilding.era} |
| **地点** | ${storyPlan.worldBuilding.location} |
| **科技水平** | ${storyPlan.worldBuilding.technology} |
| **社会结构** | ${storyPlan.worldBuilding.social_structure} |
${storyPlan.worldBuilding.magic_system ? `| **魔法/能力体系** | ${storyPlan.worldBuilding.magic_system} |` : ''}

### 核心规则
${storyPlan.worldBuilding.rules.map(r => `- ${r}`).join('\n')}

---

## 📺 分集规划

| 集数 | 标题 | 核心事件 | 关键转折 |
|------|------|----------|----------|
${storyPlan.episodes_plan.map(ep => `| 第${ep.episode}集 | ${ep.title} | ${ep.coreEvent} | ${ep.keyTwist} |`).join('\n')}

---

## 👥 主要角色

> 使用 \`/seedance-character\` 命令为每个角色创建详细 DNA 档案

${storyPlan.characters.length > 0 
  ? storyPlan.characters.map(c => `- **${c.name}**: ${c.appearance.age}${c.appearance.gender}`).join('\n')
  : '_暂无角色设定，请使用 /seedance-character 创建_'}

---

## 🎬 下一步

1. **创建角色**: \`/seedance-character <角色名> [选项]\`
2. **设计分镜**: \`/seedance-storyboard <剧本/场景>\`
3. **生成提示词**: \`/seedance-prompt <镜头描述>\`
4. **生成视频**: \`/seedance-generate <提示词> [选项]\`

---

*生成时间：${new Date().toLocaleString('zh-CN')}*
`.trim();

  return markdown;
}
