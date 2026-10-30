import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

let redisClient = null;
let isRedisConnected = false;

// Fallback in-memory cache if Redis is offline during local development
const memoryCache = new Map();

try {
  redisClient = new Redis({
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: 1,
    retryStrategy(times) {
      if (times > 3) {
        return null; // Stop retrying after 3 attempts in dev
      }
      return Math.min(times * 1000, 3000);
    },
    lazyConnect: true
  });

  redisClient.connect().then(() => {
    isRedisConnected = true;
    console.log('⚡️ [Redis] Connected successfully to Redis cache server');
  }).catch((err) => {
    isRedisConnected = false;
    console.warn(`⚠️ [Redis] Could not connect to Redis (${err.message}). Using high-performance in-memory cache fallback.`);
  });

  redisClient.on('connect', () => {
    isRedisConnected = true;
  });

  redisClient.on('error', (err) => {
    isRedisConnected = false;
  });
} catch (e) {
  isRedisConnected = false;
  console.warn('⚠️ [Redis] Client init error:', e.message);
}

export async function getCache(key) {
  if (isRedisConnected && redisClient) {
    try {
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (err) {
      console.warn(`[Redis get error for ${key}]:`, err.message);
    }
  }

  // Fallback to memoryCache
  const item = memoryCache.get(key);
  if (!item) return null;
  if (item.expiresAt && Date.now() > item.expiresAt) {
    memoryCache.delete(key);
    return null;
  }
  return item.value;
}

export async function setCache(key, value, ttlSeconds = 300) {
  const serialized = JSON.stringify(value);

  if (isRedisConnected && redisClient) {
    try {
      await redisClient.set(key, serialized, 'EX', ttlSeconds);
      return true;
    } catch (err) {
      console.warn(`[Redis set error for ${key}]:`, err.message);
    }
  }

  // Fallback to memoryCache
  memoryCache.set(key, {
    value,
    expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : null
  });
  return true;
}

export async function delCache(key) {
  if (isRedisConnected && redisClient) {
    try {
      await redisClient.del(key);
    } catch (err) {
      console.warn(`[Redis del error for ${key}]:`, err.message);
    }
  }
  memoryCache.delete(key);
}

export async function delCachePattern(pattern) {
  if (isRedisConnected && redisClient) {
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(...keys);
      }
    } catch (err) {
      console.warn(`[Redis pattern del error]:`, err.message);
    }
  }

  const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
  for (const k of memoryCache.keys()) {
    if (regex.test(k)) {
      memoryCache.delete(k);
    }
  }
}

export function getRedisStatus() {
  return {
    type: 'Redis',
    connected: isRedisConnected,
    mode: isRedisConnected ? 'redis-cache' : 'in-memory-cache-fallback',
    keysCount: isRedisConnected ? 'managed-by-redis' : memoryCache.size
  };
}

export default { getCache, setCache, delCache, delCachePattern, getRedisStatus };
