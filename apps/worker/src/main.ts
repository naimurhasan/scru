import {
  isHttpUrl,
  isPublicUrl,
  toBatchSettlement,
  toCrawlSettlement,
  toExtractorSettlement,
  toTaskSettlement,
  type CrawledPage,
  type TaskSettlement,
} from "@scru/core";
import {
  createDatabase,
  findLatestExtractor,
  findWebhookDelivery,
  insertCrawlPage,
  saveExtractor,
  markTaskProcessing,
  type NewExtractor,
  recordWebhookAttempt,
  settleTask,
} from "@scru/db";
import {
  createCloakBrowserProvider,
  createTwoCaptchaSolver,
  createWebshareRoutes,
  directRoute,
  harvestSession,
  passPressAndHold,
  passRecaptcha,
} from "@scru/fetcher";
import { createFetchPage, createHttpFetcher } from "@scru/fetcher/http";
import { createOpenRouterClient } from "@scru/extractor";
import {
  BATCH_QUEUE,
  createBatchWorker,
  createCrawlWorker,
  createExtractorWorker,
  createRenderClient,
  createRenderWorker,
  createSearchWorker,
  createSessionPool,
  createWebhookQueue,
  createWebhookWorker,
  CRAWL_QUEUE,
  EXTRACTOR_QUEUE,
  RENDER_QUEUE,
  SEARCH_QUEUE,
  WEBHOOK_QUEUE,
} from "@scru/queue";
import { connectSessionSearch } from "@scru/search";
import { createBatchProcessor } from "./createBatchProcessor.ts";
import { createCrawlProcessor } from "./createCrawlProcessor.ts";
import { createExtractorProcessor } from "./createExtractorProcessor.ts";
import { createRobotsFetcher } from "./createRobotsFetcher.ts";
import { createRenderProcessor } from "./createRenderProcessor.ts";
import { createSearchProcessor } from "./createSearchProcessor.ts";
import { loadEnv } from "./env.ts";
import { keepSessionsReady } from "./keepSessionsReady.ts";
import { createWebhookProcessor } from "./webhooks/createWebhookProcessor.ts";
import { sendWebhook } from "./webhooks/sendWebhook.ts";
import { withTaskLifecycle } from "./withTaskLifecycle.ts";

const env = loadEnv();
const database = createDatabase(env.databaseUrl);
const webhookQueue = createWebhookQueue(env.redisUrl);
const sessions = createSessionPool(env.redisUrl);

const HARVEST_TIMEOUT_MS = 30_000;
const KEEPER_INTERVAL_MS = 20_000;
const RENDER_TIMEOUT_MS = 30_000;
const CRAWL_RENDER_WAIT_MS = 120_000;
const CRAWL_PAUSE_MS = 500;
const BATCH_PAGE_CONCURRENCY = 4;

const provider = createCloakBrowserProvider({
  profileDir: env.profileDir,
  route: {},
  headless: env.headless,
  locale: "en-US",
});

const browserSearch = createSearchProcessor(provider);
const sessionSearch = connectSessionSearch(sessions.pool, (job) =>
  browserSearch({ data: job }),
);

const keeper = keepSessionsReady({
  target: env.sessionPoolSize,
  intervalMs: KEEPER_INTERVAL_MS,
  size: sessions.pool.size,
  harvest: () => harvestSession(provider, HARVEST_TIMEOUT_MS).catch(() => null),
  add: async (session) => {
    await sessions.pool.add(session);
    console.log(`Session ${session.id} ready`);
  },
  onError: (error) => console.error("Session keeper failed", error),
});

const taskHooks = {
  markProcessing: (taskId: string) => markTaskProcessing(database.db, taskId),
  settle: (taskId: string, settlement: TaskSettlement) =>
    settleTask(database.db, taskId, settlement),
  enqueueDelivery: webhookQueue.enqueueDelivery,
};

const search = createSearchWorker(
  env.redisUrl,
  withTaskLifecycle(
    ({ data }) => sessionSearch(data),
    toTaskSettlement,
    taskHooks,
  ),
);

const solveRecaptcha = env.twoCaptchaApiKey
  ? createTwoCaptchaSolver(env.twoCaptchaApiKey)
  : null;

const routes = env.webshare ? createWebshareRoutes(env.webshare) : directRoute;

const renders = createRenderWorker(
  env.redisUrl,
  createRenderProcessor({
    sharedBrowser: provider,
    routes,
    headless: env.headless,
    options: {
      timeoutMs: RENDER_TIMEOUT_MS,
      passCaptcha: async (tab) => {
        const hold = await passPressAndHold(tab);
        if (hold !== "absent") {
          console.log(`Press&Hold on ${tab.url()}: ${hold}`);
          if (hold === "solved") return;
        }
        const result = await passRecaptcha(tab, solveRecaptcha);
        if (result !== "absent")
          console.log(`CAPTCHA on ${tab.url()}: ${result}`);
      },
    },
  }),
);

const crawlRenders = createRenderClient(env.redisUrl, CRAWL_RENDER_WAIT_MS);
const fetchHttp = createHttpFetcher(routes);
const fetchPage = createFetchPage({ fetchHttp, render: crawlRenders.render });
const fetchRobots = createRobotsFetcher(fetchHttp);

const preparation = env.openRouter
  ? {
      fetchPage,
      fetchRobots,
      completeJson: createOpenRouterClient(env.openRouter),
      model: env.openRouter.model,
      saveExtractor: (extractor: NewExtractor) =>
        saveExtractor(database.db, extractor),
      pauseMs: CRAWL_PAUSE_MS,
    }
  : null;

const savePage = (taskId: string, page: CrawledPage) =>
  insertCrawlPage(database.db, taskId, page);

const siteExtractors = {
  findLatestExtractor: (workspaceId: string, host: string) =>
    findLatestExtractor(database.db, workspaceId, host),
  preparation,
};

const crawls = createCrawlWorker(
  env.redisUrl,
  withTaskLifecycle(
    createCrawlProcessor({
      fetchPage,
      fetchRobots,
      savePage,
      extractors: siteExtractors,
      pauseMs: CRAWL_PAUSE_MS,
    }),
    toCrawlSettlement,
    taskHooks,
  ),
);

const batches = createBatchWorker(
  env.redisUrl,
  withTaskLifecycle(
    createBatchProcessor({
      fetchPage,
      savePage,
      extractors: siteExtractors,
      concurrency: BATCH_PAGE_CONCURRENCY,
    }),
    toBatchSettlement,
    taskHooks,
  ),
);

const extractors = preparation
  ? createExtractorWorker(
      env.redisUrl,
      withTaskLifecycle(
        createExtractorProcessor(preparation),
        toExtractorSettlement,
        taskHooks,
      ),
    )
  : null;

const webhooks = createWebhookWorker(
  env.redisUrl,
  createWebhookProcessor({
    findDelivery: (deliveryId) => findWebhookDelivery(database.db, deliveryId),
    recordAttempt: (deliveryId, attempt) =>
      recordWebhookAttempt(database.db, deliveryId, attempt),
    send: sendWebhook,
    isAllowedUrl: env.allowPrivateWebhooks ? isHttpUrl : isPublicUrl,
  }),
);

search.worker.on("ready", () =>
  console.log(
    `Worker listening on ${[SEARCH_QUEUE, RENDER_QUEUE, CRAWL_QUEUE, BATCH_QUEUE, ...(extractors ? [EXTRACTOR_QUEUE] : []), WEBHOOK_QUEUE].join(", ")}`,
  ),
);
search.worker.on("completed", (job, outcome) =>
  console.log(
    `Search ${job.id} ${outcome.ok ? "succeeded" : `failed: ${outcome.reason}`}`,
  ),
);
search.worker.on("failed", (job, error) =>
  console.error(`Search ${job?.id} crashed: ${error.message}`),
);
renders.worker.on("completed", (job, outcome) =>
  console.log(
    `Render ${job.id} ${outcome.ok ? "succeeded" : `failed: ${outcome.reason}`}`,
  ),
);
renders.worker.on("failed", (job, error) =>
  console.error(`Render ${job?.id} crashed: ${error.message}`),
);
crawls.worker.on("completed", (job, outcome) =>
  console.log(
    `Crawl ${job.data.taskId}: ${outcome.pagesFetched} pages, ${outcome.pagesFailed} failed, ${outcome.stoppedBy}`,
  ),
);
crawls.worker.on("failed", (job, error) =>
  console.error(`Crawl ${job?.data.taskId} crashed: ${error.message}`),
);
batches.worker.on("completed", (job, outcome) =>
  console.log(
    `Batch ${job.data.taskId}: ${outcome.pagesFetched} pages, ${outcome.pagesFailed} failed`,
  ),
);
batches.worker.on("failed", (job, error) =>
  console.error(`Batch ${job?.data.taskId} crashed: ${error.message}`),
);
extractors?.worker.on("completed", (job, outcome) =>
  console.log(
    `Extractor ${job.data.taskId}: ${outcome.pageTypes.length} page types from ${outcome.pagesFetched} pages, ${outcome.modelCalls} model calls`,
  ),
);
extractors?.worker.on("failed", (job, error) =>
  console.error(`Extractor ${job?.data.taskId} crashed: ${error.message}`),
);
webhooks.worker.on("completed", (job) =>
  console.log(`Webhook ${job.data.deliveryId} delivered`),
);
webhooks.worker.on("failed", (job, error) =>
  console.error(`Webhook ${job?.data.deliveryId}: ${error.message}`),
);

const shutdown = async () => {
  keeper.stop();
  await search.close();
  await renders.close();
  await crawls.close();
  await batches.close();
  await extractors?.close();
  await crawlRenders.close();
  await webhooks.close();
  await webhookQueue.close();
  await provider.close();
  sessions.close();
  await database.close();
  process.exit(0);
};

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
