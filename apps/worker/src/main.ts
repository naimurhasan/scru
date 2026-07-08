import { isPublicWebhookUrl, isWebhookUrl } from "@scru/core";
import {
  createDatabase,
  findWebhookDelivery,
  markTaskProcessing,
  recordWebhookAttempt,
  settleTask,
} from "@scru/db";
import { createCloakBrowserProvider, directRoute } from "@scru/fetcher";
import {
  createSearchWorker,
  createWebhookQueue,
  createWebhookWorker,
  SEARCH_QUEUE,
  WEBHOOK_QUEUE,
} from "@scru/queue";
import { createSearchProcessor } from "./createSearchProcessor.ts";
import { loadEnv } from "./env.ts";
import { createWebhookProcessor } from "./webhooks/createWebhookProcessor.ts";
import { sendWebhook } from "./webhooks/sendWebhook.ts";
import { withTaskLifecycle } from "./withTaskLifecycle.ts";

const env = loadEnv();
const database = createDatabase(env.databaseUrl);
const webhookQueue = createWebhookQueue(env.redisUrl);

const provider = createCloakBrowserProvider({
  profileDir: env.profileDir,
  route: directRoute.nextRoute(),
  headless: env.headless,
  locale: "en-US",
});

const search = createSearchWorker(
  env.redisUrl,
  withTaskLifecycle(createSearchProcessor(provider), {
    markProcessing: (taskId) => markTaskProcessing(database.db, taskId),
    settle: (taskId, settlement) => settleTask(database.db, taskId, settlement),
    enqueueDelivery: webhookQueue.enqueueDelivery,
  }),
);

const webhooks = createWebhookWorker(
  env.redisUrl,
  createWebhookProcessor({
    findDelivery: (deliveryId) => findWebhookDelivery(database.db, deliveryId),
    recordAttempt: (deliveryId, attempt) =>
      recordWebhookAttempt(database.db, deliveryId, attempt),
    send: sendWebhook,
    isAllowedUrl: env.allowPrivateWebhooks ? isWebhookUrl : isPublicWebhookUrl,
  }),
);

search.worker.on("ready", () =>
  console.log(`Worker listening on ${SEARCH_QUEUE} and ${WEBHOOK_QUEUE}`),
);
search.worker.on("completed", (job, outcome) =>
  console.log(
    `Search ${job.id} ${outcome.ok ? "succeeded" : `failed: ${outcome.reason}`}`,
  ),
);
search.worker.on("failed", (job, error) =>
  console.error(`Search ${job?.id} crashed: ${error.message}`),
);
webhooks.worker.on("completed", (job) =>
  console.log(`Webhook ${job.data.deliveryId} delivered`),
);
webhooks.worker.on("failed", (job, error) =>
  console.error(`Webhook ${job?.data.deliveryId}: ${error.message}`),
);

const shutdown = async () => {
  await search.close();
  await webhooks.close();
  await webhookQueue.close();
  await provider.close();
  await database.close();
  process.exit(0);
};

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
