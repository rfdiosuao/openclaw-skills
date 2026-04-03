/**
 * Kie AI Nano Banana Pro 生图 Skill
 * 
 * 通过 Kie AI API 调用 Google Nano Banana Pro 模型生成高质量图像
 * 官方文档：https://docs.kie.ai/market/google/pro-image-to-image
 */

interface KieApiConfig {
  apiKey: string;
  baseUrl: string;
}

interface GenerationInput {
  prompt: string;
  image_input?: string[];
  aspect_ratio?: string;
  resolution?: string;
  output_format?: string;
}

interface CreateTaskRequest {
  model: 'nano-banana-pro';
  callBackUrl?: string;
  input: GenerationInput;
}

interface TaskResponse {
  code: number;
  msg: string;
  data: {
    taskId: string;
  };
}

interface TaskStatusResponse {
  code: number;
  msg: string;
  data: {
    taskId: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    imageUrl?: string;
    thumbnailUrl?: string;
    error?: string;
  };
}

export class KieNanoBananaPro {
  private config: KieApiConfig;

  constructor(apiKey: string, baseUrl: string = 'https://api.kie.ai') {
    this.config = { apiKey, baseUrl };
  }

  /**
   * 创建图像生成任务
   */
  async createTask(params: {
    prompt: string;
    aspectRatio?: string;
    resolution?: string;
    outputFormat?: string;
    imageInput?: string[];
    callBackUrl?: string;
  }): Promise<TaskResponse> {
    const request: CreateTaskRequest = {
      model: 'nano-banana-pro',
      input: {
        prompt: params.prompt,
        image_input: params.imageInput || [],
        aspect_ratio: params.aspectRatio || '1:1',
        resolution: params.resolution || '1K',
        output_format: params.outputFormat || 'png',
      },
    };

    if (params.callBackUrl) {
      request.callBackUrl = params.callBackUrl;
    }

    const response = await fetch(`${this.config.baseUrl}/api/v1/jobs/createTask`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const result = await response.json();
    
    if (result.code !== 200) {
      throw new Error(`API Error: ${result.msg} (code: ${result.code})`);
    }

    return result;
  }

  /**
   * 查询任务状态
   */
  async getTaskStatus(taskId: string): Promise<TaskStatusResponse> {
    const response = await fetch(`${this.config.baseUrl}/api/v1/jobs/${taskId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
    });

    const result = await response.json();
    return result;
  }

  /**
   * 等待任务完成（轮询）
   */
  async waitForCompletion(
    taskId: string,
    options: {
      intervalMs?: number;
      timeoutMs?: number;
    } = {}
  ): Promise<TaskStatusResponse> {
    const { intervalMs = 3000, timeoutMs = 300000 } = options;
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      const status = await this.getTaskStatus(taskId);
      
      if (status.data.status === 'completed') {
        return status;
      }
      
      if (status.data.status === 'failed') {
        throw new Error(`Task failed: ${status.data.error}`);
      }

      // 等待后重试
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }

    throw new Error(`Task timeout after ${timeoutMs}ms`);
  }

  /**
   * 生成提示词优化建议
   */
  generatePromptOptimization(userPrompt: string, context?: {
    style?: string;
    aspectRatio?: string;
    useCase?: string;
  }): string {
    const optimizations: string[] = [];

    // 检查提示词长度
    if (userPrompt.length < 20) {
      optimizations.push('提示词较短，建议添加更多细节描述');
    }

    // 检查是否包含关键元素
    if (!userPrompt.includes('style') && !userPrompt.includes('风格')) {
      optimizations.push('建议添加风格描述（如：写实/漫画/3D 等）');
    }

    // 根据用途提供建议
    if (context?.useCase === 'product') {
      optimizations.push('产品图建议：添加"professional product photography, clean background, 8K"');
    } else if (context?.useCase === 'poster') {
      optimizations.push('海报建议：添加"comic poster, dynamic composition, bold colors"');
    }

    return optimizations.join('\n');
  }
}

// 测试函数
async function test() {
  console.log('🧪 Kie AI Nano Banana Pro Skill 测试');
  console.log('=====================================');
  
  // 注意：实际使用需要替换为真实 API Key
  const apiKey = process.env.KIE_API_KEY || 'test_key';
  const kie = new KieNanoBananaPro(apiKey);

  try {
    // 测试 1：创建任务（使用示例提示词）
    console.log('\n📝 测试 1: 创建图像生成任务');
    const testPrompt = 'Comic poster: cool banana hero in shades leaps from sci-fi pad';
    
    // 如果没有 API Key，仅打印请求内容
    if (apiKey === 'test_key') {
      console.log('⚠️  使用测试模式（未配置 API Key）');
      console.log('请求内容:');
      console.log(JSON.stringify({
        model: 'nano-banana-pro',
        input: {
          prompt: testPrompt,
          aspect_ratio: '1:1',
          resolution: '1K',
          output_format: 'png',
        },
      }, null, 2));
    } else {
      const result = await kie.createTask({
        prompt: testPrompt,
        aspectRatio: '1:1',
        resolution: '1K',
        outputFormat: 'png',
      });
      console.log('✅ 任务创建成功');
      console.log('Task ID:', result.data.taskId);
    }

    // 测试 2：提示词优化
    console.log('\n✨ 测试 2: 提示词优化建议');
    const optimization = kie.generatePromptOptimization(
      '帮我生成一个产品图',
      { useCase: 'product' }
    );
    console.log(optimization);

    console.log('\n✅ 测试完成');
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

// 导出默认实例
export default KieNanoBananaPro;

// 如果直接运行此文件，执行测试
if (require.main === module) {
  test();
}
