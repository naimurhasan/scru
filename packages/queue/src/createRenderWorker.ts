import type { PageOutcome, RenderJob } from "@scru/core";
import { createQueueWorker, type QueueProcessor } from "./createQueueWorker.ts";
import { RENDER_QUEUE } from "./queueNames.ts";

export type RenderProcessor = QueueProcessor<RenderJob, PageOutcome>;

const RENDER_CONCURRENCY = 2;

export const createRenderWorker = (
  redisUrl: string,
  processor: RenderProcessor,
) => createQueueWorker(redisUrl, RENDER_QUEUE, processor, RENDER_CONCURRENCY);
