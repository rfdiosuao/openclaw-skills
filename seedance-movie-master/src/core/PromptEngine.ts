/**
 * 6 阶权重提示词引擎
 * 严格遵循 Seedance 2.0 模型优先级
 */

import { SixStagePrompt, WeightedPrompt, Shot } from '../types';

export class PromptEngine {
  /**
   * 权重配置（根据 Seedance 2.0 模型优化）
   */
  private static readonly WEIGHTS = {
    stage1: 1.5, // 主体
    stage2: 1.3, // 动作
    stage3: 1.2, // 场景
    stage4: 1.1, // 镜头
    stage5: 1.0, // 光影
    stage6: 0.9, // 风格
  };

  /**
   * 将自然语言描述转换为 6 阶结构提示词
   */
  static parseToSixStage(description: string): SixStagePrompt {
    // 智能解析逻辑（简化版，实际可用 AI 辅助）
    const keywords = {
      subject: ['角色', '人物', '物体', '主角', '剑客', '少女', '机器人'],
      action: ['走', '跑', '跳', '打', '看', '听', '拔剑', '攻击', '防御'],
      scene: ['在', '背景', '环境', '城市', '森林', '房间', '街道'],
      camera: ['镜头', '视角', '俯视', '仰视', '特写', '全景', '推', '拉'],
      lighting: ['光', '影', '明亮', '黑暗', '霓虹', '阳光', '月光'],
      style: ['风格', '赛博朋克', '国漫', '日系', '写实', '电影感'],
    };

    return {
      subject: this.extractKeywords(description, keywords.subject).join(', ') || '主角',
      action: this.extractKeywords(description, keywords.action).join(', ') || '站立',
      scene: this.extractKeywords(description, keywords.scene).join(', ') || '现代城市背景',
      camera: this.extractKeywords(description, keywords.camera).join(', ') || '中景，平视',
      lighting: this.extractKeywords(description, keywords.lighting).join(', ') || '自然光',
      style: this.extractKeywords(description, keywords.style).join(', ') || '电影级质感',
    };
  }

  /**
   * 将 6 阶结构转换为加权提示词字符串
   */
  static toWeightedString(prompt: SixStagePrompt): string {
    const stages: WeightedPrompt[] = [
      { text: prompt.subject, weight: PromptEngine.WEIGHTS.stage1, stage: 1 },
      { text: prompt.action, weight: PromptEngine.WEIGHTS.stage2, stage: 2 },
      { text: prompt.scene, weight: PromptEngine.WEIGHTS.stage3, stage: 3 },
      { text: prompt.camera, weight: PromptEngine.WEIGHTS.stage4, stage: 4 },
      { text: prompt.lighting, weight: PromptEngine.WEIGHTS.stage5, stage: 5 },
      { text: prompt.style, weight: PromptEngine.WEIGHTS.stage6, stage: 6 },
    ];

    // 构建带权重的提示词（使用 Seedance 2.0 支持的格式）
    return stages
      .map(s => {
        if (s.weight > 1.0) {
          return `(${s.text}:${s.weight.toFixed(1)})`;
        } else if (s.weight < 1.0) {
          return `(${s.text}:${s.weight.toFixed(1)})`;
        }
        return s.text;
      })
      .join(', ');
  }

  /**
   * 为分镜镜头生成完整提示词
   */
  static generateForShot(shot: Shot, characterDNA?: string[]): string {
    const basePrompt = shot.prompt;
    
    // 添加角色 DNA 锁定关键词
    const dnaKeywords = characterDNA ? characterDNA.join(', ') : '';
    
    // 添加时间线信息
    const timelineInfo = `${shot.duration.toFixed(1)}秒镜头`;
    
    // 构建完整提示词
    const enhancedPrompt: SixStagePrompt = {
      subject: dnaKeywords ? `${basePrompt.subject}, ${dnaKeywords}` : basePrompt.subject,
      action: basePrompt.action,
      scene: basePrompt.scene,
      camera: `${basePrompt.camera}, ${shot.type}镜头，${shot.angle}角度，${shot.movement}运镜`,
      lighting: basePrompt.lighting,
      style: `${basePrompt.style}, ${timelineInfo}`,
    };

    return PromptEngine.toWeightedString(enhancedPrompt);
  }

  /**
   * 生成@标签引用格式
   */
  static generateReferenceTags(references: {
    images?: string[];
    video?: string;
    audio?: string;
  }): string {
    const tags: string[] = [];
    
    if (references.images) {
      references.images.forEach((url, idx) => {
        tags.push(`@image_${idx + 1}`);
      });
    }
    
    if (references.video) {
      tags.push('@video_ref');
    }
    
    if (references.audio) {
      tags.push('@audio_ref');
    }
    
    return tags.join(' ');
  }

  /**
   * 优化提示词（去除冲突，增强一致性）
   */
  static optimize(prompt: SixStagePrompt): SixStagePrompt {
    // 去除内部冲突
    const optimized = { ...prompt };
    
    // 确保主体和动作一致
    if (optimized.subject.includes('静止') && optimized.action.includes('奔跑')) {
      optimized.subject = optimized.subject.replace('静止', '');
    }
    
    // 确保场景和光影一致
    if (optimized.scene.includes('室内') && optimized.lighting.includes('阳光')) {
      optimized.lighting = optimized.lighting.replace('阳光', '室内灯光');
    }
    
    return optimized;
  }

  /**
   * 批量生成镜头提示词
   */
  static generateBatch(shots: Shot[], characterDNA?: string[]): string[] {
    return shots.map(shot => this.generateForShot(shot, characterDNA));
  }

  /**
   * 提取关键词（辅助方法）
   */
  private static extractKeywords(text: string, keywordList: string[]): string[] {
    const found: string[] = [];
    for (const keyword of keywordList) {
      if (text.includes(keyword)) {
        found.push(keyword);
      }
    }
    return found;
  }

  /**
   * 验证提示词是否符合 Seedance 2.0 要求
   */
  static validate(prompt: SixStagePrompt): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!prompt.subject || prompt.subject.trim().length === 0) {
      errors.push('缺少主体描述（Stage 1）');
    }
    
    if (!prompt.action || prompt.action.trim().length === 0) {
      errors.push('缺少动作描述（Stage 2）');
    }
    
    if (prompt.subject.length > 200) {
      errors.push('主体描述过长（最大 200 字符）');
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
