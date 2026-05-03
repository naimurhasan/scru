import { resolve } from "node:path";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { createDatabase } from "../src/client.ts";
import { requireEnv } from "../src/requireEnv.ts";

const { db, close } = createDatabase(requireEnv("DATABASE_URL"));

try {
  await migrate(db, {
    migrationsFolder: resolve(import.meta.dirname, "../drizzle"),
  });
  console.log("Migrations applied");
} finally {
  await close();
}
