import "server-only";
import { createDatabase, type Database } from "@scru/db";
import { env } from "@/lib/env";

const store = globalThis as { scruDatabase?: Database };

export const db = (store.scruDatabase ??= createDatabase(env.DATABASE_URL).db);
