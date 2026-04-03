/**
 * 命令实现 - 提示词生成（6 阶权重结构）
 */

import { PromptEngine } from '../core/PromptEngine';
import { PromptCommandArgs } from '../types';

export async function promptCommand(args: PromptCommandArgs): Promise<string> {
  // 解析为 6 阶结构
  const sixStage = PromptEngine.parseToSixStage(args.description);

  // 应用镜头类型、角度、运镜
  if (args.shotType) {
    sixStage.camera = `${args.shotType}镜头，${sixStage.camera}`;
  }
  if (args.cameraAngle) {
    sixStage.camera = `${sixStage.camera}，${args.cameraAngle}角度`;
  }
  if (args.cameraMovement) {
    sixStage.camera = `${sixStage.camera}，${args.cameraMovement}运镜`;
  }

  // 优化提示词
  const optimized = PromptEngine.optimize(sixStage);

  // 生成加权字符串
  const weightedPrompt = PromptEngine.toWeightedString(optimized);

  // 验证
  const validation = PromptEngine.validate(optimized);

  const markdown = `
# 🎬 6 阶权重提示词

## 📝 原始描述
\`\`\`
${args.description}
\`\`\`

---

## 🏗️ 6 阶结构分解

| 阶数 | 维度 | 权重 | 内容 |
|------|------|------|------|
| Stage 1 | **主体** | 1.5 | ${optimized.subject} |
| Stage 2 | **动作** | 1.3 | ${optimized.action} |
| Stage 3 | **场景** | 1.2 | ${optimized.scene} |
| Stage 4 | **镜头** | 1.1 | ${optimized.camera} |
| Stage 5 | **光影** | 1.0 | ${optimized.lighting} |
| Stage 6 | **风格** | 0.9 | ${optimized.style} |

---

## ✨ 加权提示词（Seedance 2.0 格式）

\`\`\`
${weightedPrompt}
\`\`\`

---

## 📋 使用方式

### 方式 1：直接复制
\`\`\`
${weightedPrompt}
\`\`\`

### 方式 2：在生成命令中使用
\`\`\`bash
/seedance-generate "${weightedPrompt}" \\
  --ratio 16:9 \\
  --duration 8
\`\`\`

### 方式 3：作为分镜镜头
\`\`\`bash
/seedance-storyboard "场景描述" \\
  --prompt "${weightedPrompt}"
\`\`\`

---

${validation.valid ? '✅ **验证通过**: 提示词符合 Seedance 2.0 要求' : `⚠️ **验证警告**:\n${validation.errors.map(e => `- ${e}`).join('\n')}`}

---

## 💡 优化建议

${getOptimizationTips(optimized)}

---

*生成时间：${new Date().toLocaleString('zh-CN')}*
`.trim();

  return markdown;
}

/**
 * 获取优化建议
 */
function getOptimizationTips(prompt: any): string {
  const tips: string[] = [];

  if (prompt.subject.length < 10) {
    tips.push('- 主体描述可以更详细，增加视觉特征');
  }
  if (!prompt.action.includes('动态')) {
    tips.push('- 可以添加更多动态动词增强画面感');
  }
  if (!prompt.lighting.includes('光') && !prompt.lighting.includes('影')) {
    tips.push('- 建议添加光影描述提升电影感');
  }
  if (prompt.style.length < 5) {
    tips.push('- 风格描述可以更具体，如"赛博朋克国漫风格"');
  }

  return tips.length > 0 ? tips.join('\n') : '- 提示词质量优秀，无需优化';
}
