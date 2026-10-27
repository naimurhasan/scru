import type { PageOutcome, RenderJob } from "@scru/core";
import { Queue, QueueEvents } from "bullmq";
import { createRedisConnection } from "./createRedisConnection.ts";
import { JOB_RETENTION } from "./jobRetention.ts";
import { RENDER_QUEUE } from "./queueNames.ts";
import { waitForJob } from "./waitForJob.ts";

export const createRenderClient = (redisUrl: string, timeoutMs: number) => {
  const queueConnection = createRedisConnection(redisUrl);
  const eventsConnection = createRedisConnection(redisUrl);
  const queue = new Queue<RenderJob, PageOutcome>(RENDER_QUEUE, {
    connection: queueConnection,
  });
  const events = new QueueEvents(RENDER_QUEUE, {
    connection: eventsConnection,
  });

  return {
    render: async (job: RenderJob): Promise<PageOutcome> => {
      const queued = await queue.add("render", job, JOB_RETENTION);
      return waitForJob(queued, events, timeoutMs, {
        ok: false,
        reason: "timeout",
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
