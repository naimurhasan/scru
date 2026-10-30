import type { BatchJob, BatchOutcome } from "@scru/core";
import { createQueueWorker, type QueueProcessor } from "./createQueueWorker.ts";
import { BATCH_QUEUE } from "./queueNames.ts";

export type BatchProcessor = QueueProcessor<BatchJob, BatchOutcome>;

const BATCH_CONCURRENCY = 2;

export const createBatchWorker = (
  redisUrl: string,
  processor: BatchProcessor,
) => createQueueWorker(redisUrl, BATCH_QUEUE, processor, BATCH_CONCURRENCY);
