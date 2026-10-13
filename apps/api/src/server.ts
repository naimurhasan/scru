import { serve } from "@hono/node-server";
import {
  chargeCredits,
  createDatabase,
  findActiveApiKey,
  insertRequestLog,
} from "@scru/db";
import { createSearchClient } from "@scru/queue";
import { createApp } from "./app.ts";
import { loadEnv } from "./env.ts";

const env = loadEnv();
const database = createDatabase(env.databaseUrl);
const searchClient = createSearchClient(env.redisUrl, env.syncTimeoutMs);

const app = createApp({
  findApiKey: (keyHash) => findActiveApiKey(database.db, keyHash),
  chargeCredits: (workspaceId, amount) =>
    chargeCredits(database.db, workspaceId, amount),
  recordRequest: (log) => insertRequestLog(database.db, log),
  searchGoogle: searchClient.searchGoogle,
});

const server = serve({ fetch: app.fetch, port: env.port }, ({ port }) =>
  console.log(`API listening on http://localhost:${port}`),
);

const shutdown = async () => {
  server.close();
  await searchClient.close();
  await database.close();
  process.exit(0);
};

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
