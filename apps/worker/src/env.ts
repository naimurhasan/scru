import { resolve } from "node:path";
import { z } from "zod";

const DEFAULT_PROFILE_DIR = resolve(
  import.meta.dirname,
  "../../../.profiles/cloakbrowser",
);

const envSchema = z.object({
  REDIS_URL: z.url(),
  BROWSER_PROFILE_DIR: z.string().default(DEFAULT_PROFILE_DIR),
  BROWSER_HEADLESS: z.enum(["true", "false"]).default("false"),
});

export const loadEnv = (source: NodeJS.ProcessEnv = process.env) => {
  const env = envSchema.parse(source);
  return {
    redisUrl: env.REDIS_URL,
    profileDir: env.BROWSER_PROFILE_DIR,
    headless: env.BROWSER_HEADLESS === "true",
  };
};
