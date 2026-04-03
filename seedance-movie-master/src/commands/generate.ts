/**
 * 命令实现 - 视频生成
 */

import { SeedanceVideoGenerator } from '../core/SeedanceVideoGenerator';
import { GenerateCommandArgs, SixStagePrompt } from '../types';
import { PromptEngine } from '../core/PromptEngine';

export async function generateCommand(
  args: GenerateCommandArgs,
  config: { apiKey: string }
): Promise<string> {
  const generator = new SeedanceVideoGenerator({
    apiKey: config.apiKey,
  });

  try {
    // 解析 6 阶提示词（如果输入是自然语言）
    const prompt: string | SixStagePrompt = PromptEngine.parseToSixStage(args.prompt);

    // 提交生成任务
    const task = await generator.generate({
      prompt,
      referenceImages: args.images,
      referenceVideo: args.video,
      referenceAudio: args.audio,
      ratio: args.ratio,
      duration: args.duration,
      generateAudio: args.generateAudio,
      watermark: args.watermark,
    });

    // 轮询任务状态
    const status = await generator.pollTask(task.taskId, {
      intervalMs: 3000,
      timeoutMs: 300000,
      onProgress: (status) => {
        console.log(`生成进度：${status}`);
      },
    });

    if (status.status === 'completed') {
      return `
## ✅ 视频生成完成！

### 📊 任务信息
- **任务 ID**: \`${task.taskId}\`
- **状态**: ${status.status}
- **视频 URL**: ${status.videoUrl || '暂无'}
- **音频 URL**: ${status.audioUrl || '暂无'}
${status.metadata ? `
### 🎬 技术规格
- **分辨率**: ${status.metadata.resolution}
- **帧率**: ${status.metadata.fps}fps
- **时长**: ${status.metadata.duration}秒
- **比例**: ${status.metadata.ratio}
- **处理时间**: ${(status.metadata.processingTime / 1000).toFixed(1)}秒
` : ''}
### 🔗 下载链接
- [下载视频](${status.videoUrl || '#'})
- [下载音频](${status.audioUrl || '#'})

---

*生成时间：${new Date().toLocaleString('zh-CN')}*
`.trim();
    } else {
      return `
## ❌ 视频生成失败

- **任务 ID**: \`${task.taskId}\`
- **错误信息**: ${status.error || '未知错误'}

请检查：
1. 提示词是否合规
2. 参考素材 URL 是否可访问
3. API Key 是否有效
`.trim();
    }
  } catch (error) {
    return `
## ❌ 生成过程出错

${error instanceof Error ? error.message : '未知错误'}

请检查配置和网络连接。
`.trim();
  }
}
