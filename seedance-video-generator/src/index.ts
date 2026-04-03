/**
 * Seedance 2.0 视频生成工具
 * 基于火山引擎 Doubao Seedance 2.0 模型的多模态视频生成
 */

import fetch from 'node-fetch';

// 类型定义
interface SeedanceConfig {
  apiKey: string;
  baseUrl?: string;
}

interface ReferenceImage {
  type: 'image_url';
  image_url: { url: string };
  role: 'reference_image';
}

interface ReferenceVideo {
  type: 'video_url';
  video_url: { url: string };
  role: 'reference_video';
}

interface ReferenceAudio {
  type: 'audio_url';
  audio_url: { url: string };
  role: 'reference_audio';
}

interface TextContent {
  type: 'text';
  text: string;
}

interface GenerateOptions {
  prompt: string;
  referenceImages?: string[];
  referenceVideo?: string;
  referenceAudio?: string;
  ratio?: '16:9' | '9:16' | '1:1' | '4:3' | '3:4';
  duration?: number;
  generateAudio?: boolean;
  watermark?: boolean;
}

interface GenerationTask {
  taskId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  videoUrl?: string;
  audioUrl?: string;
  error?: string;
}

// 验证比例
const VALID_RATIOS = ['16:9', '9:16', '1:1', '4:3', '3:4'] as const;

// 验证时长
const MIN_DURATION = 5;
const MAX_DURATION = 30;

export class SeedanceVideoGenerator {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: SeedanceConfig) {
    if (!config.apiKey) {
      throw new Error('缺少火山引擎 Ark API Key，请配置 VOLCENGINE_ARK_API_KEY 环境变量');
    }
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://ark.cn-beijing.volces.com/api/v3';
  }

  /**
   * 生成视频
   */
  async generate(options: GenerateOptions): Promise<GenerationTask> {
    // 参数验证
    this.validateOptions(options);

    // 构建请求内容
    const content = this.buildContent(options);

    // 构建请求体
    const requestBody = {
      model: 'doubao-seedance-2-0-260128',
      content: content,
      generate_audio: options.generateAudio ?? true,
      ratio: options.ratio || '16:9',
      duration: options.duration || 10,
      watermark: options.watermark ?? false,
    };

    try {
      // 提交生成任务
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
        error: result.error?.message,
      };
    } catch (error) {
      throw new Error(`查询任务状态失败：${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 轮询任务直到完成
   */
  async pollTask(taskId: string, intervalMs: number = 3000, timeoutMs: number = 300000): Promise<GenerationTask> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeoutMs) {
      const status = await this.getTaskStatus(taskId);
      
      if (status.status === 'completed' || status.status === 'failed') {
        return status;
      }
      
      // 等待下次轮询
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
    
    throw new Error(`任务超时：${taskId} 在 ${timeoutMs}ms 内未完成`);
  }

  /**
   * 验证生成选项
   */
  private validateOptions(options: GenerateOptions): void {
    if (!options.prompt || options.prompt.trim().length === 0) {
      throw new Error('提示词不能为空');
    }

    if (options.ratio && !VALID_RATIOS.includes(options.ratio)) {
      throw new Error(`无效的视频比例：${options.ratio}，支持：${VALID_RATIOS.join(', ')}`);
    }

    if (options.duration !== undefined) {
      if (options.duration < MIN_DURATION || options.duration > MAX_DURATION) {
        throw new Error(`视频时长必须在 ${MIN_DURATION}-${MAX_DURATION} 秒之间`);
      }
    }

    if (options.referenceImages && options.referenceImages.length > 4) {
      throw new Error('参考图片最多支持 4 张');
    }
  }

  /**
   * 构建请求内容
   */
  private buildContent(options: GenerateOptions): Array<TextContent | ReferenceImage | ReferenceVideo | ReferenceAudio> {
    const content: Array<TextContent | ReferenceImage | ReferenceVideo | ReferenceAudio> = [];

    // 添加文本提示词
    content.push({
      type: 'text',
      text: options.prompt,
    });

    // 添加参考图片
    if (options.referenceImages) {
      for (const imgUrl of options.referenceImages) {
        content.push({
          type: 'image_url',
          image_url: { url: imgUrl },
          role: 'reference_image',
        });
      }
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
}

// 导出工厂函数（OpenClaw Skill 入口）
export function createSeedanceGenerator(config: SeedanceConfig): SeedanceVideoGenerator {
  return new SeedanceVideoGenerator(config);
}

// 默认导出
export default SeedanceVideoGenerator;
