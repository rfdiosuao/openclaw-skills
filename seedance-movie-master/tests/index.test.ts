/**
 * Seedance 2.0 电影级漫剧生成大师 - 单元测试
 */

import { PromptEngine } from '../src/core/PromptEngine';
import { CharacterDNAManager } from '../src/core/CharacterDNAManager';
import { StoryPlanner } from '../src/core/StoryPlanner';

describe('PromptEngine', () => {
  describe('parseToSixStage', () => {
    it('应该正确解析自然语言描述', () => {
      const result = PromptEngine.parseToSixStage(
        '剑客在雨中拔剑，霓虹灯光反射在剑身上'
      );
      
      expect(result.subject).toBeDefined();
      expect(result.action).toBeDefined();
      expect(result.scene).toBeDefined();
    });

    it('应该为缺失的字段提供默认值', () => {
      const result = PromptEngine.parseToSixStage('简单描述');
      
      expect(result.subject).toBe('主角');
      expect(result.action).toBe('站立');
    });
  });

  describe('toWeightedString', () => {
    it('应该生成带权重的提示词字符串', () => {
      const prompt = {
        subject: '剑客',
        action: '拔剑',
        scene: '雨夜',
        camera: '特写',
        lighting: '霓虹灯',
        style: '赛博朋克',
      };

      const result = PromptEngine.toWeightedString(prompt);
      
      expect(result).toContain('(剑客:1.5)');
      expect(result).toContain('(拔剑:1.3)');
      expect(result).toContain('(赛博朋克:0.9)');
    });
  });

  describe('validate', () => {
    it('应该验证有效的提示词', () => {
      const prompt = {
        subject: '剑客',
        action: '拔剑',
        scene: '雨夜',
        camera: '特写',
        lighting: '霓虹灯',
        style: '赛博朋克',
      };

      const result = PromptEngine.validate(prompt);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('应该检测缺失的字段', () => {
      const prompt = {
        subject: '',
        action: '',
        scene: '雨夜',
        camera: '特写',
        lighting: '霓虹灯',
        style: '赛博朋克',
      };

      const result = PromptEngine.validate(prompt);
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});

describe('CharacterDNAManager', () => {
  describe('create', () => {
    it('应该创建完整的角色 DNA 档案', () => {
      const dna = CharacterDNAManager.create({
        name: '李玄风',
        age: '成年',
        gender: '男',
        personality: ['冷静', '果断'],
        abilities: ['剑术'],
        backstory: '前朝禁军教头',
      });

      expect(dna.name).toBe('李玄风');
      expect(dna.appearance.age).toBe('成年');
      expect(dna.appearance.gender).toBe('男');
      expect(dna.personality).toContain('冷静');
      expect(dna.referencePrompts.length).toBeGreaterThan(0);
      expect(dna.dnaKeywords.length).toBeGreaterThan(0);
    });

    it('应该生成参考图提示词', () => {
      const dna = CharacterDNAManager.create({
        name: '测试角色',
      });

      expect(dna.referencePrompts.length).toBeGreaterThan(0);
      expect(dna.referencePrompts[0]).toContain('正面全身像');
    });
  });

  describe('exportToMarkdown', () => {
    it('应该导出格式化的 Markdown', () => {
      const dna = CharacterDNAManager.create({
        name: '测试角色',
      });

      const markdown = CharacterDNAManager.exportToMarkdown(dna);
      
      expect(markdown).toContain('# 角色设定：测试角色');
      expect(markdown).toContain('## 外貌特征');
      expect(markdown).toContain('## DNA 锁定关键词');
    });
  });
});

describe('StoryPlanner', () => {
  describe('plan', () => {
    it('应该规划完整的故事', () => {
      const story = StoryPlanner.plan({
        theme: '机械剑客复仇',
        type: '武侠',
        style: '赛博朋克',
        episodes: 3,
      });

      expect(story.title).toBeDefined();
      expect(story.logline).toBeDefined();
      expect(story.type).toBe('武侠');
      expect(story.style).toBe('赛博朋克');
      expect(story.episodes).toBe(3);
      expect(story.structure.act1_setup).toBeDefined();
      expect(story.structure.act2_confrontation).toBeDefined();
      expect(story.structure.act3_resolution).toBeDefined();
      expect(story.episodes_plan.length).toBe(3);
    });

    it('应该生成三幕式结构', () => {
      const story = StoryPlanner.plan({
        theme: '测试故事',
      });

      expect(story.structure.act1_setup.keyEvents.length).toBeGreaterThan(0);
      expect(story.structure.act2_confrontation.keyEvents.length).toBeGreaterThan(0);
      expect(story.structure.act3_resolution.keyEvents.length).toBeGreaterThan(0);
    });

    it('应该生成世界观设定', () => {
      const story = StoryPlanner.plan({
        theme: '测试',
        type: '科幻',
      });

      expect(story.worldBuilding.era).toBeDefined();
      expect(story.worldBuilding.location).toBeDefined();
      expect(story.worldBuilding.rules.length).toBeGreaterThan(0);
    });
  });
});

// 集成测试示例（需要真实 API Key）
describe.skip('集成测试', () => {
  it('应该能够提交生成任务', async () => {
    const apiKey = process.env.VOLCENGINE_ARK_API_KEY;
    if (!apiKey) {
      console.log('跳过集成测试：缺少 API Key');
      return;
    }

    // 这里可以添加实际的视频生成测试
    expect(apiKey).toBeDefined();
  }, 30000);
});
