/**
 * Seedance 2.0 电影级漫剧生成大师
 * 主入口文件
 */

import { SeedanceConfig } from './types';
import { SeedanceVideoGenerator } from './core/SeedanceVideoGenerator';
import { PromptEngine } from './core/PromptEngine';
import { CharacterDNAManager } from './core/CharacterDNAManager';
import { StoryPlanner } from './core/StoryPlanner';

// 命令实现
import { storyCommand } from './commands/story';
import { characterCommand } from './commands/character';
import { storyboardCommand } from './commands/storyboard';
import { promptCommand } from './commands/prompt';
import { generateCommand } from './commands/generate';
import { projectCommand } from './commands/project';

// 导出类型
export * from './types';

// 导出核心类
export {
  SeedanceVideoGenerator,
  PromptEngine,
  CharacterDNAManager,
  StoryPlanner,
};

// 导出命令
export {
  storyCommand,
  characterCommand,
  storyboardCommand,
  promptCommand,
  generateCommand,
  projectCommand,
};

// 命令映射
export const commands = {
  story: storyCommand,
  character: characterCommand,
  storyboard: storyboardCommand,
  prompt: promptCommand,
  generate: generateCommand,
  project: projectCommand,
};

// 默认配置
export const defaultConfig: SeedanceConfig = {
  apiKey: process.env.VOLCENGINE_ARK_API_KEY || '',
  baseUrl: 'https://ark.cn-beijing.volces.com/api/v3',
  defaultRatio: '16:9',
  defaultDuration: 8,
};

// 工厂函数
export function createSeedanceMovieMaster(config: Partial<SeedanceConfig> = {}) {
  const finalConfig = { ...defaultConfig, ...config };
  
  if (!finalConfig.apiKey) {
    throw new Error('缺少 API Key，请设置 VOLCENGINE_ARK_API_KEY 环境变量或在配置中传入');
  }

  const generator = new SeedanceVideoGenerator(finalConfig);

  return {
    config: finalConfig,
    generator,
    commands: {
      story: storyCommand,
      character: characterCommand,
      storyboard: storyboardCommand,
      prompt: promptCommand,
      generate: (args: any) => generateCommand(args, { apiKey: finalConfig.apiKey }),
      project: projectCommand,
    },
    // 快捷方法
    async generate(prompt: string, options?: any) {
      return generator.generate({
        prompt,
        ...options,
      });
    },
    async poll(taskId: string, options?: any) {
      return generator.pollTask(taskId, options);
    },
  };
}

// 默认导出
export default createSeedanceMovieMaster;
