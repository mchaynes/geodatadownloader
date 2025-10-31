/**
 * Cleans and normalizes ArcGIS layer URLs by:
 * - Removing query parameters and hash fragments
 * - Removing /query suffix (common user mistake)
 * - Removing trailing slashes
 *
 * @param rawUrl - The raw URL input from the user
 * @returns The cleaned and normalized URL
 */
export function cleanArcGISUrl(rawUrl: string): string {
  let cleaned = (rawUrl ?? "").trim();

  try {
    const url = new URL(cleaned);
    cleaned = url.origin + url.pathname;
  } catch (e) {
    // If URL parsing fails, fall back to simple string manipulation
    cleaned = cleaned.split('?')[0].split('#')[0];
  }

  // Remove /query suffix (case-insensitive)
  cleaned = cleaned.replace(/\/query\/?$/i, '');

  // Remove trailing slashes
  cleaned = cleaned.replace(/\/+$/, '');

  return cleaned;
}
