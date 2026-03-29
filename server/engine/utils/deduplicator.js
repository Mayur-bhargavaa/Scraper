import stringSimilarity from 'string-similarity';
import Lead from '../../src/models/Lead.js';

/**
 * Deduplicator — Removes duplicate leads based on phone, website, and business name
 */

/**
 * Normalize phone number for comparison
 */
const normalizePhone = (phone) => {
  if (!phone) return '';
  return phone.replace(/[\s\-\(\)\+\.]/g, '').slice(-10);
};

/**
 * Normalize website URL for comparison
 */
const normalizeWebsite = (url) => {
  if (!url) return '';
  return url
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/+$/, '')
    .split('/')[0]; // Just the domain
};

/**
 * Check if a lead is a duplicate of any existing lead for the same user
 * Returns the duplicate lead if found, null otherwise
 */
export const findDuplicate = async (lead, userId) => {
  const conditions = [];

  // Phone match
  const normalizedPhone = normalizePhone(lead.phone);
  if (normalizedPhone.length >= 7) {
    conditions.push({
      userId,
      phone: { $regex: normalizedPhone.slice(-7) },
    });
  }

  // Website match
  const normalizedSite = normalizeWebsite(lead.website);
  if (normalizedSite) {
    conditions.push({
      userId,
      website: { $regex: normalizedSite.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' },
    });
  }

  if (conditions.length === 0) {
    // No phone or website — fallback to name similarity
    return findByNameSimilarity(lead.businessName, userId);
  }

  const existing = await Lead.findOne({ $or: conditions });
  return existing;
};

/**
 * Fuzzy name matching fallback
 */
const findByNameSimilarity = async (businessName, userId) => {
  if (!businessName) return null;

  // Get recent leads with similar-looking names
  const candidates = await Lead.find({ userId })
    .select('businessName')
    .sort({ createdAt: -1 })
    .limit(500)
    .lean();

  for (const candidate of candidates) {
    const similarity = stringSimilarity.compareTwoStrings(
      businessName.toLowerCase(),
      candidate.businessName.toLowerCase()
    );

    if (similarity >= 0.85) {
      return candidate;
    }
  }

  return null;
};

/**
 * Deduplicate an array of raw leads against existing DB leads
 * Returns { unique: Lead[], duplicateCount: number }
 */
export const deduplicateLeads = async (leads, userId) => {
  const unique = [];
  let duplicateCount = 0;

  // Also track duplicates within the batch itself
  const seenPhones = new Set();
  const seenSites = new Set();

  for (const lead of leads) {
    const normalizedPhone = normalizePhone(lead.phone);
    const normalizedSite = normalizeWebsite(lead.website);

    // In-batch duplicate check
    if (normalizedPhone && seenPhones.has(normalizedPhone)) {
      duplicateCount++;
      continue;
    }
    if (normalizedSite && seenSites.has(normalizedSite)) {
      duplicateCount++;
      continue;
    }

    // DB duplicate check
    const existing = await findDuplicate(lead, userId);
    if (existing) {
      duplicateCount++;
      continue;
    }

    if (normalizedPhone) seenPhones.add(normalizedPhone);
    if (normalizedSite) seenSites.add(normalizedSite);
    unique.push(lead);
  }

  return { unique, duplicateCount };
};
