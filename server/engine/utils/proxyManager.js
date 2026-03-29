import env from '../../src/config/env.js';

/**
 * Proxy Manager — Pluggable proxy rotation system
 * Supports BrightData, Smartproxy, and custom proxy lists
 */
class ProxyManager {
  constructor() {
    this.enabled = env.proxy.enabled;
    this.provider = env.proxy.provider;
    this.proxyList = [];
    this.currentIndex = 0;

    if (this.enabled) {
      this.initProvider();
    }
  }

  initProvider() {
    switch (this.provider) {
      case 'brightdata':
        this.proxyList = this.buildBrightDataProxies();
        break;
      case 'smartproxy':
        this.proxyList = this.buildSmartProxyProxies();
        break;
      case 'custom':
        this.proxyList = this.parseCustomProxies();
        break;
      default:
        console.warn(`Unknown proxy provider: ${this.provider}`);
    }

    console.log(`🔄 Proxy Manager initialized: ${this.proxyList.length} proxies (${this.provider})`);
  }

  buildBrightDataProxies() {
    // BrightData rotating residential proxy
    const { host, port, username, password } = env.proxy;
    if (!host) return [];

    return [{
      server: `http://${host}:${port}`,
      username,
      password,
    }];
  }

  buildSmartProxyProxies() {
    const { host, port, username, password } = env.proxy;
    if (!host) return [];

    return [{
      server: `http://${host}:${port}`,
      username,
      password,
    }];
  }

  parseCustomProxies() {
    // Expects comma-separated proxy URLs in PROXY_HOST
    const { host } = env.proxy;
    if (!host) return [];

    return host.split(',').map(url => ({
      server: url.trim(),
    }));
  }

  /**
   * Get next proxy configuration for Playwright
   * Returns null if proxies are disabled
   */
  getProxy() {
    if (!this.enabled || this.proxyList.length === 0) {
      return null;
    }

    const proxy = this.proxyList[this.currentIndex % this.proxyList.length];
    this.currentIndex++;

    return {
      server: proxy.server,
      username: proxy.username,
      password: proxy.password,
    };
  }

  /**
   * Get Playwright browser launch options with proxy
   */
  getLaunchOptions() {
    const proxy = this.getProxy();
    if (!proxy) return {};

    return { proxy };
  }
}

const proxyManager = new ProxyManager();
export default proxyManager;
