/**
 * Lead Scorer — Assigns scores and tags based on lead quality signals
 *
 * Scoring Matrix:
 * ┌──────────────────────────────┬───────┐
 * │ Factor                       │ Score │
 * ├──────────────────────────────┼───────┤
 * │ Rating < 3.5                 │ +30   │
 * │ Rating 3.5 - 4.0             │ +20   │
 * │ Rating 4.0 - 4.5             │ +10   │
 * │ Rating > 4.5                 │ +5    │
 * │ No website                   │ +25   │
 * │ Has website, no email        │ +10   │
 * │ Has email                    │ +15   │
 * │ Reviews < 10                 │ +15   │
 * │ Reviews 10-50                │ +10   │
 * │ Reviews 50-200               │ +5    │
 * │ No phone                     │ -10   │
 * └──────────────────────────────┴───────┘
 *
 * Tags:
 * - "High Potential": score >= 50 OR (rating < 4 AND no website)
 * - "Premium": rating >= 4.5 AND reviews >= 100
 * - "Cold": score < 25
 */

export const scoreLead = (lead) => {
  let score = 0;
  const tags = [];

  // Rating scoring
  const rating = lead.rating || 0;
  if (rating > 0 && rating < 3.5) score += 30;
  else if (rating >= 3.5 && rating < 4.0) score += 20;
  else if (rating >= 4.0 && rating < 4.5) score += 10;
  else if (rating >= 4.5) score += 5;

  // Website presence
  if (!lead.website) {
    score += 25;
  } else if (!lead.email) {
    score += 10;
  }

  // Email presence
  if (lead.email) {
    score += 15;
  }

  // Review count
  const reviews = lead.reviews || 0;
  if (reviews < 10) score += 15;
  else if (reviews < 50) score += 10;
  else if (reviews < 200) score += 5;

  // Phone presence
  if (!lead.phone) {
    score -= 10;
  }

  // Clamp score 0-100
  score = Math.max(0, Math.min(100, score));

  // Tag assignment
  if (score >= 50 || (rating > 0 && rating < 4 && !lead.website)) {
    tags.push('High Potential');
  }

  if (rating >= 4.5 && reviews >= 100) {
    tags.push('Premium');
  }

  if (score < 25 && !tags.includes('Premium')) {
    tags.push('Cold');
  }

  return { score, tags };
};

/**
 * Score an array of leads
 */
export const scoreLeads = (leads) => {
  return leads.map(lead => {
    const { score, tags } = scoreLead(lead);
    return { ...lead, score, tags };
  });
};
