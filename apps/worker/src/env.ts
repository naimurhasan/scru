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
  SESSION_POOL_SIZE: z.coerce.number().int().min(0).default(2),
  WEBSHARE_USERNAME: z.string().default(""),
  WEBSHARE_PASSWORD: z.string().default(""),
  WEBSHARE_POOL_SIZE: z.coerce.number().int().positive().default(10),
  TWOCAPTCHA_API_KEY: z.string().default(""),
  OPENROUTER_API_KEY: z.string().default(""),
  OPENROUTER_MODEL: z.string().default(""),
});

export const loadEnv = (source: NodeJS.ProcessEnv = process.env) => {
  const env = envSchema.parse(source);
  return {
    databaseUrl: env.DATABASE_URL,
    redisUrl: env.REDIS_URL,
    profileDir: env.BROWSER_PROFILE_DIR,
    headless: env.BROWSER_HEADLESS === "true",
    allowPrivateWebhooks: env.WEBHOOK_ALLOW_PRIVATE === "true",
    sessionPoolSize: env.SESSION_POOL_SIZE,
    webshare:
      env.WEBSHARE_USERNAME && env.WEBSHARE_PASSWORD
        ? {
            username: env.WEBSHARE_USERNAME,
            password: env.WEBSHARE_PASSWORD,
            poolSize: env.WEBSHARE_POOL_SIZE,
          }
        : null,
    twoCaptchaApiKey: env.TWOCAPTCHA_API_KEY || null,
    openRouter:
      env.OPENROUTER_API_KEY && env.OPENROUTER_MODEL
        ? { apiKey: env.OPENROUTER_API_KEY, model: env.OPENROUTER_MODEL }
        : null,
  };
};
