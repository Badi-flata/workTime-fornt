/**
 * Helper to construct the full image URL.
 * Handles:
 * 1. Absolute URLs (http://, https://, data:, blob:) -> returns as-is.
 * 2. Relative upload paths (/uploads/...) -> prepends backend API base URL (http://localhost:3030 or env).
 * 3. Null / undefined / empty -> returns undefined.
 */
export function getAvatarUrl(url?: string | null): string | undefined {
  if (!url || typeof url !== 'string') return undefined;

  const trimmed = url.trim();
  if (!trimmed) return undefined;

  // Already a full or data/blob URL
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }

  // Determine backend base URL (defaulting to http://localhost:3030 in development)
  const backendBase =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_DEV_API_URL ||
    'http://localhost:3030';

  const cleanBase = backendBase.replace(/\/+$/, '');
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;

  return `${cleanBase}${cleanPath}`;
}
