import * as cheerio from 'cheerio';

/**
 * Email Scraper — Crawls business websites to extract email addresses
 * Checks homepage, /contact, /about, and footer sections
 */

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

const COMMON_EMAIL_PATHS = [
  '',           // homepage
  '/contact',
  '/contact-us',
  '/about',
  '/about-us',
  '/team',
  '/support',
  '/imprint',
  '/impressum',
];

const EXCLUDED_EMAILS = new Set([
  'example@example.com',
  'email@example.com',
  'your@email.com',
  'name@domain.com',
  'support@wix.com',
  'support@squarespace.com',
  'noreply@google.com',
]);

/**
 * Extract emails from a business website
 * @param {string} websiteUrl - The business website URL
 * @returns {string|null} Best email found, or null
 */
export const extractEmails = async (websiteUrl) => {
  if (!websiteUrl) return null;

  const allEmails = new Set();

  // Normalize URL
  let baseUrl = websiteUrl;
  if (!baseUrl.startsWith('http')) {
    baseUrl = `https://${baseUrl}`;
  }
  baseUrl = baseUrl.replace(/\/+$/, '');

  // Crawl multiple pages
  for (const path of COMMON_EMAIL_PATHS) {
    try {
      const url = `${baseUrl}${path}`;
      const emails = await scrapePageForEmails(url);
      emails.forEach(e => allEmails.add(e));

      // Found good emails — stop crawling more pages
      if (allEmails.size >= 3) break;
    } catch (_) {
      continue;
    }
  }

  // Try mailto: links if no emails found
  if (allEmails.size === 0) {
    try {
      const emails = await scrapeMailtoLinks(baseUrl);
      emails.forEach(e => allEmails.add(e));
    } catch (_) {
      // Ignore
    }
  }

  // Filter and prioritize
  const filtered = [...allEmails].filter(email =>
    !EXCLUDED_EMAILS.has(email.toLowerCase()) &&
    !email.includes('sentry') &&
    !email.includes('webpack') &&
    !email.endsWith('.png') &&
    !email.endsWith('.jpg') &&
    email.length < 100
  );

  return prioritizeEmail(filtered);
};

/**
 * Scrape a single page for email addresses
 */
async function scrapePageForEmails(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      redirect: 'follow',
    });

    clearTimeout(timeout);

    if (!response.ok) return [];

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) return [];

    const html = await response.text();
    const $ = cheerio.load(html);

    // Remove script and style tags
    $('script, style, noscript').remove();

    const bodyText = $.html();
    const matches = bodyText.match(EMAIL_REGEX) || [];

    // Also check meta tags
    const metaEmails = [];
    $('meta[content]').each((_, el) => {
      const content = $(el).attr('content') || '';
      const metaMatch = content.match(EMAIL_REGEX);
      if (metaMatch) metaEmails.push(...metaMatch);
    });

    // Check mailto links
    const mailtoEmails = [];
    $('a[href^="mailto:"]').each((_, el) => {
      const href = $(el).attr('href') || '';
      const email = href.replace('mailto:', '').split('?')[0].trim();
      if (email && EMAIL_REGEX.test(email)) {
        mailtoEmails.push(email);
      }
    });

    return [...new Set([...mailtoEmails, ...metaEmails, ...matches])];
  } catch (error) {
    clearTimeout(timeout);
    return [];
  }
}

/**
 * Specifically look for mailto: links
 */
async function scrapeMailtoLinks(url) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      signal: AbortSignal.timeout(8000),
    });

    const html = await response.text();
    const $ = cheerio.load(html);

    const emails = [];
    $('a[href^="mailto:"]').each((_, el) => {
      const email = ($(el).attr('href') || '').replace('mailto:', '').split('?')[0].trim();
      if (email) emails.push(email);
    });

    return emails;
  } catch (_) {
    return [];
  }
}

/**
 * Prioritize best email from list
 * Prefers: info@ > contact@ > hello@ > admin@ > general > others
 */
function prioritizeEmail(emails) {
  if (emails.length === 0) return null;

  const priority = ['info@', 'contact@', 'hello@', 'admin@', 'sales@', 'support@'];

  for (const prefix of priority) {
    const match = emails.find(e => e.toLowerCase().startsWith(prefix));
    if (match) return match.toLowerCase();
  }

  return emails[0].toLowerCase();
}
