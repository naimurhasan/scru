import type { GoogleSearchJob, SearchOutcome } from "@scru/core";
import { createQueueWorker, type QueueProcessor } from "./createQueueWorker.ts";
import { SEARCH_QUEUE } from "./queueNames.ts";

export type SearchProcessor = QueueProcessor<GoogleSearchJob, SearchOutcome>;

const SEARCH_CONCURRENCY = 1;

export const createSearchWorker = (
  redisUrl: string,
  processor: SearchProcessor,
) => createQueueWorker(redisUrl, SEARCH_QUEUE, processor, SEARCH_CONCURRENCY);
