import "server-only";
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.url(),
  API_URL: z.url(),
  INTERNAL_API_TOKEN: z.string().min(24),
  BETTER_AUTH_SECRET: z.string().min(24),
  BETTER_AUTH_URL: z.url(),
});

export const env = envSchema.parse(process.env);
