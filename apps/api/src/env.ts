import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.url(),
  REDIS_URL: z.url(),
  API_PORT: z.coerce.number().int().positive().default(4000),
  SYNC_TIMEOUT_MS: z.coerce.number().int().positive().default(120_000),
});

export const loadEnv = (source: NodeJS.ProcessEnv = process.env) => {
  const env = envSchema.parse(source);
  return {
    databaseUrl: env.DATABASE_URL,
    redisUrl: env.REDIS_URL,
    port: env.API_PORT,
    syncTimeoutMs: env.SYNC_TIMEOUT_MS,
  };
};
