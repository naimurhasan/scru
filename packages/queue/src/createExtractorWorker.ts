import type { ExtractorJob, ExtractorOutcome } from "@scru/core";
import { createQueueWorker, type QueueProcessor } from "./createQueueWorker.ts";
import { EXTRACTOR_QUEUE } from "./queueNames.ts";

export type ExtractorProcessor = QueueProcessor<ExtractorJob, ExtractorOutcome>;

const EXTRACTOR_CONCURRENCY = 1;

export const createExtractorWorker = (
  redisUrl: string,
  processor: ExtractorProcessor,
) =>
  createQueueWorker(
    redisUrl,
    EXTRACTOR_QUEUE,
    processor,
    EXTRACTOR_CONCURRENCY,
  );
