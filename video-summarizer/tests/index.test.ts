/**
 * Video Summarizer 单元测试
 */

import { VideoSummarizer, createVideoSummarizer } from '../src/index';

describe('VideoSummarizer', () => {
  let summarizer: VideoSummarizer;

  beforeEach(() => {
    summarizer = createVideoSummarizer();
  });

  test('应该能创建总结器实例', () => {
    expect(summarizer).toBeInstanceOf(VideoSummarizer);
  });

  test('ASR 纠错 - 修复常见错误', () => {
    const text = 'openclaw 和 open claw 都是指同一个工具，A P I 接口很重要';
    const result = summarizer.correctASR(text);
    
    expect(result.corrected).toContain('OpenClaw');
    expect(result.corrected).toContain('API');
    expect(result.corrections.length).toBeGreaterThan(0);
  });

  test('ASR 纠错 - 修复专业术语', () => {
    const text = '这个 A I 项目用了 python 和 java script';
    const result = summarizer.correctASR(text);
    
    expect(result.corrected).toContain('AI');
    expect(result.corrected).toContain('Python');
    expect(result.corrected).toContain('JavaScript');
  });

  test('提取关键要点', () => {
    const text = '今天我们来学习 OpenClaw。首先，OpenClaw 是一个自动化工具。其次，它可以连接飞书。最重要的是，它能帮你节省时间。总之，非常好用。';
    const keyPoints = summarizer.extractKeyPoints(text);
    
    expect(keyPoints.length).toBeGreaterThan(0);
    expect(keyPoints.some(k => k.includes('OpenClaw'))).toBe(true);
  });

  test('生成一句话概括', () => {
    const text = '这是一个关于 OpenClaw 使用的教程视频，主要讲解如何配置和部署。';
    const keyPoints = ['OpenClaw 是自动化工具', '可以连接飞书', '节省时间'];
    const oneLiner = summarizer.generateOneLiner(text, keyPoints);
    
    expect(oneLiner.length).toBeLessThan(100);
  });

  test('提取话题', () => {
    const text = 'OpenClaw 可以连接飞书多维表格，通过 API 实现自动化工作流。';
    const topics = summarizer.extractTopics(text);
    
    expect(topics).toContain('OpenClaw');
    expect(topics).toContain('飞书');
    expect(topics).toContain('API');
  });

  test('完整总结流程', async () => {
    const text = '今天我们来学习 OpenClaw。OpenClaw 是一个强大的自动化工具，可以连接飞书。首先，你需要安装 OpenClaw。其次，配置 API 密钥。最后，创建工作流。总之，OpenClaw 能帮你节省大量时间。';
    const summary = await summarizer.summarize(text);
    
    expect(summary.title).toBeDefined();
    expect(summary.oneLiner).toBeDefined();
    expect(summary.keyPoints.length).toBeGreaterThan(0);
    expect(summary.fullSummary).toContain('## 📌 核心内容');
    expect(summary.topics.length).toBeGreaterThan(0);
  });

  test('配置项 - 简洁模式', async () => {
    const summarizer = createVideoSummarizer({ style: 'concise', maxLength: 200 });
    const text = '这是一个很长的视频文案，包含很多内容...'.repeat(10);
    const summary = await summarizer.summarize(text);
    
    expect(summary).toBeDefined();
  });
});
