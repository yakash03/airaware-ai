// AirAware AI V2 — Server-side In-Memory TTL Cache
// Preserves original observedAt timestamps while avoiding duplicate remote network calls

interface CacheEntry<T> {
  data: T;
  cachedAt: number;
  expiresAt: number;
}

class TtlCache {
  private cache = new Map<string, CacheEntry<unknown>>();

  /**
   * Retrieve cached value if not expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Set cached value with TTL in milliseconds
   */
  set<T>(key: string, data: T, ttlMs: number): void {
    const now = Date.now();
    this.cache.set(key, {
      data,
      cachedAt: now,
      expiresAt: now + ttlMs,
    });
  }

  /**
   * Invalidate a single key
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Purge expired items
   */
  purgeExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

// Global singleton for server runtimes
const globalForCache = globalThis as unknown as { __airaware_cache__?: TtlCache };
export const cache = globalForCache.__airaware_cache__ ?? new TtlCache();
if (process.env.NODE_ENV !== 'production') {
  globalForCache.__airaware_cache__ = cache;
}
