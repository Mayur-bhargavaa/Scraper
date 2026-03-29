import env from '../../src/config/env.js';

/**
 * CAPTCHA Solver — Pluggable interface for CAPTCHA solving services
 * Currently supports 2Captcha. Extend for other providers.
 */
class CaptchaSolver {
  constructor() {
    this.enabled = env.captcha.enabled;
    this.provider = env.captcha.provider;
    this.apiKey = env.captcha.apiKey;
  }

  /**
   * Solve a reCAPTCHA v2
   * @param {string} siteKey - The site key from the page
   * @param {string} pageUrl - The URL of the page with the CAPTCHA
   * @returns {string} The solved CAPTCHA token
   */
  async solveRecaptchaV2(siteKey, pageUrl) {
    if (!this.enabled) {
      console.warn('CAPTCHA solving is disabled');
      return null;
    }

    switch (this.provider) {
      case '2captcha':
        return this.solve2Captcha(siteKey, pageUrl);
      default:
        throw new Error(`Unknown CAPTCHA provider: ${this.provider}`);
    }
  }

  async solve2Captcha(siteKey, pageUrl) {
    try {
      // Submit CAPTCHA
      const submitUrl = `http://2captcha.com/in.php?key=${this.apiKey}&method=userrecaptcha&googlekey=${siteKey}&pageurl=${pageUrl}&json=1`;
      const submitRes = await fetch(submitUrl);
      const submitData = await submitRes.json();

      if (submitData.status !== 1) {
        throw new Error(`2Captcha submit failed: ${submitData.request}`);
      }

      const taskId = submitData.request;

      // Poll for solution (max 120 seconds)
      for (let i = 0; i < 24; i++) {
        await new Promise(r => setTimeout(r, 5000));

        const resultUrl = `http://2captcha.com/res.php?key=${this.apiKey}&action=get&id=${taskId}&json=1`;
        const resultRes = await fetch(resultUrl);
        const resultData = await resultRes.json();

        if (resultData.status === 1) {
          return resultData.request;
        }

        if (resultData.request !== 'CAPCHA_NOT_READY') {
          throw new Error(`2Captcha error: ${resultData.request}`);
        }
      }

      throw new Error('CAPTCHA solving timed out');
    } catch (error) {
      console.error('CAPTCHA solving failed:', error.message);
      return null;
    }
  }

  /**
   * Check if CAPTCHA is present on a page
   */
  async detectCaptcha(page) {
    return page.evaluate(() => {
      return !!(
        document.querySelector('.g-recaptcha') ||
        document.querySelector('[data-sitekey]') ||
        document.querySelector('iframe[src*="recaptcha"]')
      );
    });
  }
}

const captchaSolver = new CaptchaSolver();
export default captchaSolver;
