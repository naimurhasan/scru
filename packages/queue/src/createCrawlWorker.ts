import type { CrawlJob, CrawlOutcome } from "@scru/core";
import { createQueueWorker, type QueueProcessor } from "./createQueueWorker.ts";
import { CRAWL_QUEUE } from "./queueNames.ts";

export type CrawlProcessor = QueueProcessor<CrawlJob, CrawlOutcome>;

const CRAWL_CONCURRENCY = 2;

export const createCrawlWorker = (
  redisUrl: string,
  processor: CrawlProcessor,
) => createQueueWorker(redisUrl, CRAWL_QUEUE, processor, CRAWL_CONCURRENCY);
