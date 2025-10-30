import Redis from "ioredis";

// Initialize Redis client
const getRedisClient = () => {
  if (!process.env.REDIS_URL) {
    console.warn("⚠️  REDIS_URL not configured. Caching will be disabled.");
    return null;
  }

  try {
    const redis = new Redis(process.env.REDIS_URL, {
      password: process.env.REDIS_PASSWORD,
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      reconnectOnError(err) {
        const targetError = "READONLY";
        if (err.message.includes(targetError)) {
          // Only reconnect when the error contains "READONLY"
          return true;
        }
        return false;
      },
    });

    redis.on("error", (err) => {
      console.error("❌ Redis Client Error:", err);
    });

    redis.on("connect", () => {
      console.log("✅ Redis connected");
    });

    return redis;
  } catch (error) {
    console.error("❌ Failed to create Redis client:", error);
    return null;
  }
};

export const redis = getRedisClient();

/**
 * Cache key patterns for consistent naming
 */
export const CacheKeys = {
  // District keys
  DISTRICT_LIST: "districts:all",
  DISTRICT_BY_ID: (id: string) => `district:${id}`,
  DISTRICT_BY_CODE: (code: string) => `district:code:${code}`,

  // Metrics keys
  DISTRICT_LATEST: (districtId: string) => `district:${districtId}:latest`,
  DISTRICT_HISTORY: (districtId: string, from?: string, to?: string) =>
    `district:${districtId}:history:${from || "all"}:${to || "now"}`,

  // Comparison keys
  COMPARE: (d1: string, d2: string, metric: string) => `compare:${d1}:${d2}:${metric}`,

  // State-level aggregates
  STATE_LATEST: "state:MH:latest",
  STATE_HISTORY: (from?: string, to?: string) => `state:MH:history:${from || "all"}:${to || "now"}`,
};

/**
 * TTL (Time To Live) configurations in seconds
 */
export const CacheTTL = {
  DISTRICT_LIST: 24 * 60 * 60, // 24 hours
  DISTRICT_DETAIL: 24 * 60 * 60, // 24 hours
  LATEST_METRICS: 12 * 60 * 60, // 12 hours
  HISTORY_METRICS: 6 * 60 * 60, // 6 hours
  COMPARISON: 6 * 60 * 60, // 6 hours
  STATE_AGGREGATES: 12 * 60 * 60, // 12 hours
};

/**
 * Get cached data with type safety
 */
export async function getCached<T>(key: string): Promise<T | null> {
  if (!redis) return null;

  try {
    const cached = await redis.get(key);
    if (!cached) return null;
    return JSON.parse(cached) as T;
  } catch (error) {
    console.error(`❌ Cache GET error for key ${key}:`, error);
    return null;
  }
}

/**
 * Set cached data with TTL
 */
export async function setCached<T>(key: string, data: T, ttl: number): Promise<boolean> {
  if (!redis) return false;

  try {
    await redis.setex(key, ttl, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`❌ Cache SET error for key ${key}:`, error);
    return false;
  }
}

/**
 * Invalidate cache by key or pattern
 */
export async function invalidateCache(pattern: string): Promise<number> {
  if (!redis) return 0;

  try {
    const keys = await redis.keys(pattern);
    if (keys.length === 0) return 0;

    const result = await redis.del(...keys);
    console.log(`🗑️  Invalidated ${result} cache keys matching: ${pattern}`);
    return result;
  } catch (error) {
    console.error(`❌ Cache invalidation error for pattern ${pattern}:`, error);
    return 0;
  }
}

/**
 * Clear all district-related caches
 * Useful after data ingestion
 */
export async function invalidateDistrictCaches(districtId?: string): Promise<void> {
  if (!redis) return;

  try {
    if (districtId) {
      // Invalidate specific district caches
      await invalidateCache(`district:${districtId}:*`);
      await invalidateCache(`compare:${districtId}:*`);
      await invalidateCache(`compare:*:${districtId}:*`);
    } else {
      // Invalidate all district caches
      await invalidateCache("district:*");
      await invalidateCache("districts:*");
      await invalidateCache("compare:*");
      await invalidateCache("state:*");
    }
  } catch (error) {
    console.error("❌ Error invalidating district caches:", error);
  }
}

/**
 * Health check for Redis connection
 */
export async function checkRedisHealth(): Promise<boolean> {
  if (!redis) return false;

  try {
    const pong = await redis.ping();
    return pong === "PONG";
  } catch (error) {
    console.error("❌ Redis health check failed:", error);
    return false;
  }
}

export default redis;
