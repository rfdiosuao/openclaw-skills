/**
 * Skill 优化管理器测试
 */

import { describe, it, expect } from 'vitest';
import { scanSkills, generateReport, printReport } from '../src/index';

describe('Skill Optimizer', () => {
  it('should scan skills successfully', () => {
    const skills = scanSkills();
    expect(skills).toBeInstanceOf(Array);
    expect(skills.length).toBeGreaterThan(0);
    
    // 验证每个 Skill 都有必要的字段
    for (const skill of skills) {
      expect(skill.name).toBeDefined();
      expect(skill.path).toBeDefined();
      expect(skill.lines).toBeGreaterThan(0);
      expect(skill.size).toBeGreaterThan(0);
      expect(skill.category).toMatch(/^[A-D]$/);
    }
  });

  it('should generate optimization report', () => {
    const skills = scanSkills();
    const report = generateReport(skills);

    expect(report).toBeDefined();
    expect(report.totalSkills).toBe(skills.length);
    expect(report.totalLines).toBeGreaterThan(0);
    expect(report.recommendations).toBeDefined();
    expect(report.summary).toBeDefined();
  });

  it('should print report in markdown format', () => {
    const skills = scanSkills();
    const report = generateReport(skills);
    const output = printReport(report);

    expect(output).toContain('# 📊 Skill 优化报告');
    expect(output).toContain('## 📈 当前状态');
    expect(output).toContain('## 🎯 优化方案');
    expect(output).toContain('## ✅ 预期效果');
    expect(output).toContain('30 行原则');
  });

  it('should categorize skills correctly', () => {
    const skills = scanSkills();
    
    // 验证分类逻辑
    const categoryA = skills.filter(s => s.category === 'A');
    const categoryB = skills.filter(s => s.category === 'B');
    const categoryC = skills.filter(s => s.category === 'C');
    const categoryD = skills.filter(s => s.category === 'D');

    expect(categoryA.length + categoryB.length + categoryC.length + categoryD.length)
      .toBe(skills.length);
  });

  it('should identify merge opportunities', () => {
    const skills = scanSkills();
    const report = generateReport(skills);

    // 应该能识别出飞书文档组的合并机会
    const docMerge = report.recommendations.merge.groups.find(
      g => g.name.includes('文档')
    );
    
    // 如果存在文档类 Skill，应该能识别合并机会
    const hasDocSkills = skills.some(s => 
      s.name.includes('create-doc') || 
      s.name.includes('update-doc') || 
      s.name.includes('fetch-doc')
    );

    if (hasDocSkills) {
      expect(docMerge).toBeDefined();
    }
  });
});
