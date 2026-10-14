import type { GoogleSearchJob, SearchOutcome } from "@scru/core";
import { Queue, QueueEvents } from "bullmq";
import { createRedisConnection } from "./createRedisConnection.ts";
import { SEARCH_QUEUE } from "./queueNames.ts";
import { toQueuePriority } from "./toQueuePriority.ts";

const KEEP_COMPLETED_SECONDS = 3_600;
const KEEP_FAILED_SECONDS = 86_400;

const RETENTION = {
  removeOnComplete: { age: KEEP_COMPLETED_SECONDS },
  removeOnFail: { age: KEEP_FAILED_SECONDS },
};

const EXTRA_PAGE_TIMEOUT_MS = 30_000;

const waitBudget = (timeoutMs: number, pages: number) =>
  timeoutMs + EXTRA_PAGE_TIMEOUT_MS * Math.max(pages - 1, 0);

const isWaitTimeout = (error: unknown) =>
  error instanceof Error && error.message.includes("timed out");

export const createSearchClient = (redisUrl: string, timeoutMs: number) => {
  const queueConnection = createRedisConnection(redisUrl);
  const eventsConnection = createRedisConnection(redisUrl);
  const queue = new Queue<GoogleSearchJob, SearchOutcome>(SEARCH_QUEUE, {
    connection: queueConnection,
  });
  const events = new QueueEvents(SEARCH_QUEUE, {
    connection: eventsConnection,
  });

  return {
    searchGoogle: async (job: GoogleSearchJob): Promise<SearchOutcome> => {
      const queued = await queue.add("search", job, RETENTION);
      try {
        return await queued.waitUntilFinished(
          events,
          waitBudget(timeoutMs, job.pages),
        );
      } catch (error) {
        if (!isWaitTimeout(error)) throw error;
        await queued.remove().catch(() => undefined);
        return { ok: false, reason: "timeout" };
      }
    },
    enqueueTask: async (
      job: GoogleSearchJob,
      taskPriority: number,
    ): Promise<void> => {
      await queue.add("task", job, {
        ...RETENTION,
        priority: toQueuePriority(taskPriority),
      });
    },
    close: async () => {
      await events.close();
      await queue.close();
      queueConnection.disconnect();
      eventsConnection.disconnect();
    },
  };
};
