import type { FetchJob } from "../fetch/types.ts";

export const CRAWL_OUTPUTS = ["html", "markdown", "text"] as const;

export type CrawlOutput = (typeof CRAWL_OUTPUTS)[number];

export type CrawlJob = {
  taskId: string;
  url: string;
  maxDepth: number;
  limit: number;
  include: string[];
  exclude: string[];
  output: CrawlOutput;
  page: Omit<FetchJob, "url">;
};

export type CrawledPage = {
  position: number;
  url: string;
  depth: number;
  statusCode: number | null;
  content: string | null;
  error: string | null;
};

export type CrawlStop = "finished" | "limit";

export type CrawlOutcome = {
  pagesFetched: number;
  pagesFailed: number;
  pagesQueued: number;
  creditsPerPage: number;
  stoppedBy: CrawlStop;
};
