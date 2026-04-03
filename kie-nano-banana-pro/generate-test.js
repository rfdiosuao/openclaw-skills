/**
 * Kie AI 图像生成测试
 * 使用真实 API Key 生成测试图片
 */

const https = require('https');

const API_KEY = '8ae40bde7e9a9c8e9904dfd35126ded8';
const BASE_URL = 'api.kie.ai';

/**
 * 创建任务
 */
function createTask(prompt) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      model: 'nano-banana-pro',
      input: {
        prompt: prompt,
        aspect_ratio: '1:1',
        resolution: '1K',
        output_format: 'png',
      },
    });

    const options = {
      hostname: BASE_URL,
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
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Parse failed: ${e.message}`));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

/**
 * 轮询任务状态
 */
async function waitForCompletion(taskId, timeout = 120000) {
  const startTime = Date.now();
  const interval = 3000;

  while (Date.now() - startTime < timeout) {
    await new Promise(r => setTimeout(r, interval));

    const status = await getTaskStatus(taskId);
    console.log('⏳ 任务状态:', status.status || status.taskStatus || 'unknown');

    if (status.status === 'completed' || status.taskStatus === 'completed') {
      return status;
    }

    if (status.status === 'failed' || status.taskStatus === 'failed') {
      throw new Error(status.error || 'Task failed');
    }
  }

  throw new Error('Timeout');
}

/**
 * 查询状态 - 尝试多个可能的接口路径
 */
function getTaskStatus(taskId) {
  return new Promise((resolve, reject) => {
    // 尝试不同的 API 路径
    const paths = [
      `/api/v1/jobs/${taskId}`,
      `/api/v1/tasks/${taskId}`,
      `/api/v1/image-jobs/${taskId}`,
    ];

    let tried = 0;

    function tryNext() {
      if (tried >= paths.length) {
        resolve({ status: 'processing', message: 'Still processing, please wait' });
        return;
      }

      const path = paths[tried++];
      const options = {
        hostname: BASE_URL,
        port: 443,
        path: path,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
        },
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            if (result.code === 200 || result.status !== 404) {
              resolve(result.data || result);
            } else {
              tryNext();
            }
          } catch (e) {
            tryNext();
          }
        });
      });

      req.on('error', () => tryNext());
      req.end();
    }

    tryNext();
  });
}

// 主函数
async function main() {
  console.log('🎨 Kie AI 图像生成测试\n');
  console.log('=====================================\n');

  const testPrompt = 'A cute cartoon panda eating bamboo in a peaceful forest, soft lighting, 3D render, high quality, detailed fur, natural environment';

  console.log('📝 提示词:');
  console.log(testPrompt);
  console.log('\n=====================================\n');

  try {
    // 步骤 1: 创建任务
    console.log('🚀 步骤 1: 创建生成任务...');
    const createResult = await createTask(testPrompt);
    console.log('✅ 任务创建成功!');
    console.log('Task ID:', createResult.data?.taskId || createResult.taskId);
    console.log('\n=====================================\n');

    const taskId = createResult.data?.taskId || createResult.taskId;
    if (!taskId) {
      throw new Error('No taskId in response');
    }

    // 步骤 2: 等待完成
    console.log('⏳ 步骤 2: 等待生成完成（最多 2 分钟）...');
    console.log('(每 3 秒查询一次状态)\n');

    const finalStatus = await waitForCompletion(taskId);
    console.log('\n=====================================\n');
    console.log('✅ 图像生成完成!\n');

    console.log('📊 完整响应:');
    console.log(JSON.stringify(finalStatus, null, 2));

  } catch (error) {
    console.log('\n❌ 生成失败:', error.message);
    console.log('\n💡 提示:');
    console.log('- 检查 API Key 是否有效');
    console.log('- 检查账户余额是否充足');
    console.log('- 稍后重试（可能服务器繁忙）');
  }
}

main();
