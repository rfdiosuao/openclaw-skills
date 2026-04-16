/**
 * FFmpeg 视频拼接大师
 * 
 * 专业级 FFmpeg 视频拼接工具，支持快速拼接、标准拼接、转场拼接等多种模式
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

interface VideoInfo {
  duration: number;
  width: number;
  height: number;
  fps: number;
  videoCodec: string;
  audioCodec: string;
  bitrate: number;
}

interface ConcatOptions {
  mode: 'quick' | 'standard' | 'fade' | 'dissolve' | 'wipe';
  output?: string;
  transitionDuration?: number;
  crf?: number;
  scale?: string;
  framerate?: number;
  audioFade?: number;
  folder?: string;
  pattern?: string;
}

class FFmpegConcat {
  private outputDir: string;

  constructor(outputDir: string = '~/Videos/merged') {
    this.outputDir = path.resolve(outputDir.replace('~', process.env.HOME || '/home/node'));
    
    // 确保输出目录存在
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * 获取视频信息
   */
  async getVideoInfo(videoPath: string): Promise<VideoInfo> {
    const { stdout } = await execAsync(
      `ffprobe -v quiet -print_format json -show_format -show_streams "${videoPath}"`
    );
    const data = JSON.parse(stdout);
    
    const videoStream = data.streams.find((s: any) => s.codec_type === 'video');
    const audioStream = data.streams.find((s: any) => s.codec_type === 'audio');
    
    if (!videoStream) {
      throw new Error(`未找到视频流：${videoPath}`);
    }

    return {
      duration: parseFloat(data.format.duration) || 0,
      width: videoStream.width,
      height: videoStream.height,
      fps: parseFloat(videoStream.r_frame_rate.split('/')[0]) / 
           parseFloat(videoStream.r_frame_rate.split('/')[1]) || 30,
      videoCodec: videoStream.codec_name,
      audioCodec: audioStream?.codec_name || 'none',
      bitrate: parseInt(data.format.bit_rate) || 0,
    };
  }

  /**
   * 格式化时长显示
   */
  formatDuration(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    
    if (h > 0) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  /**
   * 生成输出文件名
   */
  generateOutputFile(): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '').slice(0, 15);
    return path.join(this.outputDir, `merged_${timestamp}.mp4`);
  }

  /**
   * 快速拼接（不重新编码）
   */
  async quickConcat(videos: string[], output?: string): Promise<string> {
    const outputFile = output || this.generateOutputFile();
    
    // 创建临时文件列表
    const listFile = path.join('/tmp', `concat_${Date.now()}.txt`);
    const listContent = videos
      .map(v => `file '${path.resolve(v)}'`)
      .join('\n');
    
    fs.writeFileSync(listFile, listContent);
    
    try {
      await execAsync(
        `ffmpeg -y -f concat -safe 0 -i "${listFile}" -c copy "${outputFile}"`
      );
      return outputFile;
    } finally {
      fs.unlinkSync(listFile);
    }
  }

  /**
   * 标准拼接（重新编码）
   */
  async standardConcat(
    videos: string[],
    output: string,
    options: ConcatOptions
  ): Promise<void> {
    const inputs = videos.flatMap(v => ['-i', v]);
    const filterParts: string[] = [];
    
    // 视频处理链
    for (let i = 0; i < videos.length; i++) {
      const info = await this.getVideoInfo(videos[i]);
      filterParts.push(
        `[${i}:v]scale=${options.scale || `${info.width}x${info.height}`},` +
        `fps=${options.framerate || info.fps}[v${i}]`
      );
    }
    
    // 音频处理链
    for (let i = 0; i < videos.length; i++) {
      filterParts.push(`[${i}:a]aformat=aac[a${i}]`);
    }
    
    // 拼接
    const n = videos.length;
    const videoInputs = Array.from({ length: n }, (_, i) => `[v${i}]`).join('');
    const audioInputs = Array.from({ length: n }, (_, i) => `[a${i}]`).join('');
    filterParts.push(
      `${videoInputs}${audioInputs}concat=n=${n}:v=1:a=1[outv][outa]`
    );
    
    const filterComplex = filterParts.join(';');
    const crf = options.crf || 23;
    
    await execAsync(
      `ffmpeg -y ${inputs.map(i => `"${i}"`).join(' ')} ` +
      `-filter_complex "${filterComplex}" ` +
      `-map "[outv]" -map "[outa]" ` +
      `-c:v libx264 -crf ${crf} -preset medium ` +
      `-c:a aac -b:a 192k ` +
      `"${output}"`
    );
  }

  /**
   * 转场拼接
   */
  async transitionConcat(
    videos: string[],
    output: string,
    options: ConcatOptions
  ): Promise<void> {
    const inputs = videos.flatMap(v => ['-i', v]);
    const transition = options.mode === 'fade' ? 'fade' : 
                       options.mode === 'dissolve' ? 'dissolve' : 
                       options.mode === 'wipe' ? 'wiperight' : 'fade';
    const duration = options.transitionDuration || 1;
    
    // 计算转场偏移量
    let offset = 0;
    const videoInfos = await Promise.all(
      videos.map(v => this.getVideoInfo(v))
    );
    
    // 构建视频转场链
    let videoFilter = '';
    let audioFilter = '';
    
    for (let i = 0; i < videos.length - 1; i++) {
      const currentOffset = offset;
      offset += videoInfos[i].duration - (i === 0 ? 0 : duration);
      
      if (i === 0) {
        videoFilter = `[0:v][1:v]xfade=transition=${transition}:duration=${duration}:offset=${currentOffset}`;
        audioFilter = `[0:a][1:a]acrossfade=d=${duration}`;
      } else {
        const prevResult = i === 1 ? '[outv0]' : `[outv${i-1}]`;
        const newResult = i === videos.length - 2 ? '[outv]' : `[outv${i}]`;
        const newAudioResult = i === videos.length - 2 ? '[outa]' : `[outa${i}]`;
        
        videoFilter = `[${prevResult}][${i + 1}:v]xfade=transition=${transition}:duration=${duration}:offset=${currentOffset}${newResult}`;
        audioFilter = i === 1 
          ? `[${audioFilter}][${i + 1}:a]acrossfade=d=${duration}${newAudioResult}`
          : `[outa${i-1}][${i + 1}:a]acrossfade=d=${duration}${newAudioResult}`;
      }
    }
    
    await execAsync(
      `ffmpeg -y ${inputs.map(i => `"${i}"`).join(' ')} ` +
      `-filter_complex "${videoFilter};${audioFilter}" ` +
      `-map "[outv]" -map "[outa]" ` +
      `-c:v libx264 -crf 23 -preset medium ` +
      `-c:a aac -b:a 192k ` +
      `"${output}"`
    );
  }

  /**
   * 从文件夹获取视频文件
   */
  async getVideosFromFolder(folder: string, pattern: string = '*.mp4'): Promise<string[]> {
    const folderPath = path.resolve(folder);
    
    if (!fs.existsSync(folderPath)) {
      throw new Error(`文件夹不存在：${folderPath}`);
    }
    
    const files = fs.readdirSync(folderPath);
    const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.flv'];
    
    const videos = files
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return videoExtensions.includes(ext);
      })
      .sort() // 按名称排序
      .map(file => path.join(folderPath, file));
    
    return videos;
  }

  /**
   * 检查视频兼容性
   */
  async checkCompatibility(videos: string[]): Promise<{
    compatible: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];
    const infos = await Promise.all(videos.map(v => this.getVideoInfo(v)));
    
    const first = infos[0];
    
    for (let i = 1; i < infos.length; i++) {
      const info = infos[i];
      
      if (info.videoCodec !== first.videoCodec) {
        issues.push(`视频 ${i + 1} 编码不同：${info.videoCodec} vs ${first.videoCodec}`);
      }
      if (info.width !== first.width || info.height !== first.height) {
        issues.push(`视频 ${i + 1} 分辨率不同：${info.width}x${info.height} vs ${first.width}x${first.height}`);
      }
      if (Math.abs(info.fps - first.fps) > 0.1) {
        issues.push(`视频 ${i + 1} 帧率不同：${info.fps}fps vs ${first.fps}fps`);
      }
      if (info.audioCodec !== first.audioCodec) {
        issues.push(`视频 ${i + 1} 音频编码不同：${info.audioCodec} vs ${first.audioCodec}`);
      }
    }
    
    return {
      compatible: issues.length === 0,
      issues,
    };
  }

  /**
   * 主处理函数
   */
  async process(
    videos: string[],
    options: ConcatOptions
  ): Promise<{
    outputFile: string;
    duration: number;
    size: number;
    mode: string;
  }> {
    // 从文件夹加载视频
    if (options.folder) {
      videos = await this.getVideosFromFolder(options.folder, options.pattern);
    }
    
    if (videos.length < 2) {
      throw new Error('至少需要 2 个视频文件');
    }
    
    // 检查视频信息
    const infos = await Promise.all(videos.map(v => this.getVideoInfo(v)));
    const totalDuration = infos.reduce((sum, info) => sum + info.duration, 0);
    
    console.log('📊 视频信息:');
    videos.forEach((v, i) => {
      const info = infos[i];
      console.log(`  ${i + 1}. ${path.basename(v)} - ${this.formatDuration(info.duration)}, ${info.width}x${info.height}, ${info.fps}fps`);
    });
    
    // 确定拼接模式
    let mode = options.mode;
    if (mode === 'quick') {
      const compatibility = await this.checkCompatibility(videos);
      if (!compatibility.compatible) {
        console.log('⚠️  视频参数不一致，自动切换到标准拼接模式');
        console.log('   问题:');
        compatibility.issues.forEach(issue => console.log(`     - ${issue}`));
        mode = 'standard';
      }
    }
    
    const outputFile = options.output || this.generateOutputFile();
    
    // 执行拼接
    console.log(`\n🎬 开始拼接 (模式：${mode})...`);
    
    if (mode === 'quick') {
      await this.quickConcat(videos, outputFile);
    } else if (mode === 'standard') {
      await this.standardConcat(videos, outputFile, options);
    } else {
      await this.transitionConcat(videos, outputFile, options);
    }
    
    // 获取输出文件信息
    const outputInfo = await this.getVideoInfo(outputFile);
    const stats = fs.statSync(outputFile);
    
    return {
      outputFile,
      duration: outputInfo.duration,
      size: stats.size,
      mode,
    };
  }
}

// CLI 入口
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('help') || args.includes('--help') || args.length === 0) {
    console.log(`
🎬 FFmpeg 视频拼接大师

用法:
  npm start -- [视频 1] [视频 2] ... [选项]

模式:
  quick     - 快速拼接（不重新编码，要求参数一致）
  standard  - 标准拼接（重新编码，兼容所有视频）
  fade      - 淡入淡出转场
  dissolve  - 溶解转场
  wipe      - 擦除转场

选项:
  --output <file>           输出文件名
  --transition-duration <s> 转场时长（秒，默认 1.0）
  --crf <18-28>            视频质量（默认 23）
  --scale <WxH>            统一分辨率
  --framerate <fps>        统一帧率
  --audio-fade <s>         音频淡入淡出时长
  --folder <path>          从文件夹加载视频
  --pattern <pattern>      文件匹配模式（默认*.mp4）

示例:
  npm start -- video1.mp4 video2.mp4
  npm start -- quick video1.mp4 video2.mp4
  npm start -- fade video1.mp4 video2.mp4 --transition-duration 1.5
  npm start -- --folder ./videos/ --pattern "*.mp4"
`);
    process.exit(0);
  }
  
  const concat = new FFmpegConcat();
  
  // 解析参数
  const videos: string[] = [];
  const options: ConcatOptions = {
    mode: 'standard',
  };
  
  let i = 0;
  while (i < args.length) {
    const arg = args[i];
    
    if (arg === 'quick' || arg === 'standard' || arg === 'fade' || arg === 'dissolve' || arg === 'wipe') {
      options.mode = arg as any;
    } else if (arg === '--output' && args[i + 1]) {
      options.output = args[++i];
    } else if (arg === '--transition-duration' && args[i + 1]) {
      options.transitionDuration = parseFloat(args[++i]);
    } else if (arg === '--crf' && args[i + 1]) {
      options.crf = parseInt(args[++i]);
    } else if (arg === '--scale' && args[i + 1]) {
      options.scale = args[++i];
    } else if (arg === '--framerate' && args[i + 1]) {
      options.framerate = parseInt(args[++i]);
    } else if (arg === '--audio-fade' && args[i + 1]) {
      options.audioFade = parseFloat(args[++i]);
    } else if (arg === '--folder' && args[i + 1]) {
      options.folder = args[++i];
    } else if (arg === '--pattern' && args[i + 1]) {
      options.pattern = args[++i];
    } else if (!arg.startsWith('--')) {
      videos.push(arg);
    }
    
    i++;
  }
  
  try {
    const result = await concat.process(videos, options);
    
    console.log('\n✅ 拼接完成！');
    console.log(`📁 输出文件：${result.outputFile}`);
    console.log(`⏱️  总时长：${concat.formatDuration(result.duration)}`);
    console.log(`📦 文件大小：${(result.size / 1024 / 1024).toFixed(2)} MB`);
    console.log(`🎬 拼接模式：${result.mode}`);
  } catch (error: any) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

// 导出供 OpenClaw Skill 使用
export { FFmpegConcat, VideoInfo, ConcatOptions };

// 如果是直接运行则执行 CLI
if (require.main === module) {
  main().catch(console.error);
}
