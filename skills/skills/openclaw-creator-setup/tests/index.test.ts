/**
 * OpenClaw 内容创作者配置工具 - 单元测试
 */

import { OpenClawCreatorSetup } from '../src/index';

describe('OpenClawCreatorSetup', () => {
  let mockContext: any;
  let setup: OpenClawCreatorSetup;

  beforeEach(() => {
    mockContext = {
      log: jest.fn(),
      require: jest.fn(),
      registerCommand: jest.fn()
    };
    setup = new OpenClawCreatorSetup(mockContext);
  });

  describe('constructor', () => {
    it('should create instance with default config', () => {
      expect(setup).toBeDefined();
    });
  });

  describe('check', () => {
    it('should return environment status', async () => {
      const status = await setup.check();
      
      expect(status).toHaveProperty('nodeVersion');
      expect(status).toHaveProperty('platforms');
      expect(status.platforms).toEqual(['wechat', 'weibo', 'douyin']);
    });
  });

  describe('configurePlatforms', () => {
    it('should update platform configuration', async () => {
      const platforms = ['wechat', 'xiaohongshu'];
      await setup.configurePlatforms(platforms);
      
      expect(mockContext.log).toHaveBeenCalledWith('🔧 配置发布平台...');
    });
  });

  describe('createWorkflow', () => {
    it('should create workflow with given name', async () => {
      await setup.createWorkflow('test-workflow');
      
      expect(mockContext.log).toHaveBeenCalledWith('📋 创建工作流：test-workflow');
    });
  });
});
