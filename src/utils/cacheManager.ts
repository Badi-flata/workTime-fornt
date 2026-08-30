/**
 * High-performance, memory-safe in-memory cache manager with key obfuscation,
 * TTL expiration, and tag-based invalidation.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttlMs: number;
  tag: string;
}

/**
 * Simple fast hash function to obfuscate IDs and roles in cache keys.
 */
export function hashKeySegment(input: string): string {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 33) ^ input.charCodeAt(i);
  }
  return (hash >>> 0).toString(36);
}

/**
 * Generates a secured, obfuscated cache key from namespace, IDs, and query params.
 */
export function createSecureCacheKey(
  namespace: string,
  identifiers: Record<string, string | number | undefined | null>
): string {
  const parts = Object.entries(identifiers)
    .filter(([_, val]) => val !== undefined && val !== null && val !== '')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}_${hashKeySegment(String(v))}`);
  return `${namespace}::${parts.join('::')}`;
}

class CacheManager {
  private cache = new Map<string, CacheEntry<unknown>>();

  /**
   * Store data in cache.
   * @param key Generated cache key
   * @param data Payload to store
   * @param tag Category tag for batch invalidation (e.g. 'attendance', 'managing', 'profile')
   * @param ttlMinutes Duration in minutes before expiry (default 5 min)
   */
  set<T>(key: string, data: T, tag = 'general', ttlMinutes = 5): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttlMs: ttlMinutes * 60 * 1000,
      tag,
    });
  }

  /**
   * Retrieve cached data if valid, returns null if expired or missing.
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > entry.ttlMs;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }
    return entry.data;
  }

  /**
   * Retrieve cached snapshot even if expired (useful for stale-while-error fallback).
   */
  getStale<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    return entry ? entry.data : null;
  }

  /**
   * Invalidate all keys associated with a specific tag or namespace prefix.
   */
  invalidateTag(tag: string): void {
    const keysToDelete: string[] = [];
    this.cache.forEach((entry, key) => {
      if (entry.tag === tag || key.startsWith(`${tag}::`)) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach((k) => this.cache.delete(k));
  }

  /**
   * Clear entire cache.
   */
  clear(): void {
    this.cache.clear();
  }
}

export const globalCache = new CacheManager();
