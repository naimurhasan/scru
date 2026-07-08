import { createRedisConnection } from "./createRedisConnection.ts";

export type RateDecision = {
  allowed: boolean;
  limit: number;
  remaining: number;
};

export type ConcurrencyDecision = {
  acquired: boolean;
  limit: number;
  current: number;
};

export type UsageLimiter = {
  takeRateSlot: (workspaceId: string) => Promise<RateDecision>;
  acquireConcurrency: (
    workspaceId: string,
    limit: number,
  ) => Promise<ConcurrencyDecision>;
  releaseConcurrency: (workspaceId: string) => Promise<void>;
};

const MILLISECONDS_PER_SECOND = 1_000;
const RATE_KEY_TTL_SECONDS = 2;
const CONCURRENCY_KEY_TTL_SECONDS = 600;

const rateKey = (workspaceId: string, now: number) =>
  `scru:rate:${workspaceId}:${Math.floor(now / MILLISECONDS_PER_SECOND)}`;

const concurrencyKey = (workspaceId: string) =>
  `scru:concurrency:${workspaceId}`;

export const createUsageLimiter = (redisUrl: string, ratePerSecond: number) => {
  const redis = createRedisConnection(redisUrl);

  const limiter: UsageLimiter = {
    takeRateSlot: async (workspaceId) => {
      const key = rateKey(workspaceId, Date.now());
      const used = await redis.incr(key);
      if (used === 1) await redis.expire(key, RATE_KEY_TTL_SECONDS);
      return {
        allowed: used <= ratePerSecond,
        limit: ratePerSecond,
        remaining: Math.max(ratePerSecond - used, 0),
      };
    },
    acquireConcurrency: async (workspaceId, limit) => {
      const key = concurrencyKey(workspaceId);
      const current = await redis.incr(key);
      await redis.expire(key, CONCURRENCY_KEY_TTL_SECONDS);
      if (current <= limit) return { acquired: true, limit, current };
      await redis.decr(key);
      return { acquired: false, limit, current: current - 1 };
    },
    releaseConcurrency: async (workspaceId) => {
      const remaining = await redis.decr(concurrencyKey(workspaceId));
      if (remaining < 0) await redis.set(concurrencyKey(workspaceId), 0);
    },
  };

  return { limiter, close: () => redis.disconnect() };
};
