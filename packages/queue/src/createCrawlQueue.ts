import type { CrawlJob } from "@scru/core";
import { Queue } from "bullmq";
import { createRedisConnection } from "./createRedisConnection.ts";
import { JOB_RETENTION } from "./jobRetention.ts";
import { CRAWL_QUEUE } from "./queueNames.ts";
import { toQueuePriority } from "./toQueuePriority.ts";

export const createCrawlQueue = (redisUrl: string) => {
  const connection = createRedisConnection(redisUrl);
  const queue = new Queue<CrawlJob>(CRAWL_QUEUE, { connection });

  return {
    enqueueCrawl: async (
      job: CrawlJob,
      taskPriority: number,
    ): Promise<void> => {
      await queue.add("crawl", job, {
        ...JOB_RETENTION,
        priority: toQueuePriority(taskPriority),
      });
    },
    close: async () => {
      await queue.close();
      connection.disconnect();
    },
  };
};
