import { resolve } from "node:path";
import { z } from "zod";

const DEFAULT_PROFILE_DIR = resolve(
  import.meta.dirname,
  "../../../.profiles/cloakbrowser",
);

const flag = z.enum(["true", "false"]).default("false");

const envSchema = z.object({
  DATABASE_URL: z.url(),
  REDIS_URL: z.url(),
  BROWSER_PROFILE_DIR: z.string().default(DEFAULT_PROFILE_DIR),
  BROWSER_HEADLESS: flag,
  WEBHOOK_ALLOW_PRIVATE: flag,
});

export const loadEnv = (source: NodeJS.ProcessEnv = process.env) => {
  const env = envSchema.parse(source);
  return {
    databaseUrl: env.DATABASE_URL,
    redisUrl: env.REDIS_URL,
    profileDir: env.BROWSER_PROFILE_DIR,
    headless: env.BROWSER_HEADLESS === "true",
    allowPrivateWebhooks: env.WEBHOOK_ALLOW_PRIVATE === "true",
  };
};
