// AirAware AI V2 — Bounded Server-Side In-Memory TTL Cache
// Preserves original observedAt timestamps while avoiding duplicate remote calls
// and bounding total entries to prevent unbounded memory growth.

interface CacheEntry<T> {
  data: T;
  cachedAt: number;
  expiresAt: number;
}

const DEFAULT_MAX_ENTRIES = 500;

export class TtlCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private readonly maxEntries: number;

  constructor(maxEntries: number = DEFAULT_MAX_ENTRIES) {
    this.maxEntries = maxEntries;
  }

  /** Retrieve cached value if present and not expired. */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /** Store value with a TTL in milliseconds, evicting oldest entries if at capacity. */
  set<T>(key: string, data: T, ttlMs: number): void {
    const now = Date.now();
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxEntries) {
      this.purgeExpired();
      if (this.cache.size >= this.maxEntries) {
        const oldestKey = this.cache.keys().next().value;
        if (oldestKey !== undefined) {
          this.cache.delete(oldestKey);
        }
      }
    }

    this.cache.set(key, {
      data,
      cachedAt: now,
      expiresAt: now + ttlMs,
    });
  }

  /** Invalidate a single key. */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /** Clear all cache entries. */
  clear(): void {
    this.cache.clear();
  }

  /** Return current cache entry count. */
  size(): number {
    return this.cache.size;
  }

  /** Purge all expired items. */
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
