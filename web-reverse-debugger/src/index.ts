/**
 * Web Reverse Debugger - 网页逆向调试助手
 * 
 * 功能：
 * - 浏览器注入 JS，拦截加密请求
 * - 自动提取签名参数（sign、token 等）
 * - Hook 加密函数，跟踪调用栈
 * - 支持 WebSocket 消息解密
 * - 配合 OpenClaw 实现自动化调用
 * 
 * @author 郑宇航
 * @version 1.0.0
 */

import { chromium, Browser, Page, Route } from 'playwright';

export interface ReverseDebuggerConfig {
  targetUrl: string;
  headless?: boolean;
  apiPattern?: string;  // 默认：**/api/**
  stealth?: boolean;    // 是否启用反检测
}

export interface CapturedRequest {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: any;
  sign?: string;
  timestamp?: number;
}

export class WebReverseDebugger {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private config: ReverseDebuggerConfig;
  private capturedRequests: CapturedRequest[] = [];

  constructor(config: ReverseDebuggerConfig) {
    this.config = {
      headless: false,  // 调试时建议设为 false
      apiPattern: '**/api/**',
      stealth: false,
      ...config
    };
  }

  /**
   * 初始化浏览器
   */
  async init(): Promise<void> {
    const launchOptions: any = {
      headless: this.config.headless,
      args: [
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process'
      ]
    };

    // 启用反检测
    if (this.config.stealth) {
      launchOptions.args.push(
        '--disable-blink-features=AutomationControlled',
        '--no-sandbox'
      );
    }

    this.browser = await chromium.launch(launchOptions);
    this.page = await this.browser.newPage();

    // 设置 User-Agent
    await this.page.setExtraHTTPHeaders({
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });

    // 拦截请求
    await this.setupRequestInterception();
    
    console.log('🌐 浏览器初始化完成');
  }

  /**
   * 设置请求拦截
   */
  private async setupRequestInterception(): Promise<void> {
    if (!this.page) return;

    await this.page.route(this.config.apiPattern!, async (route: Route) => {
      const request = route.request();
      
      if (request.method() === 'POST' || request.method() === 'GET') {
        const postData = request.postDataJSON();
        const headers = request.headers();
        
        const captured: CapturedRequest = {
          url: request.url(),
          method: request.method(),
          headers,
          body: postData
        };

        // 提取签名参数
        if (postData?.sign) {
          captured.sign = postData.sign;
        }
        if (postData?.timestamp) {
          captured.timestamp = postData.timestamp;
        }

        this.capturedRequests.push(captured);
        
        console.log('📦 捕获请求:', {
          url: captured.url,
          method: captured.method,
          sign: captured.sign ? '✅' : '❌'
        });
      }

      await route.continue();
    });
  }

  /**
   * 访问目标网站
   */
  async navigate(url?: string): Promise<void> {
    if (!this.page) {
      throw new Error('浏览器未初始化，请先调用 init()');
    }

    const targetUrl = url || this.config.targetUrl;
    await this.page.goto(targetUrl, { waitUntil: 'networkidle' });
    console.log(`🔗 已访问：${targetUrl}`);
  }

  /**
   * 注入 Hook 脚本，拦截 fetch 请求
   */
  async injectFetchHook(): Promise<void> {
    if (!this.page) return;

    await this.page.evaluate(() => {
      // 保存原始 fetch
      (window as any)._originalFetch = window.fetch;
      (window as any)._capturedRequests = [];

      // Hook fetch
      window.fetch = async function(...args: any[]) {
        const response = await (window as any)._originalFetch.apply(this, args);
        
        // 克隆响应（因为只能读取一次）
        const cloned = response.clone();
        
        // 检查是否是 API 请求
        if (args[0] && typeof args[0] === 'string' && args[0].includes('/api/')) {
          const requestData = {
            url: args[0],
            method: args[1]?.method || 'GET',
            headers: args[1]?.headers || {},
            body: args[1]?.body
          };
          
          (window as any)._capturedRequests.push(requestData);
          console.log('OPENCLAW_CAPTURE:', JSON.stringify(requestData));
        }
        
        return response;
      };
    });

    console.log('💉 已注入 Fetch Hook');
  }

  /**
   * 注入 Hook 脚本，拦截 XMLHttpRequest
   */
  async injectXHRHook(): Promise<void> {
    if (!this.page) return;

    await this.page.evaluate(() => {
      (window as any)._originalXHR = window.XMLHttpRequest;
      (window as any)._capturedXHRs = [];

      const XHRHook = function(this: any) {
        const xhr = new (window as any)._originalXHR();
        const originalOpen = xhr.open;
        const originalSend = xhr.send;

        xhr.open = function(method: string, url: string, ...rest: any[]) {
          (this as any)._method = method;
          (this as any)._url = url;
          return originalOpen.apply(this, [method, url, ...rest]);
        };

        xhr.send = function(body?: any) {
          xhr.addEventListener('load', function() {
            (window as any)._capturedXHRs.push({
              url: (this as any)._url,
              method: (this as any)._method,
              body,
              response: this.responseText
            });
            console.log('OPENCLAW_XHR_CAPTURE:', JSON.stringify({
              url: (this as any)._url,
              method: (this as any)._method
            }));
          });

          return originalSend.apply(this, [body]);
        };

        return xhr;
      };

      window.XMLHttpRequest = XHRHook as any;
    });

    console.log('💉 已注入 XHR Hook');
  }

  /**
   * 调用页面中的加密函数生成签名
   */
  async callEncryptFunction(functionName: string, params: any): Promise<any> {
    if (!this.page) {
      throw new Error('浏览器未初始化');
    }

    try {
      const result = await this.page.evaluate((fnName: string, data: any) => {
        // 尝试多种调用方式
        if (typeof (window as any)[fnName] === 'function') {
          return (window as any)[fnName](data);
        }
        
        // 尝试 Crypto 对象
        if ((window as any).Crypto?.[fnName]) {
          return (window as any).Crypto[fnName](data);
        }
        
        // 尝试 Utils 对象
        if ((window as any).Utils?.[fnName]) {
          return (window as any).Utils[fnName](data);
        }

        throw new Error(`未找到加密函数：${fnName}`);
      }, functionName, params);

      console.log(`🔑 生成签名：${result}`);
      return result;
    } catch (error: any) {
      console.error('❌ 调用加密函数失败:', error.message);
      throw error;
    }
  }

  /**
   * 获取捕获的请求列表
   */
  getCapturedRequests(): CapturedRequest[] {
    return [...this.capturedRequests];
  }

  /**
   * 清空捕获的请求
   */
  clearCapturedRequests(): void {
    this.capturedRequests = [];
  }

  /**
   * 截图调试
   */
  async screenshot(outputPath?: string): Promise<Buffer> {
    if (!this.page) {
      throw new Error('浏览器未初始化');
    }

    const buffer = await this.page.screenshot({ 
      fullPage: true,
      type: 'png'
    });

    if (outputPath) {
      await this.page.screenshot({ 
        path: outputPath,
        fullPage: true 
      });
      console.log(`📸 截图已保存：${outputPath}`);
    }

    return buffer;
  }

  /**
   * 执行自定义 JS
   */
  async evaluate(script: string): Promise<any> {
    if (!this.page) {
      throw new Error('浏览器未初始化');
    }

    return await this.page.evaluate(script);
  }

  /**
   * 点击元素
   */
  async click(selector: string): Promise<void> {
    if (!this.page) return;
    await this.page.click(selector);
    console.log(`👆 已点击：${selector}`);
  }

  /**
   * 填充表单
   */
  async fill(selector: string, value: string): Promise<void> {
    if (!this.page) return;
    await this.page.fill(selector, value);
    console.log(`✏️  已填充：${selector} = ${value}`);
  }

  /**
   * 等待时间
   */
  async wait(ms: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 关闭浏览器
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
      console.log('🔒 浏览器已关闭');
    }
  }
}

/**
 * 快速创建调试器实例
 */
export function createDebugger(config: ReverseDebuggerConfig): WebReverseDebugger {
  return new WebReverseDebugger(config);
}

export default WebReverseDebugger;
