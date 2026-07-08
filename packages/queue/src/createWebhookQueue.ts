import { Queue } from "bullmq";
import { createRedisConnection } from "./createRedisConnection.ts";
import { WEBHOOK_QUEUE } from "./queueNames.ts";

export type WebhookJob = {
  deliveryId: string;
};

export const WEBHOOK_ATTEMPTS = 5;
const FIRST_RETRY_DELAY_MS = 5_000;
const KEEP_SECONDS = 86_400;

export const createWebhookQueue = (redisUrl: string) => {
  const connection = createRedisConnection(redisUrl);
  const queue = new Queue<WebhookJob>(WEBHOOK_QUEUE, { connection });

  return {
    enqueueDelivery: async (deliveryId: string): Promise<void> => {
      await queue.add(
        "deliver",
        { deliveryId },
        {
          attempts: WEBHOOK_ATTEMPTS,
          backoff: { type: "exponential", delay: FIRST_RETRY_DELAY_MS },
          removeOnComplete: { age: KEEP_SECONDS },
          removeOnFail: { age: KEEP_SECONDS },
        },
      );
    },
    close: async () => {
      await queue.close();
      connection.disconnect();
    },
  };
};
