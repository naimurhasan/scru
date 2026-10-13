import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as authSchema from "./authSchema.ts";
import * as schema from "./schema.ts";

export const createDatabase = (url: string) => {
  const connection = postgres(url, { onnotice: () => undefined });
  return {
    db: drizzle(connection, { schema: { ...schema, ...authSchema } }),
    close: () => connection.end(),
  };
};

export type Database = ReturnType<typeof createDatabase>["db"];

export type Transaction = Parameters<Parameters<Database["transaction"]>[0]>[0];

export type Executor = Database | Transaction;
