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
import type { FetchedPage } from "@scru/fetcher";

export type CrawlProcessorDeps = {
  fetchPage: (job: FetchJob) => Promise<PageOutcome>;
  fetchHttp: (url: string, proxy: ProxyRequest | null) => Promise<FetchedPage>;
  savePage: (taskId: string, page: CrawledPage) => Promise<void>;
  pauseMs: number;
};

const OK = 200;

export const createCrawlProcessor =
  ({ fetchPage, fetchHttp, savePage, pauseMs }: CrawlProcessorDeps) =>
  ({ data }: { data: CrawlJob }): Promise<CrawlOutcome> =>
    runCrawl(
      {
        fetchPage,
        fetchRobots: async (origin) => {
          const robots = await fetchHttp(
            `${origin}/robots.txt`,
            data.page.proxy,
          ).catch(() => null);
          return robots?.status === OK ? robots.html : null;
        },
        savePage: (page) => savePage(data.taskId, page),
        pause: () => delay(pauseMs),
      },
      data,
    );
