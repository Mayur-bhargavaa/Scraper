import * as cheerio from 'cheerio';

/**
 * Link Scraper — Extracts social media URLs from business websites
 */

const SOCIAL_PATTERNS = {
  facebook: /facebook\.com\/(?:pages\/|groups\/|profile\.php\?id=)?([a-zA-Z0-9.]+)/i,
  instagram: /instagram\.com\/([a-zA-Z0-9._]+)/i,
  twitter: /(?:twitter\.com|x\.com)\/([a-zA-Z0-9_]+)/i,
  linkedin: /linkedin\.com\/(?:company|school|in)\/([a-zA-Z0-9-._%]+)/i,
};

/**
 * Extract social links from a business website
 * @param {string} url - The business website URL
 * @returns {object} Maps social platforms to URLs
 */
export const extractSocialLinks = async (url) => {
  if (!url) return {};

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) return {};
    const html = await response.text();
    const $ = cheerio.load(html);
    const links = $('a[href]');

    const results = {
      facebook: '',
      instagram: '',
      twitter: '',
      linkedin: '',
    };

    links.each((_, el) => {
      const href = $(el).attr('href');
      if (!href) return;

      Object.entries(SOCIAL_PATTERNS).forEach(([platform, regex]) => {
        if (!results[platform] && regex.test(href)) {
          // Normalize to full URL if it's a relative path or just the handle (rare in href, but good safety)
          results[platform] = href.startsWith('http') ? href : `https://${href}`;
        }
      });
    });

    return results;
  } catch (error) {
    console.warn(`Social extraction failed for ${url}:`, error.message);
    return {};
  }
};
