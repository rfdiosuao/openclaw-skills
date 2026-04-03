/**
 * 故事规划器
 * 生成三幕式结构、人物设定、世界观
 */

import { StoryPlan, StoryCommandArgs, ThreeActStructure, WorldBuilding, EpisodePlan } from '../types';
import { CharacterDNAManager } from './CharacterDNAManager';

export class StoryPlanner {
  /**
   * 规划完整故事
   */
  static plan(args: StoryCommandArgs): StoryPlan {
    const structure = this.generateThreeActStructure(args.theme, args.type);
    const worldBuilding = this.generateWorldBuilding(args.type, args.style);
    const episodes = this.generateEpisodes(args.theme, structure, args.episodes || 1);

    return {
      title: this.generateTitle(args.theme, args.type),
      logline: this.generateLogline(args.theme, args.type),
      type: args.type || '奇幻',
      style: args.style || '国漫',
      episodes: args.episodes || 1,
      durationPerEpisode: args.duration || 10,
      structure,
      characters: [], // 由角色设定命令补充
      worldBuilding,
      episodes_plan: episodes,
    };
  }

  /**
   * 生成三幕式结构
   */
  private static generateThreeActStructure(theme: string, type?: string): ThreeActStructure {
    return {
      act1_setup: {
        title: '第一幕：开端',
        description: `介绍${theme}的故事背景，主角登场，建立世界观，触发事件打破平静`,
        keyEvents: [
          '主角日常生活展示',
          '世界观初步揭示',
          '触发事件发生',
          '主角被迫踏上旅程',
        ],
      },
      act2_confrontation: {
        title: '第二幕：发展',
        description: '主角面临挑战，结识盟友，对抗敌人，能力成长，中点转折',
        keyEvents: [
          '第一次挑战/试炼',
          '结识重要盟友',
          '发现敌人阴谋',
          '中点重大转折',
          '最低谷时刻',
        ],
      },
      act3_resolution: {
        title: '第三幕：高潮与结局',
        description: '最终对决，主角成长完成，解决核心冲突，新的平衡建立',
        keyEvents: [
          '最终决战准备',
          '高潮对决',
          '核心冲突解决',
          '角色弧光完成',
          '新的平衡建立',
        ],
      },
    };
  }

  /**
   * 生成世界观设定
   */
  private static generateWorldBuilding(type?: string, style?: string): WorldBuilding {
    const worldTemplates: Record<string, Partial<WorldBuilding>> = {
      '武侠': {
        era: '古代架空王朝',
        location: '江湖武林',
        technology: '冷兵器时代',
        magic_system: '内功心法，轻功，点穴',
        social_structure: '门派林立，朝廷与江湖并存',
      },
      '科幻': {
        era: '近未来 2150 年',
        location: '赛博都市',
        technology: '人工智能，义体改造，全息投影',
        magic_system: undefined,
        social_structure: '巨型企业控制社会，贫富差距极端',
      },
      '奇幻': {
        era: '中世纪奇幻',
        location: '魔法大陆',
        technology: '魔法与冷兵器并存',
        magic_system: '元素魔法，召唤术，炼金术',
        social_structure: '王国制，贵族与平民，魔法师公会',
      },
      '悬疑': {
        era: '现代都市',
        location: '繁华都市',
        technology: '现代科技',
        magic_system: undefined,
        social_structure: '现代社会，警匪对立',
      },
    };

    const template = worldTemplates[type || '奇幻'];

    return {
      era: template.era || '架空时代',
      location: template.location || '未知大陆',
      rules: [
        '力量体系遵循等价交换原则',
        '每个选择都有代价',
        '真相往往隐藏在表象之下',
      ],
      technology: template.technology || '基础水平',
      magic_system: template.magic_system,
      social_structure: template.social_structure || '基础社会结构',
    };
  }

  /**
   * 生成分集规划
   */
  private static generateEpisodes(theme: string, structure: ThreeActStructure, episodes: number): EpisodePlan[] {
    const episodePlans: EpisodePlan[] = [];

    for (let i = 0; i < episodes; i++) {
      const actDistribution = this.distributeActs(episodes);
      const act = actDistribution[i];

      episodePlans.push({
        episode: i + 1,
        title: `第${i + 1}集：${this.generateEpisodeTitle(i, theme)}`,
        coreEvent: this.getActEvent(act, i),
        keyTwist: this.generateTwist(i, theme),
        climax: this.generateClimax(act, i),
        duration: 5,
      });
    }

    return episodePlans;
  }

  /**
   * 分配三幕到各集
   */
  private static distributeActs(episodes: number): ('act1' | 'act2' | 'act3')[] {
    const distribution: ('act1' | 'act2' | 'act3')[] = [];
    
    for (let i = 0; i < episodes; i++) {
      if (i < episodes * 0.25) {
        distribution.push('act1');
      } else if (i < episodes * 0.75) {
        distribution.push('act2');
      } else {
        distribution.push('act3');
      }
    }

    return distribution;
  }

  /**
   * 获取幕对应的核心事件
   */
  private static getActEvent(act: string, episodeIndex: number): string {
    const events = {
      act1: ['主角登场', '触发事件', '踏上旅程'],
      act2: ['第一次挑战', '结识盟友', '发现阴谋', '中点转折', '最低谷'],
      act3: ['最终准备', '高潮对决', '结局'],
    };

    const actEvents = events[act as keyof typeof events];
    return actEvents[episodeIndex % actEvents.length] || '关键事件';
  }

  /**
   * 生成集标题
   */
  private static generateEpisodeTitle(index: number, theme: string): string {
    const titles = [
      '序幕',
      '启程',
      '试炼',
      '盟友',
      '阴谋',
      '转折',
      '绝境',
      '觉醒',
      '决战',
      '终章',
    ];
    return titles[index] || `篇章${index + 1}`;
  }

  /**
   * 生成转折
   */
  private static generateTwist(index: number, theme: string): string {
    const twists = [
      '信任的人背叛',
      '发现惊人真相',
      '能力突然觉醒',
      '敌人另有其人',
      '目标完全错误',
    ];
    return twists[index % twists.length];
  }

  /**
   * 生成高潮
   */
  private static generateClimax(act: string, index: number): string {
    if (act === 'act3') {
      return '最终对决，主角战胜强敌';
    }
    return '阶段性高潮，为最终决战铺垫';
  }

  /**
   * 生成标题
   */
  private static generateTitle(theme: string, type?: string): string {
    const prefixes = {
      '武侠': ['剑', '刀', '侠', '影', '风'],
      '科幻': ['机械', '量子', '霓虹', '代码', '芯片'],
      '奇幻': ['魔法', '龙', '水晶', '命运', '星辰'],
      '悬疑': ['迷雾', '真相', '秘密', '记忆', '谎言'],
    };

    const prefix = prefixes[type || '奇幻'][Math.floor(Math.random() * 5)];
    return `${prefix}: ${theme}`;
  }

  /**
   * 生成 Logline
   */
  private static generateLogline(theme: string, type?: string): string {
    return `在${type || '奇幻'}世界中，${theme}，主角必须面对内心恐惧，完成成长蜕变。`;
  }
}
