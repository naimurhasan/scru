import { serve } from "@hono/node-server";
import type { CrawlJob, ExtractorJob } from "@scru/core";
import {
  chargeCredits,
  createDatabase,
  createTask,
  findActiveApiKey,
  findLatestExtractor,
  listCrawlPages,
  listExtractors,
  findTask,
  findWorkspaceActor,
  insertRequestLog,
} from "@scru/db";
import {
  createFetchPage,
  createHttpFetcher,
  createWebshareRoutes,
  directRoute,
} from "@scru/fetcher/http";
import {
  createRenderClient,
  createSearchClient,
  createSessionPool,
  createTaskQueue,
  createUsageLimiter,
  CRAWL_QUEUE,
  EXTRACTOR_QUEUE,
} from "@scru/queue";
import { connectSessionSearch } from "@scru/search";
import { createApp } from "./app.ts";
import { loadEnv } from "./env.ts";

const env = loadEnv();
const database = createDatabase(env.databaseUrl);
const searchClient = createSearchClient(env.redisUrl, env.syncTimeoutMs);
const renderClient = createRenderClient(env.redisUrl, env.syncTimeoutMs);
const crawlQueue = createTaskQueue<CrawlJob>(env.redisUrl, CRAWL_QUEUE);
const extractorQueue = createTaskQueue<ExtractorJob>(
  env.redisUrl,
  EXTRACTOR_QUEUE,
);
const usage = createUsageLimiter(env.redisUrl, env.rateLimitPerSecond);
const sessions = createSessionPool(env.redisUrl);
const searchGoogle = connectSessionSearch(
  sessions.pool,
  searchClient.searchGoogle,
);
const fetchPage = createFetchPage({
  fetchHttp: createHttpFetcher(
    env.webshare ? createWebshareRoutes(env.webshare) : directRoute,
  ),
  render: renderClient.render,
});

const app = createApp(
  {
    findApiKey: (keyHash) => findActiveApiKey(database.db, keyHash),
    findWorkspaceActor: (workspaceId) =>
      findWorkspaceActor(database.db, workspaceId),
    chargeCredits: (workspaceId, amount) =>
      chargeCredits(database.db, workspaceId, amount),
    recordRequest: (log) => insertRequestLog(database.db, log),
    searchGoogle,
    fetchPage,
    createTask: (task) => createTask(database.db, task),
    findTask: (workspaceId, taskId) =>
      findTask(database.db, workspaceId, taskId),
    enqueueTask: searchClient.enqueueTask,
    enqueueCrawl: crawlQueue.enqueue,
    enqueueExtractor: extractorQueue.enqueue,
    listExtractors: (workspaceId) => listExtractors(database.db, workspaceId),
    findLatestExtractor: (workspaceId, host) =>
      findLatestExtractor(database.db, workspaceId, host),
    listCrawlPages: (taskId, page) => listCrawlPages(database.db, taskId, page),
    limits: usage.limiter,
  },
  {
    internalToken: env.internalToken,
    allowPrivateWebhooks: env.allowPrivateWebhooks,
    proxiesEnabled: env.webshare !== null,
    extractorsEnabled: env.extractorsEnabled,
  },
);

const server = serve({ fetch: app.fetch, port: env.port }, ({ port }) =>
  console.log(`API listening on http://localhost:${port}`),
);

const shutdown = async () => {
  server.close();
  await searchClient.close();
  await renderClient.close();
  await crawlQueue.close();
  await extractorQueue.close();
  usage.close();
  sessions.close();
  await database.close();
  process.exit(0);
};

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
