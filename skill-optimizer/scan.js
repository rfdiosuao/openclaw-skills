#!/usr/bin/env node

/**
 * Skill 优化管理器 - 简化版（直接 JS 运行）
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const SKILL_DIRS = [
  '/home/node/.openclaw/extensions/feishu-openclaw-plugin/skills',
  '/home/node/.openclaw/workspace/skills',
  '/home/node/.openclaw/skills'
];

const CONTEXT_BUDGET = 30;
const MAX_TOTAL_LINES = 600;

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}K`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}M`;
}

function categorizeSkill(name, lines, description) {
  if (name.includes('test') || name.includes('temp') || name.includes('deprecated')) {
    return { category: 'D', reason: '测试/临时/废弃 Skill' };
  }
  if (name.includes('template') || name.includes('example')) {
    return { category: 'D', reason: '模板/示例 Skill，非生产必需' };
  }
  if (lines <= 50 && (name.includes('channel') || name.includes('rules') || name.includes('troubleshoot') || name.includes('preference'))) {
    return { category: 'A', reason: '核心配置/规则，必需保留' };
  }
  if (name.includes('image-gen') || name.includes('memos') || name.includes('taobao') || name.includes('volc') || name.includes('frontend')) {
    return { category: 'C', reason: '特定场景功能，低频使用' };
  }
  if (lines > 200) {
    return { category: 'B', reason: `行数过多 (${lines}行)，需精简或合并` };
  }
  if (name.includes('create-doc') || name.includes('update-doc') || name.includes('fetch-doc')) {
    return { category: 'B', reason: '文档操作类，可合并为 feishu-doc-manager' };
  }
  if (name.includes('bitable') || name.includes('sheet') || name.includes('table')) {
    return { category: 'B', reason: '表格操作类，可合并为 feishu-table-manager' };
  }
  if (name.includes('calendar') || name.includes('event') || name.includes('schedule')) {
    return { category: 'B', reason: '日历操作类，可合并为 feishu-calendar-manager' };
  }
  if (name.includes('task') || name.includes('todo')) {
    return { category: 'B', reason: '任务管理类，可合并为 feishu-task-manager' };
  }
  return { category: 'A', reason: '功能独立，保留' };
}

function scanSkills() {
  const skills = [];
  for (const dir of SKILL_DIRS) {
    if (!fs.existsSync(dir)) continue;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const skillPath = path.join(dir, entry.name);
      const skillMdPath = path.join(skillPath, 'SKILL.md');
      if (!fs.existsSync(skillMdPath)) continue;
      const content = fs.readFileSync(skillMdPath, 'utf-8');
      const lines = content.split('\n').length;
      const size = fs.statSync(skillMdPath).size;
      const descMatch = content.match(/description:\s*\|?\n?\s*([^\n]+)/);
      const description = descMatch ? descMatch[1].trim() : '无描述';
      const category = categorizeSkill(entry.name, lines, description);
      skills.push({
        name: entry.name,
        path: skillPath,
        lines,
        size,
        sizeFormatted: formatSize(size),
        description,
        category: category.category,
        reason: category.reason
      });
    }
  }
  return skills.sort((a, b) => b.lines - a.lines);
}

function findMergeGroups(skills) {
  const groups = [];
  const docSkills = skills.filter(s => s.name.includes('create-doc') || s.name.includes('update-doc') || s.name.includes('fetch-doc'));
  if (docSkills.length >= 2) {
    const totalLines = docSkills.reduce((sum, s) => sum + s.lines, 0);
    groups.push({ name: '飞书文档管理组', skills: docSkills.map(s => s.name), newSkillName: 'feishu-doc-manager', savedLines: Math.floor(totalLines * 0.6) });
  }
  const imSkills = skills.filter(s => s.name.includes('im-read') || s.name.includes('im-write') || s.name.includes('im-search'));
  if (imSkills.length >= 2) {
    const totalLines = imSkills.reduce((sum, s) => sum + s.lines, 0);
    groups.push({ name: '飞书 IM 管理组', skills: imSkills.map(s => s.name), newSkillName: 'feishu-im-manager', savedLines: Math.floor(totalLines * 0.5) });
  }
  return groups;
}

function generateReport(skills) {
  const totalLines = skills.reduce((sum, s) => sum + s.lines, 0);
  const totalSize = skills.reduce((sum, s) => sum + s.size, 0);
  const mergeGroups = findMergeGroups(skills);
  const keep = skills.filter(s => s.category === 'A');
  const remove = skills.filter(s => s.category === 'D');
  const optimize = skills.filter(s => s.category === 'B' && s.lines > 100);
  const mergeSavedLines = mergeGroups.reduce((sum, g) => sum + g.savedLines, 0);
  const removeLines = remove.reduce((sum, s) => sum + s.lines, 0);
  const optimizeLines = optimize.reduce((sum, s) => sum + Math.floor(s.lines * 0.8), 0);
  const afterTotalLines = totalLines - mergeSavedLines - removeLines - optimizeLines;
  const savedLines = totalLines - afterTotalLines;
  return {
    timestamp: new Date().toISOString(),
    totalSkills: skills.length,
    totalLines,
    totalSize,
    skills,
    recommendations: { keep, merge: { groups: mergeGroups }, remove, optimize },
    summary: { afterOptimization: { totalSkills: keep.length + mergeGroups.length, totalLines: afterTotalLines, savedLines, savedPercent: Math.round((savedLines / totalLines) * 100) } }
  };
}

function printReport(report) {
  let output = '';
  output += '# 📊 Skill 优化报告\n\n';
  output += `**生成时间:** ${new Date(report.timestamp).toLocaleString('zh-CN')}\n\n`;
  output += '## 📈 当前状态\n\n';
  output += '| 指标 | 数值 |\n|------|------|\n';
  output += `| Skill 总数 | ${report.totalSkills} 个 |\n`;
  output += `| 总行数 | ${report.totalLines.toLocaleString()} 行 |\n`;
  output += `| 总大小 | ${formatSize(report.totalSize)} |\n`;
  output += `| 上下文占用估算 | ~${Math.round(report.totalLines * 50 / 1024)}K tokens |\n\n`;
  output += '## 🎯 优化方案\n\n';
  if (report.recommendations.remove.length > 0) {
    output += '### 🔴 建议删除\n\n| Skill | 行数 | 原因 |\n|-------|------|------|\n';
    for (const skill of report.recommendations.remove) {
      output += `| ${skill.name} | ${skill.lines}行 | ${skill.reason} |\n`;
    }
    output += '\n';
  }
  if (report.recommendations.merge.groups.length > 0) {
    output += '### 🟡 建议合并\n\n| 合并组 | 原 Skills | 新 Skill | 节省行数 |\n|--------|----------|---------|----------|\n';
    for (const group of report.recommendations.merge.groups) {
      output += `| ${group.name} | ${group.skills.join(' + ')} | ${group.newSkillName} | -${group.savedLines}行 |\n`;
    }
    output += '\n';
  }
  if (report.recommendations.optimize.length > 0) {
    output += '### 🟠 需要精简\n\n| Skill | 当前行数 | 目标行数 | 操作 |\n|-------|----------|----------|------|\n';
    for (const skill of report.recommendations.optimize) {
      const target = Math.min(50, Math.floor(skill.lines * 0.2));
      output += `| ${skill.name} | ${skill.lines}行 | ${target}行 | 精简 ${Math.round((1 - target/skill.lines) * 100)}% |\n`;
    }
    output += '\n';
  }
  output += '### 🟢 保留（已优化）\n\n| Skill | 行数 | 分类 | 理由 |\n|-------|------|------|------|\n';
  for (const skill of report.recommendations.keep.slice(0, 10)) {
    output += `| ${skill.name} | ${skill.lines}行 | ${skill.category}类 | ${skill.reason} |\n`;
  }
  if (report.recommendations.keep.length > 10) {
    output += `| ... | 还有 ${report.recommendations.keep.length - 10} 个 | - | - |\n`;
  }
  output += '\n## ✅ 预期效果\n\n';
  output += '| 指标 | 优化前 | 优化后 | 变化 |\n|------|--------|--------|------|\n';
  output += `| Skill 总数 | ${report.totalSkills}个 | ${report.summary.afterOptimization.totalSkills}个 | -${report.totalSkills - report.summary.afterOptimization.totalSkills}个 |\n`;
  output += `| 总行数 | ${report.totalLines.toLocaleString()}行 | ${report.summary.afterOptimization.totalLines.toLocaleString()}行 | -${report.summary.afterOptimization.savedLines.toLocaleString()}行 |\n`;
  output += `| 上下文占用 | ~${Math.round(report.totalLines * 50 / 1024)}K tokens | ~${Math.round(report.summary.afterOptimization.totalLines * 50 / 1024)}K tokens | -${Math.round(report.summary.afterOptimization.savedLines * 50 / 1024)}K tokens |\n`;
  output += `| 精简比例 | - | - | **${report.summary.afterOptimization.savedPercent}%** |\n\n`;
  output += '## 📋 执行建议\n\n';
  output += '1. **先删除** D 类 Skill（测试/临时/废弃）\n';
  output += '2. **再合并** B 类 Skill（功能重叠组）\n';
  output += '3. **最后精简** 大文件 Skill（>200 行）\n';
  output += '4. **验证功能** 确保合并后功能完整\n';
  output += '5. **发布更新** 到 ClawHub\n\n';
  output += '---\n\n';
  output += '**30 行原则:** 每个 Skill 平均占用 ≤ 30 行，总占用 ≤ 600 行，剩余上下文留给用户对话。\n';
  return output;
}

// 主函数
console.log('⚡ Skill 优化管理器启动...\n');
console.log('📊 扫描工作区 Skill...');
const skills = scanSkills();
console.log(`发现 ${skills.length} 个 Skill\n`);
console.log('📝 生成优化报告...');
const report = generateReport(skills);
const output = printReport(report);
console.log('\n' + output);
const reportPath = '/home/node/.openclaw/workspace/skill-optimization-report.md';
fs.writeFileSync(reportPath, output, 'utf-8');
console.log(`\n💾 报告已保存：${reportPath}`);
