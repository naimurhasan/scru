import type { FetchJob, PageOutcome } from "@scru/core";
import {
  isAllowedByRobots,
  normalizeUrl,
  parseRobots,
  shouldVisit,
} from "@scru/crawler";
import { extractLinks } from "@scru/parser";
import type { SamplePage } from "./prepareExtractor.ts";
import { MAX_PAGE_TYPES, pickPageGroups } from "./pickPageGroups.ts";
import { groupUrlsByPattern } from "./urlPatterns.ts";

export type SampleDeps = {
  fetchPage: (job: FetchJob) => Promise<PageOutcome>;
  fetchRobots: (origin: string) => Promise<string | null>;
  pause: () => Promise<void>;
};

export type SiteSample = {
  pages: SamplePage[];
  pagesFetched: number;
};

const PAGES_PER_GROUP = 5;

export const MAX_SAMPLE_PAGES = 1 + MAX_PAGE_TYPES * PAGES_PER_GROUP;

export const sampleSite = async (
  deps: SampleDeps,
  url: string,
  options: Omit<FetchJob, "url">,
): Promise<SiteSample> => {
  const start = normalizeUrl(url);
  const { origin, hostname: host } = new URL(start);
  const robots = parseRobots((await deps.fetchRobots(origin)) ?? "");
  const allowed = (link: string) => {
    const target = new URL(link);
    return isAllowedByRobots(robots, `${target.pathname}${target.search}`);
  };
  const first = await deps.fetchPage({ ...options, url: start });
  if (!first.ok) return { pages: [], pagesFetched: 0 };

  const links = extractLinks(first.page.html, first.page.url)
    .map(normalizeUrl)
    .filter(
      (link) =>
        link !== start &&
        shouldVisit(link, { host, include: [], exclude: [] }) &&
        allowed(link),
    );
  const targets = pickPageGroups(
    groupUrlsByPattern([start, ...new Set(links)], start),
    start,
  ).flatMap(({ urls }) =>
    urls.filter((link) => link !== start).slice(0, PAGES_PER_GROUP),
  );

  const pages: SamplePage[] = [{ url: start, html: first.page.html }];
  for (const target of targets) {
    await deps.pause();
    const outcome = await deps.fetchPage({ ...options, url: target });
    if (outcome.ok) pages.push({ url: target, html: outcome.page.html });
  }
  return { pages, pagesFetched: pages.length };
};
