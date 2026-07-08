import { z } from "zod";

const flag = z.enum(["true", "false"]).default("false");

const envSchema = z.object({
  DATABASE_URL: z.url(),
  REDIS_URL: z.url(),
  INTERNAL_API_TOKEN: z.string().min(24),
  API_PORT: z.coerce.number().int().positive().default(4000),
  SYNC_TIMEOUT_MS: z.coerce.number().int().positive().default(120_000),
  RATE_LIMIT_PER_SECOND: z.coerce.number().int().positive().default(10),
  WEBHOOK_ALLOW_PRIVATE: flag,
});

export const loadEnv = (source: NodeJS.ProcessEnv = process.env) => {
  const env = envSchema.parse(source);
  return {
    databaseUrl: env.DATABASE_URL,
    redisUrl: env.REDIS_URL,
    internalToken: env.INTERNAL_API_TOKEN,
    port: env.API_PORT,
    syncTimeoutMs: env.SYNC_TIMEOUT_MS,
    rateLimitPerSecond: env.RATE_LIMIT_PER_SECOND,
    allowPrivateWebhooks: env.WEBHOOK_ALLOW_PRIVATE === "true",
  };
};
