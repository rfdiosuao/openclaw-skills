/**
 * Kie AI 图像生成 - 回调方式测试
 * 
 * 使用 callBackUrl 接收生成完成通知
 * 这是生产环境推荐的方式
 */

const https = require('https');
const http = require('http');

const API_KEY = '8ae40bde7e9a9c8e9904dfd35126ded8';
const CALLBACK_PORT = 3000;

/**
 * 创建回调服务器
 */
function createCallbackServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      if (req.method === 'POST' && req.url === '/api/callback') {
        let body = '';
        
        req.on('data', chunk => {
          body += chunk.toString();
        });
        
        req.on('end', () => {
          const result = JSON.parse(body);
          console.log('\n=====================================');
          console.log('✅ 收到回调通知!');
          console.log('=====================================\n');
          console.log('📊 完整响应:');
          console.log(JSON.stringify(result, null, 2));
          console.log('\n=====================================\n');
          
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true }));
          
          // 关闭服务器
          setTimeout(() => server.close(), 1000);
        });
      } else {
        res.writeHead(404);
        res.end('Not Found');
      }
    });

    server.listen(CALLBACK_PORT, () => {
      console.log(`📡 回调服务器已启动：http://localhost:${CALLBACK_PORT}/api/callback`);
      resolve(server);
    });
  });
}

/**
 * 创建生成任务（带回调）
 */
function createTaskWithCallback(prompt, callBackUrl) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      model: 'nano-banana-pro',
      callBackUrl: callBackUrl,
      input: {
        prompt: prompt,
        aspect_ratio: '1:1',
        resolution: '1K',
        output_format: 'png',
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
 * 主函数
 */
async function main() {
  console.log('🎨 Kie AI 图像生成测试 - 回调方式\n');
  console.log('=====================================\n');

  const testPrompt = 'A cute cartoon panda eating bamboo in a peaceful forest, soft lighting, 3D render, high quality, detailed fur, natural environment';

  console.log('📝 提示词:');
  console.log(testPrompt);
  console.log('\n=====================================\n');

  try {
    // 步骤 1: 启动回调服务器
    console.log('🚀 步骤 1: 启动回调服务器...');
    await createCallbackServer();
    
    // 注意：本地测试需要使用公网可访问的回调地址
    // 可以使用 ngrok 等工具将本地服务暴露到公网
    const callBackUrl = 'https://your-domain.com/api/callback'; // 替换为你的回调地址
    
    console.log('💡 提示：');
    console.log('- 回调地址需要公网可访问');
    console.log('- 本地测试可使用 ngrok: ngrok http 3000');
    console.log('- 或使用 webhook.site 测试：https://webhook.site\n');
    
    console.log('📡 回调地址:', callBackUrl);
    console.log('\n=====================================\n');

    // 步骤 2: 创建任务
    console.log('🚀 步骤 2: 创建生成任务（带回调）...');
    const result = await createTaskWithCallback(testPrompt, callBackUrl);
    
    console.log('✅ 任务创建成功!');
    console.log('Task ID:', result.data?.taskId || result.taskId);
    console.log('\n=====================================\n');
    console.log('⏳ 等待回调通知...');
    console.log('(生成完成后会自动通知回调地址)\n');

  } catch (error) {
    console.log('\n❌ 错误:', error.message);
  }
}

// 运行测试
main().catch(console.error);
