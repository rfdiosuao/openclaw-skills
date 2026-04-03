/**
 * Web Reverse Debugger 单元测试
 */

import { WebReverseDebugger, createDebugger } from '../src/index';

describe('WebReverseDebugger', () => {
  let debugger: WebReverseDebugger;

  beforeEach(() => {
    debugger = createDebugger({
      targetUrl: 'https://example.com',
      headless: true
    });
  });

  afterEach(async () => {
    await debugger.close();
  });

  test('应该能创建调试器实例', () => {
    expect(debugger).toBeInstanceOf(WebReverseDebugger);
  });

  test('配置应该有默认值', () => {
    const dbg = createDebugger({ targetUrl: 'https://test.com' });
    expect(dbg).toBeDefined();
  });

  test('捕获请求列表初始为空', () => {
    const requests = debugger.getCapturedRequests();
    expect(requests).toEqual([]);
  });

  test('清空捕获请求', () => {
    debugger.clearCapturedRequests();
    expect(debugger.getCapturedRequests()).toEqual([]);
  });
});
