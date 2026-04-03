/**
 * Seedance 2.0 视频生成器
 * 核心 API 封装，支持多模态输入和任务轮询
 */

import fetch from 'node-fetch';
import {
  SeedanceConfig,
  GenerateOptions,
  GenerationTask,
  GenerationMetadata,
  SixStagePrompt,
  TimelineSegment,
} from '../types';
import { PromptEngine } from './PromptEngine';

export class SeedanceVideoGenerator {
  private apiKey: string;
  private baseUrl: string;
  private defaultRatio: string;
  private defaultDuration: number;

  constructor(config: SeedanceConfig) {
    if (!config.apiKey) {
      throw new Error('缺少火山引擎 Ark API Key，请配置 VOLCENGINE_ARK_API_KEY 环境变量');
    }
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://ark.cn-beijing.volces.com/api/v3';
    this.defaultRatio = config.defaultRatio || '16:9';
    this.defaultDuration = config.defaultDuration || 8;
  }

  /**
   * 生成视频（支持 6 阶提示词和多模态输入）
   */
  async generate(options: GenerateOptions): Promise<GenerationTask> {
    this.validateOptions(options);

    // 构建提示词
    const prompt = this.buildPrompt(options);

    // 构建请求内容（多模态）
    const content = this.buildContent(options, prompt);

    // 构建请求体
    const requestBody = {
      model: 'doubao-seedance-2-0-260128',
      content: content,
      generate_audio: options.generateAudio ?? true,
      ratio: options.ratio || this.defaultRatio,
      duration: options.duration || this.defaultDuration,
      watermark: options.watermark ?? false,
    };

    try {
      const response = await fetch(`${this.baseUrl}/contents/generations/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API 请求失败：${response.status} ${errorData.message || response.statusText}`);
      }

      const result = await response.json();

      return {
        taskId: result.id || result.task_id,
        status: 'pending',
      };
    } catch (error) {
      throw new Error(`视频生成失败：${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 查询任务状态
   */
  async getTaskStatus(taskId: string): Promise<GenerationTask> {
    try {
      const response = await fetch(`${this.baseUrl}/contents/generations/tasks/${taskId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`查询任务失败：${response.status} ${errorData.message || response.statusText}`);
      }

      const result = await response.json();

      return {
        taskId,
        status: this.mapStatus(result.status),
        videoUrl: result.video_url,
        audioUrl: result.audio_url,
        thumbnailUrl: result.thumbnail_url,
        error: result.error?.message,
        metadata: result.metadata ? this.parseMetadata(result.metadata) : undefined,
      };
    } catch (error) {
      throw new Error(`查询任务状态失败：${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 轮询任务直到完成
   */
  async pollTask(
    taskId: string,
    options: { intervalMs?: number; timeoutMs?: number; onProgress?: (status: string) => void } = {}
  ): Promise<GenerationTask> {
    const { intervalMs = 3000, timeoutMs = 300000, onProgress } = options;
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      const status = await this.getTaskStatus(taskId);

      if (onProgress) {
        onProgress(status.status);
      }

      if (status.status === 'completed' || status.status === 'failed') {
        return status;
      }

      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }

    throw new Error(`任务超时：${taskId} 在 ${timeoutMs}ms 内未完成`);
  }

  /**
   * 批量生成（用于分镜多镜头）
   */
  async generateBatch(
    optionsArray: GenerateOptions[],
    concurrency: number = 1
  ): Promise<GenerationTask[]> {
    const results: GenerationTask[] = [];

    // 简单串行实现（避免 API 限流）
    for (const options of optionsArray) {
      const task = await this.generate(options);
      results.push(task);
    }

    return results;
  }

  /**
   * 验证生成选项
   */
  private validateOptions(options: GenerateOptions): void {
    if (!options.prompt) {
      throw new Error('提示词不能为空');
    }

    const validRatios = ['16:9', '9:16', '1:1', '4:3', '3:4'];
    if (options.ratio && !validRatios.includes(options.ratio)) {
      throw new Error(`无效的视频比例：${options.ratio}，支持：${validRatios.join(', ')}`);
    }

    const duration = options.duration || this.defaultDuration;
    if (duration < 5 || duration > 30) {
      throw new Error(`视频时长必须在 5-30 秒之间，当前：${duration}`);
    }

    if (options.referenceImages && options.referenceImages.length > 9) {
      throw new Error('参考图片最多支持 9 张');
    }
  }

  /**
   * 构建提示词（支持 6 阶结构）
   */
  private buildPrompt(options: GenerateOptions): string {
    if (typeof options.prompt === 'string') {
      return options.prompt;
    }

    // 6 阶结构提示词
    return PromptEngine.toWeightedString(options.prompt);
  }

  /**
   * 构建多模态内容
   */
  private buildContent(options: GenerateOptions, prompt: string): any[] {
    const content: any[] = [];

    // 添加文本提示词
    content.push({
      type: 'text',
      text: prompt,
    });

    // 添加参考图片（带@标签）
    if (options.referenceImages) {
      options.referenceImages.forEach((url, idx) => {
        content.push({
          type: 'image_url',
          image_url: { url },
          role: 'reference_image',
        });
      });
    }

    // 添加参考视频
    if (options.referenceVideo) {
      content.push({
        type: 'video_url',
        video_url: { url: options.referenceVideo },
        role: 'reference_video',
      });
    }

    // 添加参考音频
    if (options.referenceAudio) {
      content.push({
        type: 'audio_url',
        audio_url: { url: options.referenceAudio },
        role: 'reference_audio',
      });
    }

    return content;
  }

  /**
   * 映射任务状态
   */
  private mapStatus(apiStatus: string): GenerationTask['status'] {
    const statusMap: Record<string, GenerationTask['status']> = {
      'pending': 'pending',
      'processing': 'processing',
      'completed': 'completed',
      'succeeded': 'completed',
      'failed': 'failed',
      'cancelled': 'failed',
    };
    return statusMap[apiStatus] || 'pending';
  }

  /**
   * 解析元数据
   */
  private parseMetadata(data: any): GenerationMetadata {
    return {
      model: data.model || 'doubao-seedance-2-0-260128',
      ratio: data.ratio || '16:9',
      duration: data.duration || 8,
      resolution: data.resolution || '3840x2160',
      fps: data.fps || 60,
      createdAt: data.created_at || new Date().toISOString(),
      processingTime: data.processing_time || 0,
    };
  }
}

// 导出工厂函数
export function createSeedanceGenerator(config: SeedanceConfig): SeedanceVideoGenerator {
  return new SeedanceVideoGenerator(config);
}

export default SeedanceVideoGenerator;
