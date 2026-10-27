import type { PageOutcome, RenderJob } from "@scru/core";
import { Worker } from "bullmq";
import { createRedisConnection } from "./createRedisConnection.ts";
import { RENDER_QUEUE } from "./queueNames.ts";

export type RenderProcessor = (job: {
  data: RenderJob;
}) => Promise<PageOutcome>;

const RENDER_CONCURRENCY = 2;

export const createRenderWorker = (
  redisUrl: string,
  processor: RenderProcessor,
) => {
  const connection = createRedisConnection(redisUrl);
  const worker = new Worker<RenderJob, PageOutcome>(RENDER_QUEUE, processor, {
    connection,
    concurrency: RENDER_CONCURRENCY,
  });

  return {
    worker,
    close: async () => {
      await worker.close();
      connection.disconnect();
    },
  };
};
