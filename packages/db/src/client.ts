import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.ts";

export const createDatabase = (url: string) => {
  const connection = postgres(url, { onnotice: () => undefined });
  return {
    db: drizzle(connection, { schema }),
    close: () => connection.end(),
  };
};

export type Database = ReturnType<typeof createDatabase>["db"];
