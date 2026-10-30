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
import { createPageReader } from "./createPageReader.ts";
import {
  type ExtractorLookup,
  resolveCrawlExtractor,
  WITHOUT_EXTRACTOR,
} from "./resolveCrawlExtractor.ts";

export type CrawlProcessorDeps = {
  fetchPage: (job: FetchJob) => Promise<PageOutcome>;
  fetchRobots: (
    origin: string,
    proxy: ProxyRequest | null,
  ) => Promise<string | null>;
  savePage: (taskId: string, page: CrawledPage) => Promise<void>;
  extractors: ExtractorLookup;
  pauseMs: number;
};

export const createCrawlProcessor =
  ({
    fetchPage,
    fetchRobots,
    savePage,
    extractors,
    pauseMs,
  }: CrawlProcessorDeps) =>
  async ({ data }: { data: CrawlJob }): Promise<CrawlOutcome> => {
    const resolved =
      data.output === "json"
        ? await resolveCrawlExtractor(extractors, data)
        : WITHOUT_EXTRACTOR;
    const { pageTypes, ...site } = resolved;
    if (data.output === "json" && site.extractor === null)
      return {
        pagesFetched: 0,
        pagesFailed: 0,
        pagesQueued: 0,
        creditsPerPage: 0,
        stoppedBy: "no_extractor",
        ...site,
      };
    const progress = await runCrawl(
      {
        fetchPage,
        fetchRobots: (origin) => fetchRobots(origin, data.page.proxy),
        readPage: createPageReader(data.output, pageTypes),
        savePage: (page) => savePage(data.taskId, page),
        pause: () => delay(pauseMs),
      },
      data,
    );
    return { ...progress, ...site };
  };
