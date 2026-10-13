import { Worker } from "bullmq";
import { createRedisConnection } from "./createRedisConnection.ts";
import { WEBHOOK_ATTEMPTS, type WebhookJob } from "./createWebhookQueue.ts";
import { WEBHOOK_QUEUE } from "./queueNames.ts";

export type WebhookProcessor = (delivery: {
  deliveryId: string;
  isLastAttempt: boolean;
}) => Promise<void>;

const WEBHOOK_CONCURRENCY = 5;

export const createWebhookWorker = (
  redisUrl: string,
  processor: WebhookProcessor,
) => {
  const connection = createRedisConnection(redisUrl);
  const worker = new Worker<WebhookJob>(
    WEBHOOK_QUEUE,
    (job) =>
      processor({
        deliveryId: job.data.deliveryId,
        isLastAttempt:
          job.attemptsMade + 1 >= (job.opts.attempts ?? WEBHOOK_ATTEMPTS),
      }),
    { connection, concurrency: WEBHOOK_CONCURRENCY },
  );

  return {
    worker,
    close: async () => {
      await worker.close();
      connection.disconnect();
    },
  };
};
