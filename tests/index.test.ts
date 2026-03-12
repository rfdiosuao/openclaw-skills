/**
 * OpenClaw 双机互修助手 - 单元测试
 */

import { checkMemory, checkPM2, healthCheck, generateRepairSuggestions } from '../src/index';

describe('OpenClaw Mutual Repair', () => {
  describe('checkMemory', () => {
    it('should return memory status', async () => {
      const result = await checkMemory();
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('processes');
    });
  });

  describe('checkPM2', () => {
    it('should return PM2 status or installation guide', async () => {
      const result = await checkPM2();
      expect(result).toHaveProperty('status');
      expect(['ok', 'warning', 'error', 'info']).toContain(result.status);
    });
  });

  describe('healthCheck', () => {
    it('should return comprehensive health report', async () => {
      const result = await healthCheck();
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('checks');
      expect(result.checks).toHaveProperty('memory');
      expect(result.checks).toHaveProperty('pm2');
      expect(result.checks).toHaveProperty('systemd');
      expect(result.checks).toHaveProperty('websocket');
    });

    it('should calculate overall status correctly', async () => {
      const result = await healthCheck();
      expect(['healthy', 'degraded', 'error']).toContain(result.status);
    });
  });

  describe('generateRepairSuggestions', () => {
    it('should generate suggestions based on health report', () => {
      const healthReport = {
        status: 'degraded',
        checks: {
          memory: { status: 'warning', system: { usage: 90 } },
          pm2: { status: 'ok' },
          systemd: { status: 'ok' },
          websocket: { status: 'ok' }
        }
      };

      const suggestions = generateRepairSuggestions(healthReport);
      expect(suggestions).toBeInstanceOf(Array);
      expect(suggestions.length).toBeGreaterThan(0);
    });

    it('should return no warnings for healthy system', () => {
      const healthReport = {
        status: 'healthy',
        checks: {
          memory: { status: 'ok' },
          pm2: { status: 'ok' },
          systemd: { status: 'ok' },
          websocket: { status: 'ok' }
        }
      };

      const suggestions = generateRepairSuggestions(healthReport);
      expect(suggestions).toContain('✅ 系统运行正常，无需修复');
    });
  });
});
