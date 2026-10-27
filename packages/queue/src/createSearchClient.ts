import type { GoogleSearchJob, SearchOutcome } from "@scru/core";
import { Queue, QueueEvents } from "bullmq";
import { createRedisConnection } from "./createRedisConnection.ts";
import { JOB_RETENTION } from "./jobRetention.ts";
import { SEARCH_QUEUE } from "./queueNames.ts";
import { toQueuePriority } from "./toQueuePriority.ts";
import { waitForJob } from "./waitForJob.ts";

const EXTRA_PAGE_TIMEOUT_MS = 30_000;

const waitBudget = (timeoutMs: number, pages: number) =>
  timeoutMs + EXTRA_PAGE_TIMEOUT_MS * Math.max(pages - 1, 0);

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
      const queued = await queue.add("search", job, JOB_RETENTION);
      return waitForJob(queued, events, waitBudget(timeoutMs, job.pages), {
        ok: false,
        reason: "timeout",
      });
    },
    enqueueTask: async (
      job: GoogleSearchJob,
      taskPriority: number,
    ): Promise<void> => {
      await queue.add("task", job, {
        ...JOB_RETENTION,
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
