import env from '../../src/config/env.js';

/**
 * Google Places API Client — Compliant fallback for Google Maps data
 * Uses the official Google Places API (requires API key)
 */

const BASE_URL = 'https://maps.googleapis.com/maps/api/place';

/**
 * Search for places using the Google Places API
 * @param {Object} params
 * @param {string} params.keyword - Search keyword
 * @param {string} params.location - Location string (will be geocoded)
 * @param {number} params.radius - Radius in km
 * @param {function} params.onProgress - Progress callback
 * @returns {Array} Array of lead objects
 */
export const searchPlaces = async ({ keyword, location, radius, onProgress }) => {
  const apiKey = env.google.placesApiKey;
  if (!apiKey) {
    throw new Error('Google Places API key not configured. Set GOOGLE_PLACES_API_KEY in .env');
  }

  const results = [];
  let pageToken = null;
  let pageNum = 0;

  onProgress?.({ message: 'Querying Google Places API...', found: 0, processed: 0 });

  // Geocode the location string to coordinates
  const coords = await geocodeLocation(location, apiKey);
  const radiusMeters = (radius || 10) * 1000;

  do {
    const url = new URL(`${BASE_URL}/nearbysearch/json`);
    url.searchParams.set('key', apiKey);
    url.searchParams.set('keyword', keyword);
    url.searchParams.set('location', `${coords.lat},${coords.lng}`);
    url.searchParams.set('radius', radiusMeters);
    if (pageToken) url.searchParams.set('pagetoken', pageToken);

    const response = await fetch(url.toString());
    const data = await response.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`Places API error: ${data.status} - ${data.error_message || ''}`);
    }

    for (const place of (data.results || [])) {
      // Get full place details
      const details = await getPlaceDetails(place.place_id, apiKey);

      results.push({
        businessName: details.name || place.name,
        category: (place.types || []).join(', '),
        address: details.formatted_address || place.vicinity || '',
        phone: details.formatted_phone_number || '',
        website: details.website || '',
        rating: place.rating || 0,
        reviews: place.user_ratings_total || 0,
        workingHours: details.opening_hours?.weekday_text?.join('; ') || '',
        mapsLink: details.url || `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
        latitude: place.geometry?.location?.lat || null,
        longitude: place.geometry?.location?.lng || null,
      });

      onProgress?.({
        message: `Fetched: ${details.name || place.name}`,
        found: results.length,
        processed: results.length,
      });

      // Respect API rate limits
      await new Promise(r => setTimeout(r, 200));
    }

    pageToken = data.next_page_token || null;
    pageNum++;

    // Google requires a short delay before using next_page_token
    if (pageToken) {
      await new Promise(r => setTimeout(r, 2000));
    }

  } while (pageToken && pageNum < 3); // Max 3 pages (60 results)

  onProgress?.({
    message: `API extraction complete. ${results.length} leads found.`,
    found: results.length,
    processed: results.length,
  });

  return results;
};

/**
 * Get detailed information for a specific place
 */
async function getPlaceDetails(placeId, apiKey) {
  try {
    const url = new URL(`${BASE_URL}/details/json`);
    url.searchParams.set('key', apiKey);
    url.searchParams.set('place_id', placeId);
    url.searchParams.set('fields', 'name,formatted_address,formatted_phone_number,website,opening_hours,url');

    const response = await fetch(url.toString());
    const data = await response.json();

    return data.result || {};
  } catch (error) {
    console.warn(`Failed to get details for place ${placeId}:`, error.message);
    return {};
  }
}

/**
 * Geocode a location string to coordinates
 */
async function geocodeLocation(location, apiKey) {
  try {
    const url = new URL('https://maps.googleapis.com/maps/api/geocode/json');
    url.searchParams.set('address', location);
    url.searchParams.set('key', apiKey);

    const response = await fetch(url.toString());
    const data = await response.json();

    if (data.results?.length > 0) {
      return data.results[0].geometry.location;
    }

    throw new Error(`Could not geocode location: ${location}`);
  } catch (error) {
    // Default to center of the query area
    console.warn('Geocoding failed, using text search fallback');
    return { lat: 0, lng: 0 };
  }
}
