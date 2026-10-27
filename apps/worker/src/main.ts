import { isPublicUrl, isHttpUrl } from "@scru/core";
import {
  createDatabase,
  findWebhookDelivery,
  markTaskProcessing,
  recordWebhookAttempt,
  settleTask,
} from "@scru/db";
import {
  createCloakBrowserProvider,
  createTwoCaptchaSolver,
  createWebshareRoutes,
  directRoute,
  harvestSession,
  passRecaptcha,
} from "@scru/fetcher";
import {
  createRenderWorker,
  createSearchWorker,
  createSessionPool,
  createWebhookQueue,
  createWebhookWorker,
  RENDER_QUEUE,
  SEARCH_QUEUE,
  WEBHOOK_QUEUE,
} from "@scru/queue";
import { connectSessionSearch } from "@scru/search";
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

const search = createSearchWorker(
  env.redisUrl,
  withTaskLifecycle(({ data }) => sessionSearch(data), {
    markProcessing: (taskId) => markTaskProcessing(database.db, taskId),
    settle: (taskId, settlement) => settleTask(database.db, taskId, settlement),
    enqueueDelivery: webhookQueue.enqueueDelivery,
  }),
);

const solveRecaptcha = env.twoCaptchaApiKey
  ? createTwoCaptchaSolver(env.twoCaptchaApiKey)
  : null;

const renders = createRenderWorker(
  env.redisUrl,
  createRenderProcessor({
    sharedBrowser: provider,
    routes: env.webshare ? createWebshareRoutes(env.webshare) : directRoute,
    headless: env.headless,
    options: {
      timeoutMs: RENDER_TIMEOUT_MS,
      passCaptcha: async (tab) => {
        const result = await passRecaptcha(tab, solveRecaptcha);
        if (result !== "absent")
          console.log(`CAPTCHA on ${tab.url()}: ${result}`);
      },
    },
  }),
);

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
    `Worker listening on ${SEARCH_QUEUE}, ${RENDER_QUEUE} and ${WEBHOOK_QUEUE}`,
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
  await webhooks.close();
  await webhookQueue.close();
  await provider.close();
  sessions.close();
  await database.close();
  process.exit(0);
};

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
