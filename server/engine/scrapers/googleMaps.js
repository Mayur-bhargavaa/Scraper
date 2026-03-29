import browserPool from '../utils/browserPool.js';
import { actionDelay, microDelay, humanScroll, randomMouseMove } from '../utils/antiBlock.js';
import captchaSolver from '../utils/captchaSolver.js';

/**
 * Google Maps Scraper — Extracts business data from Google Maps search results
 * Uses Playwright with stealth settings and anti-blocking measures
 */

/**
 * Scrape Google Maps for businesses matching query
 * @param {Object} params
 * @param {string} params.keyword - Search keyword
 * @param {string} params.location - Location (city, country)
 * @param {number} params.radius - Search radius in km
 * @param {function} params.onProgress - Progress callback ({ found, processed, message })
 * @returns {Array} Array of raw lead objects
 */
export const scrapeGoogleMaps = async ({ keyword, location, radius, onProgress }) => {
  const searchQuery = `${keyword} in ${location}`;
  const results = [];
  let browser = null;

  try {
    // Acquire browser from pool
    browser = await browserPool.acquire();
    const { page, context } = await browserPool.createPage(browser);

    onProgress?.({ message: 'Launching browser...', found: 0, processed: 0 });

    // Enter search query directly via URL
    onProgress?.({ message: `Searching: "${searchQuery}"...`, found: 0, processed: 0 });
    
    const searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(searchQuery)}`;
    await page.goto(searchUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    await actionDelay();

    // Handle consent/cookie banner if present
    try {
      const consentBtn = page.locator('button:has-text("Accept all")');
      if (await consentBtn.isVisible({ timeout: 3000 })) {
        await consentBtn.click();
        await microDelay();
      }
    } catch (_) {
      // No consent banner — continue
    }

    // Check for CAPTCHA
    if (await captchaSolver.detectCaptcha(page)) {
      onProgress?.({ message: 'CAPTCHA detected, attempting to solve...' });
      // For now, just wait and hope it resolves
      await actionDelay();
    }

    // Wait for results to load
    await page.waitForSelector('div[role="feed"]', { timeout: 15000 }).catch(() => null);
    await actionDelay();

    // Scroll to load all results
    onProgress?.({ message: 'Scrolling to load all results...', found: 0, processed: 0 });

    const feed = page.locator('div[role="feed"]');
    let previousHeight = 0;
    let scrollAttempts = 0;
    const maxScrollAttempts = 50;

    while (scrollAttempts < maxScrollAttempts) {
      const currentHeight = await feed.evaluate(el => el.scrollHeight).catch(() => 0);

      if (currentHeight === previousHeight) {
        scrollAttempts++;
        if (scrollAttempts >= 3) break; // Stable height — all loaded
      } else {
        scrollAttempts = 0;
      }

      previousHeight = currentHeight;

      // Scroll with human-like behavior
      await feed.evaluate(el => {
        const step = Math.floor(Math.random() * 400) + 200;
        el.scrollTop += step;
      });

      await page.waitForTimeout(Math.floor(Math.random() * 1500) + 1000);

      // Check for "You've reached the end of the list" message
      const endMessage = await page.locator('p.fontBodyMedium span:has-text("end of the list")').isVisible().catch(() => false);
      if (endMessage) break;

      // Random mouse movement
      if (Math.random() > 0.7) {
        await randomMouseMove(page);
      }
    }

    // Count result cards
    const cards = page.locator('div.Nv2PK');
    const totalCards = await cards.count();

    onProgress?.({ message: `Found ${totalCards} results. Extracting details...`, found: totalCards, processed: 0 });

    // Extract data from each card
    for (let i = 0; i < totalCards; i++) {
      try {
        const card = cards.nth(i);

        // Click to open details panel
        await card.click();
        await page.waitForTimeout(Math.floor(Math.random() * 2000) + 1500);

        // Extract details from the side panel
        const leadData = await extractBusinessDetails(page);

        if (leadData && leadData.businessName) {
          results.push(leadData);
          onProgress?.({
            message: `Extracted: ${leadData.businessName}`,
            found: totalCards,
            processed: i + 1,
          });
        }

        // Random delay between extractions
        await page.waitForTimeout(Math.floor(Math.random() * 1000) + 500);

      } catch (cardError) {
        console.warn(`Failed to extract card ${i}:`, cardError.message);
        continue;
      }
    }

    // Cleanup
    await context.close();

    onProgress?.({
      message: `Extraction complete. ${results.length} leads found.`,
      found: totalCards,
      processed: totalCards,
    });

    return results;

  } catch (error) {
    console.error('Google Maps scraping error:', error.message);
    throw error;
  } finally {
    if (browser) {
      browserPool.release(browser);
    }
  }
};

/**
 * Extract business details from the Google Maps side panel
 */
async function extractBusinessDetails(page) {
  try {
    const data = await page.evaluate(() => {
      const getText = (selector) => {
        const el = document.querySelector(selector);
        return el ? el.textContent.trim() : '';
      };

      const getByAriaLabel = (label) => {
        const el = document.querySelector(`[aria-label*="${label}"]`);
        return el ? el.textContent.trim() : '';
      };

      const getHref = (selector) => {
        const el = document.querySelector(selector);
        return el ? el.href || '' : '';
      };

      // Business name
      const name = getText('h1.DUwDvf') || getText('[data-attrid="title"]');

      // Category
      const category = getText('button.DkEaL') || getText('.DkEaL');

      // Address
      const addressBtn = document.querySelector('[data-item-id="address"] .fontBodyMedium') ||
                         document.querySelector('button[data-item-id="address"]');
      const address = addressBtn ? addressBtn.textContent.trim() : '';

      // Phone
      const phoneBtn = document.querySelector('[data-item-id^="phone:"] .fontBodyMedium') ||
                       document.querySelector('button[data-item-id^="phone:"]');
      const phone = phoneBtn ? phoneBtn.textContent.trim() : '';

      // Website
      const websiteBtn = document.querySelector('a[data-item-id="authority"]') ||
                         document.querySelector('[data-item-id="authority"]');
      const website = websiteBtn ? (websiteBtn.href || websiteBtn.textContent.trim()) : '';

      // Rating
      const ratingEl = document.querySelector('div.F7nice span[aria-hidden="true"]') ||
                       document.querySelector('.fontDisplayLarge');
      const rating = ratingEl ? parseFloat(ratingEl.textContent) || 0 : 0;

      // Reviews count
      const reviewsEl = document.querySelector('div.F7nice span:nth-child(2) span span') ||
                        document.querySelector('[aria-label*="reviews"]');
      let reviews = 0;
      if (reviewsEl) {
        const match = reviewsEl.textContent.match(/[\d,]+/);
        reviews = match ? parseInt(match[0].replace(/,/g, '')) : 0;
      }

      // Working hours
      const hoursEl = document.querySelector('[aria-label*="hours"]') ||
                      document.querySelector('.t39EBf');
      const workingHours = hoursEl ? hoursEl.getAttribute('aria-label') || hoursEl.textContent.trim() : '';

      // Google Maps link
      const mapsLink = window.location.href;

      // Coordinates from URL
      let lat = null, lng = null;
      const coordMatch = mapsLink.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (coordMatch) {
        lat = parseFloat(coordMatch[1]);
        lng = parseFloat(coordMatch[2]);
      }

      return {
        businessName: name,
        category,
        address,
        phone,
        website: website.startsWith('http') ? website : (website ? `https://${website}` : ''),
        rating,
        reviews,
        workingHours,
        mapsLink,
        latitude: lat,
        longitude: lng,
      };
    });

    return data;
  } catch (error) {
    console.warn('Extract details error:', error.message);
    return null;
  }
}
