import { chromium } from 'playwright';
import env from '../../src/config/env.js';
import proxyManager from './proxyManager.js';
import { getRandomUserAgent, getRandomViewport } from './antiBlock.js';

/**
 * Browser Pool — Manages reusable browser instances to avoid cold starts
 */
class BrowserPool {
  constructor() {
    this.browsers = [];
    this.maxBrowsers = env.scraper.maxConcurrency;
  }

  async acquire() {
    // Reuse idle browser if available
    const idle = this.browsers.find(b => !b.inUse && b.instance.isConnected());
    if (idle) {
      idle.inUse = true;
      return idle;
    }

    // Launch new browser if under limit
    if (this.browsers.length < this.maxBrowsers) {
      const proxyOpts = proxyManager.getLaunchOptions();
      const viewport = getRandomViewport();

      const instance = await chromium.launch({
        headless: env.scraper.headless,
        ...proxyOpts,
        args: [
          '--disable-blink-features=AutomationControlled',
          '--disable-dev-shm-usage',
          '--no-sandbox',
          `--window-size=${viewport.width},${viewport.height}`,
        ],
      });

      const entry = {
        instance,
        inUse: true,
        createdAt: Date.now(),
      };

      this.browsers.push(entry);
      return entry;
    }

    // Wait for one to become available
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        const available = this.browsers.find(b => !b.inUse && b.instance.isConnected());
        if (available) {
          clearInterval(interval);
          available.inUse = true;
          resolve(available);
        }
      }, 1000);
    });
  }

  release(entry) {
    entry.inUse = false;
  }

  async closeAll() {
    for (const entry of this.browsers) {
      try {
        await entry.instance.close();
      } catch (e) { /* ignore */ }
    }
    this.browsers = [];
  }

  /**
   * Create a new page in the browser with stealth settings
   */
  async createPage(browserEntry) {
    const viewport = getRandomViewport();
    const context = await browserEntry.instance.newContext({
      userAgent: getRandomUserAgent(),
      viewport,
      locale: 'en-US',
      timezoneId: 'America/New_York',
      permissions: ['geolocation'],
    });

    // Stealth: override navigator.webdriver
    await context.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
      Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
      Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });

      // Override Chrome detection
      window.chrome = { runtime: {} };
    });

    const page = await context.newPage();
    return { page, context };
  }
}

const browserPool = new BrowserPool();
export default browserPool;
