/**
 * Convert an agent name to a URL-safe slug.
 *   "Nova" → "nova"
 *   "Silas "Penny-Pincher" Sterling" → "silas-penny-pincher-sterling"
 */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
