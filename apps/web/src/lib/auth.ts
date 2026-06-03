import "server-only";
import {
  account,
  createWorkspace,
  session,
  user,
  verification,
} from "@scru/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/lib/db";
import { env } from "@/lib/env";

const STARTING_CREDITS = 500;

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { user, session, account, verification },
  }),
  emailAndPassword: { enabled: true, minPasswordLength: 8 },
  databaseHooks: {
    user: {
      create: {
        after: async (created) => {
          await createWorkspace(db, {
            name: `${created.name}'s workspace`,
            credits: STARTING_CREDITS,
            ownerId: created.id,
          });
        },
      },
    },
  },
  plugins: [nextCookies()],
});
