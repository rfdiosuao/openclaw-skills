/**
 * context-monitor - 上下文使用率监控 Skill
 * 
 * 实时监控会话上下文使用率，在消息底部显示占用百分比
 * 超过阈值时提醒用户使用 /new 或 /compact
 */

interface ContextMonitorConfig {
  warningThreshold: number;      // 警告阈值（百分比）
  criticalThreshold: number;     // 严重警告阈值（百分比）
  showProgressBar: boolean;      // 是否显示进度条
  showTokenCount: boolean;       // 是否显示具体 Token 数
  enabled: boolean;              // 是否启用
}

interface TokenStats {
  used: number;                  // 已使用 Token 数
  limit: number;                 // Token 上限
  percentage: number;            // 使用百分比
}

// 常见模型的上下文窗口大小
const MODEL_CONTEXT_LIMITS: Record<string, number> = {
  // Qwen 系列
  'qwen3.5-plus': 256000,
  'qwen3.5': 256000,
  'qwen-max': 32000,
  'qwen-plus': 32000,
  
  // Claude 系列
  'claude-3-5-sonnet': 200000,
  'claude-3-opus': 200000,
  'claude-3-sonnet': 200000,
  'claude-3-haiku': 200000,
  
  // GPT 系列
  'gpt-4-turbo': 128000,
  'gpt-4': 128000,
  'gpt-4o': 128000,
  'gpt-3.5-turbo': 16385,
  
  // 其他
  'gemini-pro': 128000,
  'llama-3-70b': 8192,
  'default': 128000,
};

// 默认配置
const DEFAULT_CONFIG: ContextMonitorConfig = {
  warningThreshold: 70,
  criticalThreshold: 90,
  showProgressBar: true,
  showTokenCount: true,
  enabled: true,
};

/**
 * 估算文本的 Token 数量
 * 使用简化的估算方法：中文约 1.5 字符/Token，英文约 4 字符/Token
 */
export function estimateTokens(text: string): number {
  if (!text) return 0;
  
  const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  const englishChars = text.length - chineseChars;
  
  // 中文约 1.5 字符/Token，英文约 4 字符/Token
  const chineseTokens = chineseChars / 1.5;
  const englishTokens = englishChars / 4;
  
  return Math.round(chineseTokens + englishTokens);
}

/**
 * 获取当前模型的上下文窗口大小
 */
export function getModelContextLimit(modelName: string): number {
  if (!modelName) return MODEL_CONTEXT_LIMITS.default;
  
  // 尝试精确匹配
  if (MODEL_CONTEXT_LIMITS[modelName]) {
    return MODEL_CONTEXT_LIMITS[modelName];
  }
  
  // 尝试模糊匹配
  for (const [key, limit] of Object.entries(MODEL_CONTEXT_LIMITS)) {
    if (modelName.toLowerCase().includes(key)) {
      return limit;
    }
  }
  
  return MODEL_CONTEXT_LIMITS.default;
}

/**
 * 生成进度条
 */
export function generateProgressBar(percentage: number, length: number = 20): string {
  const filled = Math.round((percentage / 100) * length);
  const empty = length - filled;
  
  const filledBar = '▓'.repeat(filled);
  const emptyBar = '░'.repeat(empty);
  
  return `${filledBar}${emptyBar}`;
}

/**
 * 生成上下文使用状态消息
 */
export function generateStatusMessage(stats: TokenStats, config: ContextMonitorConfig): string {
  const { percentage, used, limit } = stats;
  
  let statusLine = '\n---\n';
  
  // 根据百分比选择图标
  let icon = '📊';
  let warningText = '';
  
  if (percentage >= config.criticalThreshold) {
    icon = '🚨';
    warningText = `\n⚠️ 严重：上下文即将超限！建议立即使用 /new 开启新会话`;
  } else if (percentage >= config.warningThreshold) {
    icon = '⚠️';
    warningText = `\n💡 建议：使用 /new 开启新会话 或 /compact 压缩上下文`;
  }
  
  // 构建状态行
  statusLine += `${icon} 上下文使用：${percentage.toFixed(1)}%`;
  
  if (config.showProgressBar) {
    statusLine += ` ${generateProgressBar(percentage)}`;
  }
  
  if (config.showTokenCount) {
    statusLine += ` (${used.toLocaleString()}/${limit.toLocaleString()} tokens)`;
  }
  
  if (warningText) {
    statusLine += warningText;
  }
  
  return statusLine;
}

/**
 * 计算当前会话的 Token 使用统计
 */
async function calculateTokenStats(sessionHistory: any[], modelName: string): Promise<TokenStats> {
  const limit = getModelContextLimit(modelName);
  
  // 估算已使用的 Token 数（包括历史消息和当前回复）
  let usedTokens = 0;
  
  for (const message of sessionHistory) {
    if (message.content) {
      usedTokens += estimateTokens(message.content);
    }
    
    // 如果有工具调用，也计算进去
    if (message.tool_calls) {
      for (const tool of message.tool_calls) {
        usedTokens += estimateTokens(JSON.stringify(tool));
      }
    }
  }
  
  const percentage = (usedTokens / limit) * 100;
  
  return {
    used: usedTokens,
    limit,
    percentage: Math.min(percentage, 100),
  };
}

/**
 * 主处理函数 - 在每次回复后调用
 */
export async function onAfterReply(
  reply: string,
  context: {
    sessionHistory: any[];
    modelName: string;
    config?: Partial<ContextMonitorConfig>;
  }
): Promise<string> {
  const config: ContextMonitorConfig = {
    ...DEFAULT_CONFIG,
    ...context.config,
  };
  
  // 如果未启用，直接返回原回复
  if (!config.enabled) {
    return reply;
  }
  
  try {
    // 计算 Token 使用统计
    const stats = await calculateTokenStats(context.sessionHistory, context.modelName);
    
    // 生成状态消息
    const statusMessage = generateStatusMessage(stats, config);
    
    // 附加到回复末尾
    return reply + statusMessage;
  } catch (error) {
    // 如果计算失败，不影响原回复
    console.error('[context-monitor] Error calculating token stats:', error);
    return reply;
  }
}

/**
 * 命令处理 - 处理 /context 命令
 */
export async function handleCommand(
  command: string,
  context: {
    sessionHistory: any[];
    modelName: string;
    config?: Partial<ContextMonitorConfig>;
  }
): Promise<string | null> {
  const config: ContextMonitorConfig = {
    ...DEFAULT_CONFIG,
    ...context.config,
  };
  
  if (command === '/context' || command === '/context status') {
    const stats = await calculateTokenStats(context.sessionHistory, context.modelName);
    return generateStatusMessage(stats, config);
  }
  
  if (command === '/context on') {
    config.enabled = true;
    return '✅ 上下文监控已启用';
  }
  
  if (command === '/context off') {
    config.enabled = false;
    return '⏸️ 上下文监控已禁用';
  }
  
  return null;
}

// 导出配置类型
export type { ContextMonitorConfig };

// 导出默认配置
export { DEFAULT_CONFIG };
