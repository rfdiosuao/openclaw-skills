/**
 * Skill 优化管理器
 * 
 * 功能：
 * 1. 扫描工作区内所有 Skill
 * 2. 分析每个 Skill 的行数、大小、功能
 * 3. 识别可合并/删除的 Skill
 * 4. 生成优化建议报告
 * 5. 确保 Skill 上下文占用 ≤ 30 行
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// Skill 目录配置
const SKILL_DIRS = [
  '/home/node/.openclaw/extensions/feishu-openclaw-plugin/skills',
  '/home/node/.openclaw/workspace/skills',
  '/home/node/.openclaw/skills'
];

// Skill 分类标准
const CONTEXT_BUDGET = 30; // 每个 Skill 平均行数预算
const MAX_TOTAL_LINES = 600; // 总行数预算

interface SkillInfo {
  name: string;
  path: string;
  lines: number;
  size: number;
  sizeFormatted: string;
  description: string;
  category: 'A' | 'B' | 'C' | 'D'; // A=核心，B=合并，C=低频，D=删除
  reason: string;
}

interface OptimizationReport {
  timestamp: string;
  totalSkills: number;
  totalLines: number;
  totalSize: number;
  skills: SkillInfo[];
  recommendations: {
    keep: SkillInfo[];
    merge: { groups: MergeGroup[] };
    remove: SkillInfo[];
    optimize: SkillInfo[];
  };
  summary: {
    afterOptimization: {
      totalSkills: number;
      totalLines: number;
      savedLines: number;
      savedPercent: number;
    };
  };
}

interface MergeGroup {
  name: string;
  skills: string[];
  newSkillName: string;
  savedLines: number;
}

/**
 * 扫描所有 Skill
 */
export function scanSkills(): SkillInfo[] {
  const skills: SkillInfo[] = [];

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

      // 提取 description
      const descMatch = content.match(/description:\s*\|?\n?\s*([^\n]+)/);
      const description = descMatch ? descMatch[1].trim() : '无描述';

      // 初步分类
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

/**
 * 分类 Skill
 */
function categorizeSkill(name: string, lines: number, description: string): { category: 'A' | 'B' | 'C' | 'D', reason: string } {
  // D 类 - 可删除
  if (name.includes('test') || name.includes('temp') || name.includes('deprecated')) {
    return { category: 'D', reason: '测试/临时/废弃 Skill' };
  }

  if (name.includes('template') || name.includes('example')) {
    return { category: 'D', reason: '模板/示例 Skill，非生产必需' };
  }

  // A 类 - 核心必备（行数少且功能关键）
  if (lines <= 50 && (
    name.includes('channel') ||
    name.includes('rules') ||
    name.includes('troubleshoot') ||
    name.includes('preference')
  )) {
    return { category: 'A', reason: '核心配置/规则，必需保留' };
  }

  // C 类 - 低频可选（特定功能）
  if (name.includes('image-gen') || 
      name.includes('memos') ||
      name.includes('taobao') ||
      name.includes('volc') ||
      name.includes('frontend')) {
    return { category: 'C', reason: '特定场景功能，低频使用' };
  }

  // B 类 - 功能合并（行数过多或功能重叠）
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

  // 默认保留
  return { category: 'A', reason: '功能独立，保留' };
}

/**
 * 识别可合并的 Skill 组
 */
function findMergeGroups(skills: SkillInfo[]): MergeGroup[] {
  const groups: MergeGroup[] = [];

  // 飞书文档组
  const docSkills = skills.filter(s => 
    s.name.includes('create-doc') || 
    s.name.includes('update-doc') || 
    s.name.includes('fetch-doc')
  );
  if (docSkills.length >= 2) {
    const totalLines = docSkills.reduce((sum, s) => sum + s.lines, 0);
    groups.push({
      name: '飞书文档管理组',
      skills: docSkills.map(s => s.name),
      newSkillName: 'feishu-doc-manager',
      savedLines: Math.floor(totalLines * 0.6) // 预估节省 60%
    });
  }

  // 飞书 IM 组
  const imSkills = skills.filter(s => 
    s.name.includes('im-read') || 
    s.name.includes('im-write') ||
    s.name.includes('im-search')
  );
  if (imSkills.length >= 2) {
    const totalLines = imSkills.reduce((sum, s) => sum + s.lines, 0);
    groups.push({
      name: '飞书 IM 管理组',
      skills: imSkills.map(s => s.name),
      newSkillName: 'feishu-im-manager',
      savedLines: Math.floor(totalLines * 0.5)
    });
  }

  // GitHub 相关
  const githubSkills = skills.filter(s => 
    s.name.includes('github') ||
    s.name.includes('git')
  );
  if (githubSkills.length >= 2) {
    const totalLines = githubSkills.reduce((sum, s) => sum + s.lines, 0);
    groups.push({
      name: 'GitHub 管理组',
      skills: githubSkills.map(s => s.name),
      newSkillName: 'github-manager',
      savedLines: Math.floor(totalLines * 0.5)
    });
  }

  return groups;
}

/**
 * 生成优化报告
 */
export function generateReport(skills: SkillInfo[]): OptimizationReport {
  const totalLines = skills.reduce((sum, s) => sum + s.lines, 0);
  const totalSize = skills.reduce((sum, s) => sum + s.size, 0);

  const mergeGroups = findMergeGroups(skills);

  const keep = skills.filter(s => s.category === 'A');
  const remove = skills.filter(s => s.category === 'D');
  const optimize = skills.filter(s => s.category === 'B' && s.lines > 100);

  // 计算优化后的数据
  const mergeSavedLines = mergeGroups.reduce((sum, g) => sum + g.savedLines, 0);
  const removeLines = remove.reduce((sum, s) => sum + s.lines, 0);
  const optimizeLines = optimize.reduce((sum, s) => sum + Math.floor(s.lines * 0.8), 0); // 预估优化掉 80%

  const afterTotalLines = totalLines - mergeSavedLines - removeLines - optimizeLines;
  const savedLines = totalLines - afterTotalLines;

  return {
    timestamp: new Date().toISOString(),
    totalSkills: skills.length,
    totalLines,
    totalSize,
    skills,
    recommendations: {
      keep,
      merge: { groups: mergeGroups },
      remove,
      optimize
    },
    summary: {
      afterOptimization: {
        totalSkills: keep.length + mergeGroups.length,
        totalLines: afterTotalLines,
        savedLines,
        savedPercent: Math.round((savedLines / totalLines) * 100)
      }
    }
  };
}

/**
 * 格式化大小
 */
function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}K`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}M`;
}

/**
 * 打印报告（控制台输出）
 */
export function printReport(report: OptimizationReport): string {
  let output = '';

  output += '# 📊 Skill 优化报告\n\n';
  output += `**生成时间:** ${new Date(report.timestamp).toLocaleString('zh-CN')}\n\n`;

  output += '## 📈 当前状态\n\n';
  output += `| 指标 | 数值 |\n`;
  output += `|------|------|\n`;
  output += `| Skill 总数 | ${report.totalSkills} 个 |\n`;
  output += `| 总行数 | ${report.totalLines.toLocaleString()} 行 |\n`;
  output += `| 总大小 | ${formatSize(report.totalSize)} |\n`;
  output += `| 上下文占用估算 | ~${Math.round(report.totalLines * 50 / 1024)}K tokens |\n\n`;

  output += '## 🎯 优化方案\n\n';

  // 🔴 立即删除
  if (report.recommendations.remove.length > 0) {
    output += '### 🔴 建议删除\n\n';
    output += '| Skill | 行数 | 原因 |\n';
    output += '|-------|------|------|\n';
    for (const skill of report.recommendations.remove) {
      output += `| ${skill.name} | ${skill.lines}行 | ${skill.reason} |\n`;
    }
    output += '\n';
  }

  // 🟡 建议合并
  if (report.recommendations.merge.groups.length > 0) {
    output += '### 🟡 建议合并\n\n';
    output += '| 合并组 | 原 Skills | 新 Skill | 节省行数 |\n';
    output += '|--------|----------|---------|----------|\n';
    for (const group of report.recommendations.merge.groups) {
      output += `| ${group.name} | ${group.skills.join(' + ')} | ${group.newSkillName} | -${group.savedLines}行 |\n`;
    }
    output += '\n';
  }

  // 🟠 需要精简
  if (report.recommendations.optimize.length > 0) {
    output += '### 🟠 需要精简\n\n';
    output += '| Skill | 当前行数 | 目标行数 | 操作 |\n';
    output += '|-------|----------|----------|------|\n';
    for (const skill of report.recommendations.optimize) {
      const target = Math.min(50, Math.floor(skill.lines * 0.2));
      output += `| ${skill.name} | ${skill.lines}行 | ${target}行 | 精简 ${Math.round((1 - target/skill.lines) * 100)}% |\n`;
    }
    output += '\n';
  }

  // 🟢 保留
  output += '### 🟢 保留（已优化）\n\n';
  output += '| Skill | 行数 | 分类 | 理由 |\n';
  output += '|-------|------|------|------|\n';
  for (const skill of report.recommendations.keep.slice(0, 10)) { // 只显示前 10 个
    output += `| ${skill.name} | ${skill.lines}行 | ${skill.category}类 | ${skill.reason} |\n`;
  }
  if (report.recommendations.keep.length > 10) {
    output += `| ... | 还有 ${report.recommendations.keep.length - 10} 个 | - | - |\n`;
  }
  output += '\n';

  // 预期效果
  output += '## ✅ 预期效果\n\n';
  output += `| 指标 | 优化前 | 优化后 | 变化 |\n`;
  output += `|------|--------|--------|------|\n`;
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
  output += `**30 行原则:** 每个 Skill 平均占用 ≤ 30 行，总占用 ≤ 600 行，剩余上下文留给用户对话。\n`;

  return output;
}

// 主函数
export async function main(): Promise<void> {
  console.log('⚡ Skill 优化管理器启动...\n');

  // 扫描
  console.log('📊 扫描工作区 Skill...');
  const skills = scanSkills();
  console.log(`发现 ${skills.length} 个 Skill\n`);

  // 生成报告
  console.log('📝 生成优化报告...');
  const report = generateReport(skills);

  // 输出
  const output = printReport(report);
  console.log('\n' + output);

  // 保存报告
  const reportPath = '/home/node/.openclaw/workspace/skill-optimization-report.md';
  fs.writeFileSync(reportPath, output, 'utf-8');
  console.log(`\n💾 报告已保存：${reportPath}`);
}

// CLI 入口
if (require.main === module) {
  main().catch(console.error);
}
