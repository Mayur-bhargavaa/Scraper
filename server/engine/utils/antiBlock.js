import env from '../../src/config/env.js';

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
];

const VIEWPORTS = [
  { width: 1920, height: 1080 },
  { width: 1366, height: 768 },
  { width: 1536, height: 864 },
  { width: 1440, height: 900 },
  { width: 1280, height: 720 },
];

/**
 * Random delay between min and max milliseconds
 */
export const randomDelay = (min, max) => {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Introduces a configurable delay between actions
 */
export const actionDelay = () => {
  return randomDelay(env.scraper.minDelay, env.scraper.maxDelay);
};

/**
 * Short delay for UI micro-interactions
 */
export const microDelay = () => {
  return randomDelay(300, 1200);
};

/**
 * Get a random user agent string
 */
export const getRandomUserAgent = () => {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
};

/**
 * Get a random viewport size
 */
export const getRandomViewport = () => {
  return VIEWPORTS[Math.floor(Math.random() * VIEWPORTS.length)];
};

/**
 * Simulate human-like scrolling on a page element
 */
export const humanScroll = async (page, selector) => {
  await page.evaluate(async (sel) => {
    const element = document.querySelector(sel);
    if (!element) return;

    const totalHeight = element.scrollHeight;
    let currentScroll = 0;

    while (currentScroll < totalHeight) {
      // Random scroll distance (100-400px)
      const scrollStep = Math.floor(Math.random() * 300) + 100;
      element.scrollTop += scrollStep;
      currentScroll += scrollStep;

      // Random short pause between scrolls
      await new Promise(r => setTimeout(r, Math.floor(Math.random() * 500) + 200));
    }
  }, selector);
};

/**
 * Simulate human-like typing with random delays between keystrokes
 */
export const humanType = async (page, selector, text) => {
  await page.click(selector);
  await microDelay();

  for (const char of text) {
    await page.type(selector, char, {
      delay: Math.floor(Math.random() * 150) + 50,
    });
  }
};

/**
 * Random mouse movement to avoid bot detection patterns
 */
export const randomMouseMove = async (page) => {
  const x = Math.floor(Math.random() * 800) + 100;
  const y = Math.floor(Math.random() * 600) + 100;
  await page.mouse.move(x, y, { steps: Math.floor(Math.random() * 5) + 3 });
};
