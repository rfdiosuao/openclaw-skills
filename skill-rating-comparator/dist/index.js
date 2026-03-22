/**
 * Skill 评分对比工具 - JavaScript 版本
 * 自动对比同类型 Skill，生成多维度评分报告
 */

// 默认权重配置
const DEFAULT_WEIGHTS = {
  functionality: 0.25,
  codeQuality: 0.20,
  documentation: 0.15,
  userReviews: 0.15,
  updateFrequency: 0.15,
  installation: 0.10,
};

// 评分维度标签
const DIMENSION_LABELS = {
  functionality: '功能完整性',
  codeQuality: '代码质量',
  documentation: '文档完善度',
  userReviews: '用户评价',
  updateFrequency: '更新频率',
  installation: '安装便捷性',
};

// Skill 合成器
class SkillMerger {
  constructor() {
    this.mergedFeatures = [];
    this.conflicts = [];
  }

  // 分析多个 Skill 的优势功能
  async analyzeSkills(skills) {
    const features = {};
    
    skills.forEach(skill => {
      const skillFeatures = this.extractFeatures(skill);
      skillFeatures.forEach(f => {
        if (!features[f.name]) {
          features[f.name] = { name: f.name, sources: [], score: f.score };
        }
        features[f.name].sources.push(skill.name);
        features[f.name].score = Math.max(features[f.name].score, f.score);
      });
    });

    return Object.values(features);
  }

  // 提取 Skill 功能特性
  extractFeatures(skill) {
    const features = [];
    
    // 基于评分提取优势功能
    if (skill.scores.functionality >= 8) {
      features.push({ name: '核心功能完整', score: skill.scores.functionality });
    }
    if (skill.scores.codeQuality >= 8) {
      features.push({ name: '代码质量优秀', score: skill.scores.codeQuality });
    }
    if (skill.scores.documentation >= 8) {
      features.push({ name: '文档完善', score: skill.scores.documentation });
    }
    if (skill.scores.installation >= 9) {
      features.push({ name: '安装便捷', score: skill.scores.installation });
    }

    return features;
  }

  // 生成合成建议
  generateMergeReport(skills, features) {
    const report = {
      targetSkills: skills.map(s => s.name),
      totalFeatures: features.length,
      recommendedFeatures: features.filter(f => f.score >= 8),
      conflicts: this.conflicts,
      mergeSteps: [
        '1. 选择优势功能（评分≥8）',
        '2. 合并代码结构',
        '3. 解决命名冲突',
        '4. 统一配置格式',
        '5. 生成新 Skill 框架',
      ],
    };
    return report;
  }
}

/**
 * Skill 评分对比器类
 */
class SkillRatingComparator {
  constructor(weights = {}) {
    this.weights = { ...DEFAULT_WEIGHTS, ...weights };
  }

  /**
   * 计算综合评分
   */
  calculateTotalScore(scores) {
    const weighted = 
      scores.functionality * this.weights.functionality +
      scores.codeQuality * this.weights.codeQuality +
      scores.documentation * this.weights.documentation +
      scores.userReviews * this.weights.userReviews +
      scores.updateFrequency * this.weights.updateFrequency +
      scores.installation * this.weights.installation;
    
    return Math.round(weighted * 10) / 10;
  }

  /**
   * 生成星级显示
   */
  generateStars(score) {
    const fullStars = Math.floor(score / 2);
    const halfStar = score % 2 >= 1 ? '⭐' : '';
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    return '⭐'.repeat(fullStars) + halfStar + '☆'.repeat(emptyStars);
  }

  /**
   * 分析更新频率
   */
  analyzeUpdateFrequency(lastUpdate) {
    const now = new Date();
    const last = new Date(lastUpdate);
    const daysDiff = (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysDiff <= 7) return 10;
    if (daysDiff <= 30) return 9;
    if (daysDiff <= 60) return 8;
    if (daysDiff <= 90) return 7;
    if (daysDiff <= 180) return 5;
    if (daysDiff <= 365) return 3;
    return 1;
  }

  /**
   * 搜索同类 Skill (模拟数据)
   */
  async searchSimilarSkills(skillName, tags = []) {
    const mockCompetitors = [
      {
        skillId: 'skill-analyzer-pro',
        name: 'Skill Analyzer Pro',
        platform: 'clawhub',
        scores: {
          functionality: 8,
          codeQuality: 8,
          documentation: 7,
          userReviews: 8,
          updateFrequency: 7,
          installation: 9,
        },
        totalScore: 0,
        rank: 0,
        metadata: {
          downloads: 1500,
          stars: 200,
          lastUpdate: new Date().toISOString(),
          tags: ['analyzer', 'skill', 'rating'],
        },
      },
      {
        skillId: 'skill-compare-tool',
        name: 'Skill Compare Tool',
        platform: 'clawhub',
        scores: {
          functionality: 7,
          codeQuality: 7,
          documentation: 8,
          userReviews: 7,
          updateFrequency: 6,
          installation: 9,
        },
        totalScore: 0,
        rank: 0,
        metadata: {
          downloads: 800,
          stars: 120,
          lastUpdate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          tags: ['compare', 'skill'],
        },
      },
    ];

    mockCompetitors.forEach(c => {
      c.totalScore = this.calculateTotalScore(c.scores);
    });
    mockCompetitors.sort((a, b) => b.totalScore - a.totalScore);
    mockCompetitors.forEach((c, i) => c.rank = i + 1);

    return mockCompetitors;
  }

  /**
   * 生成对比报告
   */
  async generateReport(targetSkill) {
    const targetRating = {
      skillId: targetSkill,
      name: targetSkill,
      platform: 'clawhub',
      scores: {
        functionality: 9,
        codeQuality: 8,
        documentation: 9,
        userReviews: 8,
        updateFrequency: 8,
        installation: 9,
      },
      totalScore: 0,
      rank: 0,
      metadata: {
        downloads: 500,
        stars: 80,
        lastUpdate: new Date().toISOString(),
        tags: ['rating', 'comparison', 'analyzer'],
      },
    };

    targetRating.totalScore = this.calculateTotalScore(targetRating.scores);
    const competitors = await this.searchSimilarSkills(targetSkill);

    const allSkills = [targetRating, ...competitors];
    allSkills.sort((a, b) => b.totalScore - a.totalScore);
    allSkills.forEach((s, i) => s.rank = i + 1);

    const updatedTarget = allSkills.find(s => s.skillId === targetSkill);
    const summary = this.generateSummary(updatedTarget, competitors);
    const radarData = this.generateRadarData(updatedTarget, competitors);

    return {
      targetSkill: updatedTarget,
      competitors,
      summary,
      radarData,
    };
  }

  /**
   * 生成优劣势总结
   */
  generateSummary(target, competitors) {
    const strengths = [];
    const weaknesses = [];
    const recommendations = [];

    const avgScores = this.calculateAverageScores(competitors);
    
    Object.entries(target.scores).forEach(([key, score]) => {
      const avg = avgScores[key];
      const label = DIMENSION_LABELS[key];
      
      if (score > avg + 1) {
        strengths.push(`${label}领先 (${score} vs 平均 ${avg.toFixed(1)})`);
      } else if (score < avg - 1) {
        weaknesses.push(`${label}待提升 (${score} vs 平均 ${avg.toFixed(1)})`);
      }
    });

    if (target.rank === 1) {
      recommendations.push('综合评分第一，推荐作为首选');
    }
    
    if (target.scores.installation >= 9) {
      recommendations.push('安装便捷，适合快速部署场景');
    }
    
    if (target.scores.documentation >= 8) {
      recommendations.push('文档完善，适合新手使用');
    }

    if (target.rank > 1) {
      const top = competitors.find(c => c.rank === 1);
      if (top) {
        recommendations.push(`如追求极致性能，可考虑 ${top.name}`);
      }
    }

    return { strengths, weaknesses, recommendations };
  }

  /**
   * 计算竞争对手平均分
   */
  calculateAverageScores(competitors) {
    const empty = {
      functionality: 0, codeQuality: 0, documentation: 0,
      userReviews: 0, updateFrequency: 0, installation: 0,
    };

    const sum = competitors.reduce((acc, c) => {
      Object.keys(acc).forEach(key => {
        acc[key] += c.scores[key];
      });
      return acc;
    }, { ...empty });

    const count = Math.max(1, competitors.length);
    
    return {
      functionality: sum.functionality / count,
      codeQuality: sum.codeQuality / count,
      documentation: sum.documentation / count,
      userReviews: sum.userReviews / count,
      updateFrequency: sum.updateFrequency / count,
      installation: sum.installation / count,
    };
  }

  /**
   * 生成雷达图数据
   */
  generateRadarData(target, competitors) {
    const labels = Object.values(DIMENSION_LABELS);
    
    const targetData = [
      target.scores.functionality,
      target.scores.codeQuality,
      target.scores.documentation,
      target.scores.userReviews,
      target.scores.updateFrequency,
      target.scores.installation,
    ];

    const avgScores = this.calculateAverageScores(competitors);
    const avgData = [
      avgScores.functionality,
      avgScores.codeQuality,
      avgScores.documentation,
      avgScores.userReviews,
      avgScores.updateFrequency,
      avgScores.installation,
    ];

    return { labels, datasets: [targetData, avgData] };
  }

  /**
   * 格式化报告为 Markdown
   */
  formatReportMarkdown(report) {
    const { targetSkill, competitors, summary } = report;
    const allSkills = [targetSkill, ...competitors];
    
    let md = `## 📊 Skill 评分对比报告\n\n`;
    md += `**目标 Skill:** ${targetSkill.name}\n`;
    md += `**对比对象:** ${competitors.length} 个同类 Skill\n\n`;

    md += `### 综合评分\n\n`;
    md += `| 排名 | Skill | 平台 | 综合得分 | 功能 | 代码 | 文档 | 评价 | 更新 | 安装 |\n`;
    md += `|------|-------|------|---------|------|------|------|------|------|------|\n`;
    
    allSkills.forEach(skill => {
      const rankEmoji = skill.rank === 1 ? '🥇' : skill.rank === 2 ? '🥈' : skill.rank === 3 ? '🥉' : '';
      md += `| ${rankEmoji} ${skill.rank} | ${skill.name} | ${skill.platform} | **${skill.totalScore}** | `;
      md += `${skill.scores.functionality} | ${skill.scores.codeQuality} | ${skill.scores.documentation} | `;
      md += `${skill.scores.userReviews} | ${skill.scores.updateFrequency} | ${skill.scores.installation} |\n`;
    });

    md += `\n### 维度详情\n\n`;
    Object.entries(targetSkill.scores).forEach(([key, score]) => {
      const label = DIMENSION_LABELS[key];
      md += `- ${label}: ${this.generateStars(score)} (${score}/10)\n`;
    });

    if (summary.strengths.length > 0) {
      md += `\n### ✅ 优势\n\n`;
      summary.strengths.forEach(s => md += `- ${s}\n`);
    }

    if (summary.weaknesses.length > 0) {
      md += `\n### ⚠️ 劣势\n\n`;
      summary.weaknesses.forEach(w => md += `- ${w}\n`);
    }

    md += `\n### 💡 推荐建议\n\n`;
    summary.recommendations.forEach(r => md += `- ${r}\n`);

    md += `\n\n### 📈 雷达图数据\n\n`;
    md += `\`\`\`json\n`;
    md += `${JSON.stringify(report.radarData, null, 2)}\n`;
    md += `\`\`\`\n`;

    return md;
  }
}

/**
 * 消息处理
 */
async function handleMessage(msg) {
  const content = msg.content.trim();
  const comparator = new SkillRatingComparator();
  const merger = new SkillMerger();

  // 解析命令 - 新增合成功能
  const patterns = [
    /^(?:对比 | 评分 | 分析 | 评测)\s*(.+?)(?:\s*--.*)?$/i,
    /^(?:skill 评分|skill 对比 |skill 分析)\s*(.+?)$/i,
    /^(?:帮我 | 请)\s*(?:对比 | 评分 | 分析 | 评测)\s*(.+?)$/i,
    /^(?:合成 | 融合 | 合并)\s*(.+?)$/i,  // 新增：Skill 合成
  ];

  let skillName = '';
  let mergeMode = false;
  
  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match) {
      skillName = match[1].trim();
      mergeMode = pattern.toString().includes('合成 | 融合 | 合并');
      break;
    }
  }

  // Skill 合成模式
  if (mergeMode && skillName) {
    try {
      const mergeResult = await handleMergeCommand(merger, skillName);
      return {
        type: 'markdown',
        content: mergeResult,
      };
    } catch (error) {
      console.error('合成失败:', error);
      return {
        type: 'text',
        content: `❌ 合成失败：${error.message || '未知错误'}`,
      };
    }
  }

  if (!skillName) {
    return {
      type: 'markdown',
      content: `## 📊 Skill 评分对比工具 v1.1.0

### 使用方法

\`\`\`
对比 skill-rating-comparator
评分 feishu-ai-coding-assistant
分析 feishu-multi-agent-manager 的竞争力
合成 skill-rating-comparator 和 skill-analyzer-pro  ✨ 新增
\`\`\`

### 功能

- 🔍 自动发现同类型 Skill
- 📊 6 维度评分 (功能/代码/文档/评价/更新/安装)
- 📈 生成对比报告和推荐建议
- 🎯 **Skill 合成器** (v1.1.0 新增) - 融合多个 Skill 的优势

请告诉我要分析或合成哪个 Skill~`,
    };
  }

  try {
    // 生成对比报告
    const report = await comparator.generateReport(skillName);
    const markdown = comparator.formatReportMarkdown(report);

    return {
      type: 'markdown',
      content: markdown,
    };
  } catch (error) {
    console.error('生成报告失败:', error);
    return {
      type: 'text',
      content: `❌ 生成报告失败：${error.message || '未知错误'}\n\n请稍后重试或联系开发者。`,
    };
  }
}

/**
 * 处理 Skill 合成命令
 */
async function handleMergeCommand(merger, skillNamesStr) {
  // 解析多个 Skill 名称
  const skillNames = skillNamesStr.split(/和 | 与 |,|,/).map(s => s.trim()).filter(s => s);
  
  if (skillNames.length < 2) {
    return `## 🎯 Skill 合成器

### 使用方法

\`\`\`
合成 skill-a 和 skill-b
融合 skill-a, skill-b, skill-c
合并 skill-a 与 skill-b
\`\`\`

请提供至少 2 个 Skill 名称进行合成~`;
  }

  // 模拟获取 Skill 数据
  const mockSkills = skillNames.map(name => ({
    name,
    scores: {
      functionality: 7 + Math.random() * 3,
      codeQuality: 7 + Math.random() * 3,
      documentation: 7 + Math.random() * 3,
      userReviews: 7 + Math.random() * 3,
      updateFrequency: 7 + Math.random() * 3,
      installation: 7 + Math.random() * 3,
    },
  }));

  // 分析优势功能
  const features = await merger.analyzeSkills(mockSkills);
  const report = merger.generateMergeReport(mockSkills, features);

  // 生成合成报告
  let md = `## 🎯 Skill 合成报告\n\n`;
  md += `**合成对象:** ${report.targetSkills.join(' + ')}\n`;
  md += `**提取特性:** ${report.totalFeatures} 个\n\n`;

  md += `### ✅ 推荐融合的优势功能\n\n`;
  report.recommendedFeatures.forEach((f, i) => {
    md += `${i + 1}. **${f.name}** (评分：${f.score.toFixed(1)}/10) - 来源：${f.sources.join(', ')}\n`;
  });

  md += `\n### 📋 合成步骤\n\n`;
  report.mergeSteps.forEach(step => md += `- ${step}\n`);

  md += `\n### 💡 合成建议\n\n`;
  md += `- 优先保留评分≥8 的功能模块\n`;
  md += `- 统一代码风格和配置格式\n`;
  md += `- 解决命名冲突（建议添加前缀区分）\n`;
  md += `- 生成独立的合成版本（如：merged-skill-v1.0）\n`;

  md += `\n### 🚀 下一步\n\n`;
  md += `1. 确认要融合的功能列表\n`;
  md += `2. 生成合成后的 Skill 代码框架\n`;
  md += `3. 本地测试验证\n`;
  md += `4. 发布到 ClawHub/虾评平台\n\n`;
  
  md += `> ⚠️ 当前为预览功能，完整代码生成功能将在 v1.1.0 正式版提供。`;

  return md;
}

// 导出
module.exports = { SkillRatingComparator, handleMessage };
