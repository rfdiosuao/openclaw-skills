/**
 * Kie AI API 测试脚本
 * 测试 Nano Banana Pro 图像生成 API
 */

const https = require('https');

// 配置
const API_KEY = process.env.KIE_API_KEY || 'test_key_placeholder';
const BASE_URL = 'https://api.kie.ai';

/**
 * 创建图像生成任务
 */
function createTask(params) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      model: 'nano-banana-pro',
      callBackUrl: params.callBackUrl,
      input: {
        prompt: params.prompt,
        image_input: params.imageInput || [],
        aspect_ratio: params.aspectRatio || '1:1',
        resolution: params.resolution || '1K',
        output_format: params.outputFormat || 'png',
      },
    });

    const options = {
      hostname: 'api.kie.ai',
      port: 443,
      path: '/api/v1/jobs/createTask',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (e) {
          reject(new Error(`Failed to parse response: ${e.message}`));
        }
      });
    });

    req.on('error', (e) => {
      reject(new Error(`Request failed: ${e.message}`));
    });

    req.write(postData);
    req.end();
  });
}

/**
 * 查询任务状态
 */
function getTaskStatus(taskId) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.kie.ai',
      port: 443,
      path: `/api/v1/jobs/${taskId}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (e) {
          reject(new Error(`Failed to parse response: ${e.message}`));
        }
      });
    });

    req.on('error', (e) => {
      reject(new Error(`Request failed: ${e.message}`));
    });

    req.end();
  });
}

/**
 * 主测试函数
 */
async function runTest() {
  console.log('🧪 Kie AI Nano Banana Pro API 测试');
  console.log('=====================================\n');

  // 测试 1：验证 API Key 配置
  console.log('📝 测试 1: API Key 配置检查');
  if (API_KEY === 'test_key_placeholder') {
    console.log('⚠️  警告：未配置真实 API Key，使用占位符\n');
    console.log('请设置环境变量 KIE_API_KEY 或修改代码中的 API_KEY\n');
  } else {
    console.log('✅ API Key 已配置\n');
  }

  // 测试 2：创建任务（示例请求）
  console.log('📝 测试 2: 创建图像生成任务');
  console.log('请求参数:');
  const testParams = {
    prompt: 'Comic poster: cool banana hero in shades leaps from sci-fi pad. Six panels: 1) 4K mountain landscape, 2) banana holds page of long multilingual text with auto translation, 3) Gemini 3 hologram for search/knowledge/reasoning, 4) camera UI sliders for angle focus color, 5) frame trio 1:1-9:16, 6) consistent banana poses. Footer shows Google icons. Tagline: Nano Banana Pro now on Kie AI.',
    aspectRatio: '1:1',
    resolution: '1K',
    outputFormat: 'png',
  };
  
  console.log(JSON.stringify({
    model: 'nano-banana-pro',
    input: testParams,
  }, null, 2));
  console.log('');

  // 如果有真实 API Key，执行实际调用
  if (API_KEY !== 'test_key_placeholder') {
    try {
      console.log('🔄 正在调用 API...');
      const result = await createTask(testParams);
      
      if (result.code === 200) {
        console.log('✅ 任务创建成功!');
        console.log(`Task ID: ${result.data.taskId}\n`);
        
        // 测试 3：查询任务状态
        console.log('📝 测试 3: 查询任务状态');
        console.log('🔄 正在查询...');
        
        const status = await getTaskStatus(result.data.taskId);
        console.log('完整响应:', JSON.stringify(status, null, 2));
        
        // 兼容不同响应格式
        const taskData = status.data || status.result || status;
        const taskStatus = taskData.status || taskData.taskStatus;
        
        console.log('任务状态:', taskStatus);
        
        if (taskStatus === 'completed' || taskStatus === 'success') {
          console.log('✅ 图像生成完成!');
          console.log('图像 URL:', taskData.imageUrl || taskData.resultUrl || taskData.url);
        } else if (taskStatus === 'processing' || taskStatus === 'running') {
          console.log('⏳ 任务仍在处理中...');
        } else if (taskStatus === 'failed' || taskStatus === 'error') {
          console.log('❌ 任务失败:', taskData.error || taskData.errorMessage);
        }
      } else {
        console.log('❌ API 返回错误:', result.msg);
        console.log('错误码:', result.code);
      }
    } catch (error) {
      console.log('❌ 测试失败:', error.message);
    }
  } else {
    console.log('💡 提示:');
    console.log('1. 获取 API Key: https://kie.ai/api-key');
    console.log('2. 设置环境变量：export KIE_API_KEY=your_api_key');
    console.log('3. 重新运行测试：node test-api.js\n');
  }

  console.log('=====================================');
  console.log('✅ 测试完成\n');

  // 输出完整代码示例
  console.log('📋 完整使用示例:');
  console.log('```javascript');
  console.log(`const { KieNanoBananaPro } = require('./dist/index');`);
  console.log('');
  console.log('const kie = new KieNanoBananaPro(process.env.KIE_API_KEY);');
  console.log('');
  console.log('const result = await kie.createTask({');
  console.log('  prompt: "你的提示词",');
  console.log('  aspectRatio: "1:1",');
  console.log('  resolution: "1K",');
  console.log('  outputFormat: "png",');
  console.log('});');
  console.log('');
  console.log('console.log("Task ID:", result.data.taskId);');
  console.log('```');
}

// 运行测试
runTest().catch(console.error);
