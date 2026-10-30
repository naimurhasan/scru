import {
  calculateFetchCredits,
  type CrawledPage,
  type CrawlJob,
  type CrawlProgress,
  type FetchJob,
  type PageOutcome,
} from "@scru/core";
import { extractLinks } from "@scru/parser";
import { normalizeUrl } from "./normalizeUrl.ts";
import { isAllowedByRobots, parseRobots } from "./robots.ts";
import { shouldVisit } from "./shouldVisit.ts";

export type PageContent = Pick<CrawledPage, "content" | "pageType" | "data">;

const NO_CONTENT: PageContent = { content: null, pageType: null, data: null };

export type CrawlDeps = {
  fetchPage: (job: FetchJob) => Promise<PageOutcome>;
  readPage: (html: string, pageUrl: string) => PageContent;
  fetchRobots: (origin: string) => Promise<string | null>;
  savePage: (page: CrawledPage) => Promise<void>;
  pause: () => Promise<void>;
};

type Visit = {
  url: string;
  depth: number;
};

const pathOf = (link: string) => {
  const url = new URL(link);
  return `${url.pathname}${url.search}`;
};

export const runCrawl = async (
  deps: CrawlDeps,
  job: CrawlJob,
): Promise<CrawlProgress> => {
  const start = normalizeUrl(job.url);
  const { origin, hostname: host } = new URL(start);
  const robots = parseRobots((await deps.fetchRobots(origin)) ?? "");
  const rules = { host, include: job.include, exclude: job.exclude };
  const allowed = (url: string) => isAllowedByRobots(robots, pathOf(url));
  const seen = new Set([start]);
  const frontier: Visit[] = allowed(start) ? [{ url: start, depth: 0 }] : [];
  let fetched = 0;
  let failed = 0;

  const enqueueLinks = (html: string, pageUrl: string, depth: number) => {
    for (const link of extractLinks(html, pageUrl)) {
      const url = normalizeUrl(link);
      if (seen.has(url) || !shouldVisit(url, rules) || !allowed(url)) continue;
      seen.add(url);
      frontier.push({ url, depth });
    }
  };

  while (fetched + failed < job.limit) {
    const visit = frontier.shift();
    if (!visit) break;
    if (fetched + failed > 0) await deps.pause();
    const outcome = await deps.fetchPage({ ...job.page, url: visit.url });
    if (!outcome.ok) {
      await deps.savePage({
        position: fetched + failed,
        url: visit.url,
        depth: visit.depth,
        statusCode: null,
        ...NO_CONTENT,
        error: outcome.reason,
      });
      failed += 1;
      continue;
    }
    seen.add(normalizeUrl(outcome.page.url));
    await deps.savePage({
      position: fetched + failed,
      url: visit.url,
      depth: visit.depth,
      statusCode: outcome.page.status,
      ...deps.readPage(outcome.page.html, outcome.page.url),
      error: null,
    });
    fetched += 1;
    if (visit.depth < job.maxDepth)
      enqueueLinks(outcome.page.html, outcome.page.url, visit.depth + 1);
  }

  return {
    pagesFetched: fetched,
    pagesFailed: failed,
    pagesQueued: frontier.length,
    creditsPerPage: calculateFetchCredits({
      jsRender: job.page.jsRender,
      premiumProxy: job.page.proxy !== null,
    }),
    stoppedBy: frontier.length > 0 ? "limit" : "finished",
  };
};
