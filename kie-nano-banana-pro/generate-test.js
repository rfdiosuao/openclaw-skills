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
    console.log('⏳ 任务状态:', status.state || status.status || 'unknown');
    console.log('   完整响应:', JSON.stringify(status).substring(0, 200));

    // Kie AI 返回格式：state 字段 (success/failed/processing)
    const taskState = status.state || status.status;
    
    if (taskState === 'success' || taskState === 'completed') {
      return status;
    }

    if (taskState === 'failed' || taskState === 'error') {
      throw new Error(status.failMsg || status.error || 'Task failed');
    }
  }

  throw new Error('Timeout');
}

/**
 * 查询状态
 * 接口：GET /api/v1/jobs/recordInfo?taskId={taskId}
 */
function getTaskStatus(taskId) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: BASE_URL,
      port: 443,
      path: `/api/v1/jobs/recordInfo?taskId=${taskId}`,
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
          resolve(result.data || result);
        } catch (e) {
          reject(new Error(`Parse failed: ${e.message}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
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

    // 解析结果
    const resultJson = finalStatus.resultJson ? JSON.parse(finalStatus.resultJson) : null;
    console.log('📊 任务信息:');
    console.log('- Task ID:', finalStatus.taskId);
    console.log('- 状态:', finalStatus.state || finalStatus.status);
    console.log('- 耗时:', finalStatus.costTime, 'ms');
    console.log('- 完成时间:', new Date(finalStatus.completeTime).toLocaleString());
    
    if (resultJson && resultJson.resultUrls) {
      console.log('\n🖼️ 生成结果:');
      console.log('- 图像 URL:', resultJson.resultUrls[0]);
    }
    
    console.log('\n=====================================\n');
    console.log('📋 完整响应:');
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
