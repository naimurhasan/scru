import { serve } from "@hono/node-server";
import {
  chargeCredits,
  createDatabase,
  createTask,
  findActiveApiKey,
  findTask,
  findWorkspaceActor,
  insertRequestLog,
} from "@scru/db";
import { createSearchClient, createUsageLimiter } from "@scru/queue";
import { createApp } from "./app.ts";
import { loadEnv } from "./env.ts";

const env = loadEnv();
const database = createDatabase(env.databaseUrl);
const searchClient = createSearchClient(env.redisUrl, env.syncTimeoutMs);
const usage = createUsageLimiter(env.redisUrl, env.rateLimitPerSecond);

const app = createApp(
  {
    findApiKey: (keyHash) => findActiveApiKey(database.db, keyHash),
    findWorkspaceActor: (workspaceId) =>
      findWorkspaceActor(database.db, workspaceId),
    chargeCredits: (workspaceId, amount) =>
      chargeCredits(database.db, workspaceId, amount),
    recordRequest: (log) => insertRequestLog(database.db, log),
    searchGoogle: searchClient.searchGoogle,
    createTask: (task) => createTask(database.db, task),
    findTask: (workspaceId, taskId) =>
      findTask(database.db, workspaceId, taskId),
    enqueueTask: searchClient.enqueueTask,
    limits: usage.limiter,
  },
  {
    internalToken: env.internalToken,
    allowPrivateWebhooks: env.allowPrivateWebhooks,
  },
);

const server = serve({ fetch: app.fetch, port: env.port }, ({ port }) =>
  console.log(`API listening on http://localhost:${port}`),
);

const shutdown = async () => {
  server.close();
  await searchClient.close();
  usage.close();
  await database.close();
  process.exit(0);
};

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
