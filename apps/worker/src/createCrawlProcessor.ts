import { setTimeout as delay } from "node:timers/promises";
import type {
  CrawledPage,
  CrawlJob,
  CrawlOutcome,
  FetchJob,
  PageOutcome,
  ProxyRequest,
} from "@scru/core";
import { runCrawl } from "@scru/crawler";

export type CrawlProcessorDeps = {
  fetchPage: (job: FetchJob) => Promise<PageOutcome>;
  fetchRobots: (
    origin: string,
    proxy: ProxyRequest | null,
  ) => Promise<string | null>;
  savePage: (taskId: string, page: CrawledPage) => Promise<void>;
  pauseMs: number;
};

export const createCrawlProcessor =
  ({ fetchPage, fetchRobots, savePage, pauseMs }: CrawlProcessorDeps) =>
  ({ data }: { data: CrawlJob }): Promise<CrawlOutcome> =>
    runCrawl(
      {
        fetchPage,
        fetchRobots: (origin) => fetchRobots(origin, data.page.proxy),
        savePage: (page) => savePage(data.taskId, page),
        pause: () => delay(pauseMs),
      },
      data,
    );
