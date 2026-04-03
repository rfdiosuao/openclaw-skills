/**
 * 角色 DNA 管理器
 * 确保跨镜头角色一致性 100%
 */

import { CharacterDNA, CharacterCommandArgs } from '../types';

export class CharacterDNAManager {
  private dnaLibrary: Map<string, CharacterDNA> = new Map();

  /**
   * 创建角色 DNA 档案
   */
  static create(args: CharacterCommandArgs): CharacterDNA {
    const dna: CharacterDNA = {
      name: args.name,
      appearance: {
        age: args.age || '成年',
        gender: args.gender || '未知',
        height: '标准身材',
        bodyType: '匀称',
        facialFeatures: '精致五官',
        hairstyle: '黑色长发',
        eyeColor: '深棕色',
        skinTone: '自然肤色',
        distinctiveMarks: [],
      },
      costume: {
        main: '现代休闲装',
        accessories: [],
        colorScheme: ['黑色', '灰色'],
        style: '现代',
      },
      personality: args.personality || ['坚强', '独立'],
      abilities: args.abilities || [],
      backstory: args.backstory || '',
      characterArc: '成长与蜕变',
      signatureMoves: [],
      referencePrompts: [],
      dnaKeywords: [],
    };

    // 生成参考图提示词
    dna.referencePrompts = this.generateReferencePrompts(dna);
    
    // 生成 DNA 锁定关键词
    dna.dnaKeywords = this.generateDNAKeywords(dna);

    return dna;
  }

  /**
   * 生成角色参考图提示词（用于视觉一致性）
   */
  private static generateReferencePrompts(dna: CharacterDNA): string[] {
    const { appearance, costume } = dna;
    
    return [
      // 正面全身像
      `正面全身像，${appearance.age}${appearance.gender}，${appearance.height}，${appearance.bodyType}，${appearance.hairstyle}，${appearance.eyeColor}眼睛，${costume.main}，${costume.colorScheme.join('色调')}，白色背景，角色设计图，三视图`,
      
      // 侧面像
      `侧面全身像，${appearance.age}${appearance.gender}，${appearance.hairstyle}，${costume.main}，白色背景，角色设计图`,
      
      // 面部特写
      `面部特写，${appearance.facialFeatures}，${appearance.eyeColor}眼睛，${appearance.skinTone}皮肤，${appearance.hairstyle}，高清细节，角色设定`,
      
      // 表情集
      `表情集，${dna.name}，高兴/生气/悲伤/惊讶四种表情，${appearance.facialFeatures}，角色设定图`,
      
      // 标志性动作
      dna.signatureMoves.length > 0 
        ? `标志性动作，${dna.name}，${dna.signatureMoves.join('，')}，动态姿势，角色设定`
        : '',
    ].filter(Boolean);
  }

  /**
   * 生成 DNA 锁定关键词（用于@标签引用）
   */
  private static generateDNAKeywords(dna: CharacterDNA): string[] {
    const keywords: string[] = [];
    
    // 外貌关键词
    keywords.push(
      `${dna.appearance.age}${dna.appearance.gender}`,
      dna.appearance.hairstyle,
      dna.appearance.eyeColor + '眼睛',
      dna.appearance.skinTone + '皮肤'
    );
    
    // 服装关键词
    keywords.push(dna.costume.main);
    keywords.push(...dna.costume.colorScheme.map(c => c + '色调'));
    
    // 特征关键词
    if (dna.appearance.distinctiveMarks.length > 0) {
      keywords.push(...dna.appearance.distinctiveMarks);
    }
    
    // 标志性元素
    keywords.push(...dna.signatureMoves);

    return keywords;
  }

  /**
   * 注册角色 DNA
   */
  register(dna: CharacterDNA): void {
    this.dnaLibrary.set(dna.name.toLowerCase(), dna);
  }

  /**
   * 获取角色 DNA
   */
  get(name: string): CharacterDNA | undefined {
    return this.dnaLibrary.get(name.toLowerCase());
  }

  /**
   * 获取所有角色
   */
  getAll(): CharacterDNA[] {
    return Array.from(this.dnaLibrary.values());
  }

  /**
   * 为镜头生成角色一致性提示词
   */
  generateConsistencyPrompt(characterNames: string[]): string {
    const characters = characterNames
      .map(name => this.get(name))
      .filter(Boolean) as CharacterDNA[];

    if (characters.length === 0) {
      return '';
    }

    const consistencyKeywords = characters.flatMap(c => c.dnaKeywords);
    return `角色一致性锁定：${consistencyKeywords.join(', ')}`;
  }

  /**
   * 导出角色设定文档
   */
  exportToMarkdown(dna: CharacterDNA): string {
    return `
# 角色设定：${dna.name}

## 外貌特征
- **年龄**: ${dna.appearance.age}
- **性别**: ${dna.appearance.gender}
- **身高**: ${dna.appearance.height}
- **体型**: ${dna.appearance.bodyType}
- **面部**: ${dna.appearance.facialFeatures}
- **发型**: ${dna.appearance.hairstyle}
- **眼睛**: ${dna.appearance.eyeColor}
- **肤色**: ${dna.appearance.skinTone}
${dna.appearance.distinctiveMarks.length > 0 ? `- **特征**: ${dna.appearance.distinctiveMarks.join(', ')}` : ''}

## 服装造型
- **主服装**: ${dna.costume.main}
- **配饰**: ${dna.costume.accessories.join(', ') || '无'}
- **配色**: ${dna.costume.colorScheme.join(', ')}
- **风格**: ${dna.costume.style}

## 性格特点
${dna.personality.map(p => `- ${p}`).join('\n')}

## 能力/技能
${dna.abilities.length > 0 ? dna.abilities.map(a => `- ${a}`).join('\n') : '- 暂无特殊能力'}

## 背景故事
${dna.backstory || '暂无背景故事'}

## 角色弧光
${dna.characterArc}

## 标志性动作
${dna.signatureMoves.length > 0 ? dna.signatureMoves.map(m => `- ${m}`).join('\n') : '- 暂无'}

## DNA 锁定关键词
${dna.dnaKeywords.map(k => `- \`${k}\``).join('\n')}

## 参考图提示词
${dna.referencePrompts.map((p, i) => `### 参考图 ${i + 1}\n\`\`\`\n${p}\n\`\`\``).join('\n\n')}
`.trim();
  }
}
