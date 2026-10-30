import type {
  BatchJob,
  BatchOutcome,
  CrawledPage,
  FetchJob,
  PageOutcome,
} from "@scru/core";
import { calculateFetchCredits } from "@scru/core";
import { createPageReader } from "./createPageReader.ts";
import { mapWithConcurrency } from "./mapWithConcurrency.ts";
import {
  type ExtractorLookup,
  type ResolvedExtractor,
  resolveCrawlExtractor,
  WITHOUT_EXTRACTOR,
} from "./resolveCrawlExtractor.ts";

export type BatchProcessorDeps = {
  fetchPage: (job: FetchJob) => Promise<PageOutcome>;
  savePage: (taskId: string, page: CrawledPage) => Promise<void>;
  extractors: ExtractorLookup;
  concurrency: number;
};

const NO_CONTENT = {
  statusCode: null,
  content: null,
  pageType: null,
  data: null,
};

export const createBatchProcessor =
  ({ fetchPage, savePage, extractors, concurrency }: BatchProcessorDeps) =>
  async ({ data }: { data: BatchJob }): Promise<BatchOutcome> => {
    const sites = new Map<string, Promise<ResolvedExtractor>>();
    const siteOf = (url: string) => {
      const host = new URL(url).hostname;
      const known = sites.get(host);
      if (known) return known;
      const resolved = resolveCrawlExtractor(extractors, { ...data, url });
      sites.set(host, resolved);
      return resolved;
    };

    const visit = async (url: string, position: number) => {
      const site =
        data.output === "json" ? await siteOf(url) : WITHOUT_EXTRACTOR;
      const base = { position, url, depth: 0 };
      if (data.output === "json" && site.extractor === null) {
        await savePage(data.taskId, {
          ...base,
          ...NO_CONTENT,
          error: "no_extractor",
        });
        return false;
      }
      const outcome = await fetchPage({ ...data.page, url });
      if (!outcome.ok) {
        await savePage(data.taskId, {
          ...base,
          ...NO_CONTENT,
          error: outcome.reason,
        });
        return false;
      }
      const readPage = createPageReader(data.output, site.pageTypes);
      await savePage(data.taskId, {
        ...base,
        statusCode: outcome.page.status,
        ...readPage(outcome.page.html, outcome.page.url),
        error: null,
      });
      return true;
    };

    const fetched = (
      await mapWithConcurrency(data.urls, concurrency, visit)
    ).filter(Boolean).length;
    const resolved = await Promise.all(sites.values());
    return {
      pagesFetched: fetched,
      pagesFailed: data.urls.length - fetched,
      creditsPerPage: calculateFetchCredits({
        jsRender: data.page.jsRender,
        premiumProxy: data.page.proxy !== null,
      }),
      preparationCredits: resolved.reduce(
        (sum, site) => sum + site.preparationCredits,
        0,
      ),
    };
  };
