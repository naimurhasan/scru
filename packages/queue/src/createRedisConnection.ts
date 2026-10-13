import { Redis } from "ioredis";

export const createRedisConnection = (redisUrl: string): Redis =>
  new Redis(redisUrl, { maxRetriesPerRequest: null });
