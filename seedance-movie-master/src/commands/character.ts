/**
 * 命令实现 - 角色设定
 */

import { CharacterDNAManager } from '../core/CharacterDNAManager';
import { CharacterCommandArgs, CharacterDNA } from '../types';

export async function characterCommand(args: CharacterCommandArgs): Promise<string> {
  const dna = CharacterDNAManager.create(args);

  const markdown = `
# 👤 角色 DNA 档案：${dna.name}

## 🎨 外貌特征

| 维度 | 设定 |
|------|------|
| **年龄** | ${dna.appearance.age} |
| **性别** | ${dna.appearance.gender} |
| **身高** | ${dna.appearance.height} |
| **体型** | ${dna.appearance.bodyType} |
| **面部** | ${dna.appearance.facialFeatures} |
| **发型** | ${dna.appearance.hairstyle} |
| **眼睛** | ${dna.appearance.eyeColor} |
| **肤色** | ${dna.appearance.skinTone} |
${dna.appearance.distinctiveMarks.length > 0 ? `| **特征标记** | ${dna.appearance.distinctiveMarks.join(', ')} |` : ''}

---

## 👔 服装造型

- **主服装**: ${dna.costume.main}
- **配饰**: ${dna.costume.accessories.join(', ') || '无'}
- **配色方案**: ${dna.costume.colorScheme.join(' → ')}
- **风格**: ${dna.costume.style}

---

## 💭 性格特点

${dna.personality.map(p => `- ${p}`).join('\n')}

---

## ⚡ 能力/技能

${dna.abilities.length > 0 ? dna.abilities.map(a => `- ${a}`).join('\n') : '- 暂无特殊能力'}

---

## 📖 背景故事

${dna.backstory || '_暂无背景故事_'}

---

## 📈 角色弧光

${dna.characterArc}

---

## 🎯 标志性动作/表情

${dna.signatureMoves.length > 0 ? dna.signatureMoves.map(m => `- ${m}`).join('\n') : '- 暂无'}

---

## 🔐 DNA 锁定关键词

> 在提示词中使用这些关键词确保角色一致性

\`\`\`
${dna.dnaKeywords.join(', ')}
\`\`\`

---

## 🖼️ 参考图生成提示词

### 正面全身像（三视图）
\`\`\`
${dna.referencePrompts[0]}
\`\`\`

### 侧面像
\`\`\`
${dna.referencePrompts[1]}
\`\`\`

### 面部特写
\`\`\`
${dna.referencePrompts[2]}
\`\`\`

${dna.referencePrompts[3] ? `
### 表情集
\`\`\`
${dna.referencePrompts[3]}
\`\`\`
` : ''}

---

## 🎬 使用示例

### 在视频生成中引用
\`\`\`bash
/seedance-generate "${dna.name}拔剑出鞘，剑光如虹" \\
  --character-dna "${dna.dnaKeywords.join(', ')}" \\
  --ratio 16:9 \\
  --duration 5
\`\`\`

### 在分镜中使用
\`\`\`bash
/seedance-storyboard "${dna.name}在雨中对决黑衣剑客" \\
  --style 国漫武侠
\`\`\`

---

## 📋 导出选项

- **Markdown**: 当前文档可直接保存
- **JSON**: \`/seedance-character ${dna.name} --export json\`
- **图片提示词**: 复制上方参考图提示词到 AI 绘图工具

---

*创建时间：${new Date().toLocaleString('zh-CN')}*
*角色 ID: \`${dna.name.toLowerCase().replace(/\s+/g, '_')}\`*
`.trim();

  return markdown;
}
