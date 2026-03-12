/**
 * OpenClaw 双机互修助手 - 核心实现
 * 
 * 功能：
 * 1. 内存监控与泄漏检测
 * 2. 进程守护状态检查
 * 3. WebSocket 连接诊断
 * 4. 健康检查接口
 * 5. 双机互修协议
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

// 工具函数：执行 shell 命令
async function runCommand(command: string): Promise<{ stdout: string; stderr: string }> {
  try {
    const { stdout, stderr } = await execAsync(command, {
      timeout: 30000,
      maxBuffer: 10 * 1024 * 1024
    });
    return { stdout, stderr };
  } catch (error: any) {
    throw new Error(`命令执行失败：${command}\n错误：${error.message}`);
  }
}

// 工具函数：读取 JSON 配置文件
function readConfig(configPath: string): any {
  try {
    const content = fs.readFileSync(configPath, 'utf-8');
    // 支持 JSON5（移除注释）
    const cleaned = content.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
    return JSON.parse(cleaned);
  } catch (error: any) {
    throw new Error(`读取配置失败：${error.message}`);
  }
}

// 1. 内存监控
export async function checkMemory(): Promise<any> {
  try {
    // 获取 Node.js 进程内存使用
    const { stdout } = await runCommand('ps aux | grep -E "node|openclaw" | grep -v grep | head -5');
    
    const memoryInfo: any = {
      status: 'ok',
      processes: [],
      recommendations: []
    };
    
    const lines = stdout.trim().split('\n');
    for (const line of lines) {
      const parts = line.split(/\s+/);
      const cpu = parseFloat(parts[2]);
      const mem = parseFloat(parts[3]);
      const pid = parts[1];
      const command = parts.slice(10).join(' ');
      
      memoryInfo.processes.push({ pid, cpu, mem, command });
      
      if (mem > 85) {
        memoryInfo.status = 'warning';
        memoryInfo.recommendations.push(`进程 ${pid} 内存使用过高 (${mem}%)，建议配置 max_memory_restart`);
      }
    }
    
    // 检查系统总内存
    const { stdout: freeOutput } = await runCommand('free -m');
    const memLines = freeOutput.split('\n');
    const memInfo = memLines[1].split(/\s+/).slice(1).map(Number);
    
    memoryInfo.system = {
      total: memInfo[0],
      used: memInfo[1],
      free: memInfo[2],
      usage: Math.round((memInfo[1] / memInfo[0]) * 100)
    };
    
    if (memoryInfo.system.usage > 85) {
      memoryInfo.status = 'warning';
      memoryInfo.recommendations.push(`系统内存使用率 ${memoryInfo.system.usage}%，建议检查内存泄漏`);
    }
    
    return memoryInfo;
  } catch (error: any) {
    return {
      status: 'error',
      error: error.message
    };
  }
}

// 2. PM2 进程守护检查
export async function checkPM2(): Promise<any> {
  try {
    // 检查 PM2 是否安装
    try {
      await runCommand('pm2 --version');
    } catch {
      return {
        status: 'error',
        message: 'PM2 未安装',
        installGuide: 'npm install -g pm2'
      };
    }
    
    // 获取 PM2 进程列表
    const { stdout } = await runCommand('pm2 list --json');
    const processes = JSON.parse(stdout);
    
    const pm2Status: any = {
      status: 'ok',
      processes: [],
      recommendations: []
    };
    
    for (const proc of processes) {
      const procInfo: any = {
        name: proc.name,
        status: proc.status,
        pid: proc.pid,
        memory: proc.monit.memory,
        cpu: proc.monit.cpu,
        uptime: proc.pm2_env?.pm_uptime,
        restarts: proc.pm2_env?.restart_time
      };
      
      pm2Status.processes.push(procInfo);
      
      // 检查异常状态
      if (proc.status !== 'online') {
        pm2Status.status = 'warning';
        pm2Status.recommendations.push(`进程 ${proc.name} 状态异常：${proc.status}`);
      }
      
      if (proc.monit.memory > 1024 * 1024 * 1024) { // 1GB
        pm2Status.status = 'warning';
        pm2Status.recommendations.push(`进程 ${proc.name} 内存使用过高：${Math.round(proc.monit.memory / 1024 / 1024)}MB`);
      }
      
      if (proc.pm2_env?.restart_time > 10) {
        pm2Status.status = 'warning';
        pm2Status.recommendations.push(`进程 ${proc.name} 重启次数过多：${proc.pm2_env.restart_time}次`);
      }
    }
    
    return pm2Status;
  } catch (error: any) {
    return {
      status: 'error',
      error: error.message
    };
  }
}

// 3. systemd 服务检查
export async function checkSystemd(): Promise<any> {
  try {
    // 检查 OpenClaw 服务状态
    const { stdout } = await runCommand('systemctl status openclaw --no-pager');
    
    const systemdStatus: any = {
      status: 'ok',
      active: false,
      subState: '',
      mainPid: null,
      memoryUsage: null,
      recommendations: []
    };
    
    // 解析 systemctl 输出
    const lines = stdout.split('\n');
    for (const line of lines) {
      if (line.includes('Active:')) {
        systemdStatus.active = line.includes('active (running)');
        systemdStatus.subState = line.match(/active \((\w+)\)/)?.[1] || '';
      }
      if (line.includes('Main PID:')) {
        systemdStatus.mainPid = line.match(/Main PID: (\d+)/)?.[1];
      }
      if (line.includes('Memory:')) {
        systemdStatus.memoryUsage = line.match(/Memory: (.+)/)?.[1];
      }
    }
    
    if (!systemdStatus.active) {
      systemdStatus.status = 'warning';
      systemdStatus.recommendations.push('OpenClaw 服务未运行，建议启动：sudo systemctl start openclaw');
    }
    
    return systemdStatus;
  } catch (error: any) {
    // 服务可能不存在
    if (error.message.includes('Unit openclaw.service not found')) {
      return {
        status: 'info',
        message: '未配置 systemd 服务',
        setupGuide: '参考文档创建 /etc/systemd/system/openclaw.service'
      };
    }
    
    return {
      status: 'error',
      error: error.message
    };
  }
}

// 4. WebSocket 连接诊断
export async function checkWebSocket(): Promise<any> {
  try {
    // 检查网络连接
    const { stdout: netstat } = await runCommand('netstat -an | grep ESTABLISHED | grep -E "18789|443|80" | wc -l');
    const establishedConnections = parseInt(netstat.trim());
    
    // 检查 OpenClaw 网关状态
    let gatewayStatus = 'unknown';
    try {
      const { stdout: health } = await runCommand('curl -s -o /dev/null -w "%{http_code}" http://localhost:18789/health || echo "failed"');
      gatewayStatus = health.trim();
    } catch {
      gatewayStatus = 'unreachable';
    }
    
    const wsStatus: any = {
      status: 'ok',
      establishedConnections,
      gatewayStatus,
      recommendations: []
    };
    
    if (gatewayStatus !== '200' && gatewayStatus !== 'unknown') {
      wsStatus.status = 'warning';
      wsStatus.recommendations.push('网关健康检查失败，请检查 Gateway 状态');
    }
    
    if (establishedConnections < 5) {
      wsStatus.status = 'info';
      wsStatus.recommendations.push('活跃连接数较少，可能是正常空闲状态');
    }
    
    // 检查最近的断连日志
    try {
      const logPath = '/home/node/.openclaw/logs/combined.log';
      if (fs.existsSync(logPath)) {
        const { stdout: recentLogs } = await runCommand(`tail -100 ${logPath} | grep -i "disconnect\\|reconnect" | tail -10`);
        if (recentLogs.trim()) {
          wsStatus.recentDisconnects = recentLogs.trim().split('\n');
          if (wsStatus.recentDisconnects.length > 5) {
            wsStatus.status = 'warning';
            wsStatus.recommendations.push('检测到频繁断连，建议检查网络和心跳配置');
          }
        }
      }
    } catch {
      // 日志文件可能不存在
    }
    
    return wsStatus;
  } catch (error: any) {
    return {
      status: 'error',
      error: error.message
    };
  }
}

// 5. 全面健康检查
export async function healthCheck(): Promise<any> {
  const [memory, pm2, systemd, websocket] = await Promise.all([
    checkMemory(),
    checkPM2(),
    checkSystemd(),
    checkWebSocket()
  ]);
  
  // 计算整体健康状态
  let overallStatus = 'healthy';
  const warnings: string[] = [];
  
  if (memory.status === 'warning' || memory.status === 'error') {
    overallStatus = 'degraded';
    warnings.push('内存监控异常');
  }
  
  if (pm2.status === 'warning' || pm2.status === 'error') {
    overallStatus = 'degraded';
    warnings.push('PM2 进程异常');
  }
  
  if (systemd.status === 'warning' || systemd.status === 'error') {
    overallStatus = 'degraded';
    warnings.push('systemd 服务异常');
  }
  
  if (websocket.status === 'warning' || websocket.status === 'error') {
    overallStatus = 'degraded';
    warnings.push('WebSocket 连接异常');
  }
  
  return {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks: {
      memory,
      pm2,
      systemd,
      websocket
    },
    warnings,
    recommendations: [
      ...memory.recommendations || [],
      ...pm2.recommendations || [],
      ...systemd.recommendations || [],
      ...websocket.recommendations || []
    ]
  };
}

// 6. 生成优化配置
export async function generateOptimizedConfig(): Promise<string> {
  const configTemplate = {
    identity: {
      name: "OpenClaw",
      theme: "stable production instance",
      emoji: "⚡"
    },
    agents: {
      defaults: {
        workspace: "~/.openclaw/workspace",
        model: {
          primary: "anthropic/claude-sonnet-4-5",
          fallbacks: ["anthropic/claude-opus-4-6"]
        },
        heartbeat: {
          every: "30m",
          target: "last"
        },
        sandbox: {
          mode: "non-main"
        }
      }
    },
    session: {
      dmScope: "per-channel-peer",
      reset: {
        mode: "daily",
        atHour: 4,
        idleMinutes: 120
      }
    },
    tools: {
      allow: ["exec", "process", "read", "write", "edit"],
      exec: {
        backgroundMs: 10000,
        timeoutSec: 1800
      }
    },
    gateway: {
      port: 18789,
      bind: "loopback",
      reload: {
        mode: "hybrid",
        debounceMs: 300
      }
    }
  };
  
  return JSON.stringify(configTemplate, null, 2);
}

// 7. 修复建议生成器
export function generateRepairSuggestions(healthReport: any): string[] {
  const suggestions: string[] = [];
  
  // 内存相关建议
  if (healthReport.checks.memory?.system?.usage > 85) {
    suggestions.push(
      '🔴 内存使用率过高，建议：\n' +
      '1. 配置 PM2 max_memory_restart: 1G\n' +
      '2. 检查内存泄漏（使用 clinic.js）\n' +
      '3. 考虑增加系统内存或优化代码'
    );
  }
  
  // PM2 相关建议
  if (healthReport.checks.pm2?.status === 'warning') {
    suggestions.push(
      '🟡 PM2 进程异常，建议：\n' +
      '1. 检查 PM2 日志：pm2 logs\n' +
      '2. 重启异常进程：pm2 restart all\n' +
      '3. 配置自动重启：autorestart: true'
    );
  }
  
  // systemd 相关建议
  if (healthReport.checks.systemd?.status === 'warning') {
    suggestions.push(
      '🟡 systemd 服务未运行，建议：\n' +
      '1. 启动服务：sudo systemctl start openclaw\n' +
      '2. 查看状态：systemctl status openclaw\n' +
      '3. 查看日志：journalctl -u openclaw -n 50'
    );
  }
  
  // WebSocket 相关建议
  if (healthReport.checks.websocket?.status === 'warning') {
    suggestions.push(
      '🟡 WebSocket 连接异常，建议：\n' +
      '1. 检查 Gateway 状态：openclaw gateway status\n' +
      '2. 配置心跳保活：heartbeat.interval: 30000\n' +
      '3. 配置指数退避重连'
    );
  }
  
  // 如果没有警告
  if (suggestions.length === 0) {
    suggestions.push('✅ 系统运行正常，无需修复');
  }
  
  return suggestions;
}

// 主导出函数
export default async function mutualRepair(query: string): Promise<string> {
  const lowerQuery = query.toLowerCase();
  
  // 内存检查
  if (lowerQuery.includes('内存') || lowerQuery.includes('memory') || lowerQuery.includes('泄漏')) {
    const result = await checkMemory();
    return `## 🔍 内存检查结果\n\n${JSON.stringify(result, null, 2)}`;
  }
  
  // PM2 检查
  if (lowerQuery.includes('pm2') || lowerQuery.includes('进程') || lowerQuery.includes('守护')) {
    const result = await checkPM2();
    return `## 🔍 PM2 状态检查\n\n${JSON.stringify(result, null, 2)}`;
  }
  
  // systemd 检查
  if (lowerQuery.includes('systemd') || lowerQuery.includes('服务')) {
    const result = await checkSystemd();
    return `## 🔍 systemd 服务状态\n\n${JSON.stringify(result, null, 2)}`;
  }
  
  // WebSocket 检查
  if (lowerQuery.includes('websocket') || lowerQuery.includes('连接') || lowerQuery.includes('断连')) {
    const result = await checkWebSocket();
    return `## 🔍 WebSocket 连接诊断\n\n${JSON.stringify(result, null, 2)}`;
  }
  
  // 全面健康检查
  if (lowerQuery.includes('健康') || lowerQuery.includes('health') || lowerQuery.includes('检查') || lowerQuery.includes('status')) {
    const result = await healthCheck();
    const suggestions = generateRepairSuggestions(result);
    return `## 🏥 全面健康检查\n\n**整体状态：** ${result.status}\n**检查时间：** ${result.timestamp}\n\n### 详细结果\n${JSON.stringify(result.checks, null, 2)}\n\n### 修复建议\n${suggestions.map(s => `- ${s}`).join('\n\n')}`;
  }
  
  // 生成优化配置
  if (lowerQuery.includes('配置') || lowerQuery.includes('优化') || lowerQuery.includes('config')) {
    const config = await generateOptimizedConfig();
    return `## ⚙️ 优化配置模板\n\n\`\`\`json\n${config}\n\`\`\``;
  }
  
  // 默认回复
  return `## 🛠️ OpenClaw 双机互修助手\n\n我可以帮你：\n\n1. **内存监控** - 检查内存使用和泄漏\n2. **进程守护** - 检查 PM2/systemd 状态\n3. **连接诊断** - WebSocket 断连分析\n4. **健康检查** - 全面系统诊断\n5. **配置优化** - 生成最佳实践配置\n\n请告诉我需要检查什么？例如：\n- "检查内存使用情况"\n- "PM2 状态正常吗？"\n- "帮我做全面健康检查"\n- "生成优化配置"`;
}
