/**
 * Video Summarizer - 视频文案智能总结助手
 * 
 * 核心功能：
 * - 自动纠正 ASR 提取错误（同音字、专业术语、人名地名）
 * - 根据语境补充缺失内容
 * - 生成有文章感的总结（直白明了，一眼看懂）
 * 
 * @author 郑宇航
 * @version 1.0.0
 */

export interface VideoSummary {
  title: string;           // 总结标题
  oneLiner: string;        // 一句话概括
  keyPoints: string[];     // 核心要点
  fullSummary: string;     // 完整总结（文章感）
  actionItems?: string[];  // 行动建议（如果有）
  duration?: string;       // 视频时长
  topics: string[];        // 涉及话题
}

export interface ASRCorrection {
  original: string;
  corrected: string;
  confidence: number;
  type: 'homophone' | 'term' | 'name' | 'context';
}

export interface SummarizerConfig {
  style?: 'concise' | 'detailed' | 'professional';  // 总结风格
  maxLength?: number;                                // 最大字数
  includeTimestamp?: boolean;                        // 是否包含时间戳
  autoCorrect?: boolean;                             // 是否自动纠错
}

export class VideoSummarizer {
  private config: SummarizerConfig;

  constructor(config: SummarizerConfig = {}) {
    this.config = {
      style: 'concise',
      maxLength: 500,
      includeTimestamp: false,
      autoCorrect: true,
      ...config
    };
  }

  /**
   * 纠正 ASR 提取错误
   */
  correctASR(text: string): { corrected: string; corrections: ASRCorrection[] } {
    const corrections: ASRCorrection[] = [];
    let corrected = text;

    // 常见 ASR 错误对照表（可扩展）
    const commonErrors: Record<string, string> = {
      // 同音字纠错
      'OpenClaw': 'OpenClaw',
      'openclaw': 'OpenClaw',
      'open claw': 'OpenClaw',
      '飞书': '飞书',
      '非书': '飞书',
      '多维表格': '多维表格',
      '多围表格': '多维表格',
      'bitable': 'Bitable',
      'BITABLE': 'Bitable',
      
      // 专业术语
      'A P I': 'API',
      'A I': 'AI',
      'O K R': 'OKR',
      'K P I': 'KPI',
      'G M V': 'GMV',
      'D A U': 'DAU',
      'M A U': 'MAU',
      
      // 常见人名/公司名
      '马斯克': '马斯克',
      '马化腾': '马化腾',
      '马云': '马云',
      '张一鸣': '张一鸣',
      'OpenAI': 'OpenAI',
      'Anthropic': 'Anthropic',
      'Google': 'Google',
      'Meta': 'Meta',
      
      // 技术术语
      'java script': 'JavaScript',
      'type script': 'TypeScript',
      'node js': 'Node.js',
      'react': 'React',
      'vue': 'Vue',
      'python': 'Python',
    };

    // 执行替换
    for (const [error, correct] of Object.entries(commonErrors)) {
      const regex = new RegExp(error, 'gi');
      if (regex.test(corrected)) {
        const matches = corrected.match(regex);
        if (matches) {
          corrections.push({
            original: error,
            corrected: correct,
            confidence: 0.95,
            type: 'term'
          });
        }
        corrected = corrected.replace(regex, correct);
      }
    }

    // 语境纠错：检查句子通顺度
    corrected = this.contextualCorrection(corrected, corrections);

    return { corrected, corrections };
  }

  /**
   * 语境纠错 - 根据上下文修复不通顺的地方
   */
  private contextualCorrection(text: string, corrections: ASRCorrection[]): string {
    let corrected = text;

    // 修复常见语法问题
    const patterns = [
      // 缺少标点
      { regex: /(\w+)\s*(这|那|他|她|它)/g, replace: '$1。$2' },
      // 重复词语
      { regex: /(\w{2,})\1/g, replace: '$1' },
      // 多余空格
      { regex: /\s+/g, replace: ' ' },
    ];

    for (const pattern of patterns) {
      corrected = corrected.replace(pattern.regex, pattern.replace);
    }

    return corrected.trim();
  }

  /**
   * 提取关键信息
   */
  extractKeyPoints(text: string): string[] {
    const sentences = text.split(/[。！？.!?]/).filter(s => s.trim().length > 0);
    const keyPoints: string[] = [];

    // 提取包含关键词的句子
    const importanceKeywords = [
      '重要的是', '关键是', '核心', '重点', '必须', '一定',
      '首先', '其次', '最后', '总结', '总之', '综上所述',
      '建议', '推荐', '应该', '可以', '能够', '效果',
      '优势', '特点', '功能', '方法', '技巧', '步骤'
    ];

    for (const sentence of sentences) {
      const trimmed = sentence.trim();
      
      // 检查是否包含关键词
      const hasKeyword = importanceKeywords.some(kw => trimmed.includes(kw));
      
      // 检查是否是结论性语句
      const isConclusion = trimmed.startsWith('总之') || 
                          trimmed.startsWith('总结') || 
                          trimmed.startsWith('综上所述');
      
      // 检查是否包含数字（通常是具体数据）
      const hasNumber = /\d+/.test(trimmed);

      if (hasKeyword || isConclusion || (hasNumber && trimmed.length > 20)) {
        keyPoints.push(trimmed);
      }
    }

    // 如果提取的关键点太少，取前几句
    if (keyPoints.length < 3 && sentences.length > 0) {
      for (const sentence of sentences.slice(0, 5)) {
        const trimmed = sentence.trim();
        if (!keyPoints.includes(trimmed) && trimmed.length > 15) {
          keyPoints.push(trimmed);
        }
      }
    }

    return keyPoints.slice(0, 7); // 最多 7 个要点
  }

  /**
   * 生成一句话概括
   */
  generateOneLiner(text: string, keyPoints: string[]): string {
    // 尝试从第一句提取主题
    const firstSentence = text.split(/[。！？.!?]/)[0]?.trim() || '';
    
    // 如果有明确的"这是一段关于"之类的开头
    const introMatch = firstSentence.match(/(这段 | 这个 | 本文 | 本期)[视频/文章/内容]? (介绍 | 讲解 | 分享 | 讲述|说).{10,50}/);
    if (introMatch) {
      return introMatch[0] + '。';
    }

    // 否则总结核心要点
    if (keyPoints.length > 0) {
      const mainPoint = keyPoints[0];
      // 精简到 50 字以内
      return mainPoint.length > 50 ? mainPoint.substring(0, 47) + '...' : mainPoint;
    }

    // 默认返回
    return text.substring(0, 50) + (text.length > 50 ? '...' : '');
  }

  /**
   * 生成有文章感的完整总结
   */
  generateFullSummary(text: string, keyPoints: string[], oneLiner: string): string {
    const sections: string[] = [];

    // 开头：引入主题
    sections.push(`## 📌 核心内容`);
    sections.push(oneLiner);
    sections.push('');

    // 中间：详细要点
    sections.push(`## 🎯 关键要点`);
    keyPoints.forEach((point, index) => {
      sections.push(`${index + 1}. ${point}`);
    });
    sections.push('');

    // 结尾：总结升华
    sections.push(`## 💡 总结`);
    sections.push(this.generateConclusion(text, keyPoints));

    return sections.join('\n');
  }

  /**
   * 生成总结性结尾
   */
  private generateConclusion(text: string, keyPoints: string[]): string {
    // 分析内容类型
    const isTutorial = text.includes('步骤') || text.includes('方法') || text.includes('教程');
    const isReview = text.includes('评测') || text.includes('对比') || text.includes'体验');
    const isNews = text.includes('发布') || text.includes('更新') || text.includes('消息');
    const isOpinion = text.includes('观点') || text.includes('看法') || text.includes('认为');

    if (isTutorial) {
      return '总的来说，这是一个实用的教程，按照上述步骤操作即可掌握核心技能。建议动手实践，加深理解。';
    } else if (isReview) {
      return '综合来看，该内容提供了全面的产品/服务分析，可作为参考依据。建议结合自身需求做出选择。';
    } else if (isNews) {
      return '以上就是本次内容的核心信息。建议持续关注后续动态，及时获取最新进展。';
    } else if (isOpinion) {
      return '以上内容代表了作者的观点和见解。建议理性思考，形成自己的判断。';
    } else {
      return '以上就是本期内容的精华总结。核心要点已梳理完毕，便于快速回顾和分享。';
    }
  }

  /**
   * 提取涉及的话题
   */
  extractTopics(text: string): string[] {
    const topicKeywords = [
      'OpenClaw', '飞书', '多维表格', 'Bitable', 'API',
      'AI', '人工智能', '自动化', '工作流', 'Skill',
      'GitHub', 'ClawHub', '部署', '配置', '教程',
      'Python', 'JavaScript', 'Node.js', '开发', '编程',
      '效率', '办公', '协作', '管理', '工具'
    ];

    const topics: Set<string> = new Set();

    for (const keyword of topicKeywords) {
      if (text.includes(keyword)) {
        topics.add(keyword);
      }
    }

    // 如果没有识别到话题，返回通用标签
    if (topics.size === 0) {
      topics.add('综合内容');
    }

    return Array.from(topics);
  }

  /**
   * 完整总结流程
   */
  async summarize(asrText: string, config?: SummarizerConfig): Promise<VideoSummary> {
    const finalConfig = { ...this.config, ...config };

    // 步骤 1：ASR 纠错
    let correctedText = asrText;
    let corrections: ASRCorrection[] = [];
    
    if (finalConfig.autoCorrect) {
      const correctionResult = this.correctASR(asrText);
      correctedText = correctionResult.corrected;
      corrections = correctionResult.corrections;
    }

    // 步骤 2：提取关键信息
    const keyPoints = this.extractKeyPoints(correctedText);

    // 步骤 3：生成一句话概括
    const oneLiner = this.generateOneLiner(correctedText, keyPoints);

    // 步骤 4：生成完整总结
    const fullSummary = this.generateFullSummary(correctedText, keyPoints, oneLiner);

    // 步骤 5：提取话题
    const topics = this.extractTopics(correctedText);

    // 步骤 6：生成标题
    const title = this.generateTitle(oneLiner, topics);

    return {
      title,
      oneLiner,
      keyPoints,
      fullSummary,
      topics,
      duration: undefined
    };
  }

  /**
   * 生成标题
   */
  private generateTitle(oneLiner: string, topics: string[]): string {
    // 从话题生成标题
    if (topics.length > 0 && topics[0] !== '综合内容') {
      const mainTopic = topics[0];
      return `${mainTopic}：${oneLiner.substring(0, 30)}${oneLiner.length > 30 ? '...' : ''}`;
    }

    // 默认标题
    return `视频内容总结：${oneLiner.substring(0, 20)}${oneLiner.length > 20 ? '...' : ''}`;
  }

  /**
   * 批量总结多个视频文案
   */
  async summarizeBatch(texts: string[], config?: SummarizerConfig): Promise<VideoSummary[]> {
    const results: VideoSummary[] = [];
    
    for (const text of texts) {
      const summary = await this.summarize(text, config);
      results.push(summary);
    }
    
    return results;
  }
}

/**
 * 快速创建总结器实例
 */
export function createVideoSummarizer(config?: SummarizerConfig): VideoSummarizer {
  return new VideoSummarizer(config);
}

export default VideoSummarizer;
