import type { ExtractedData } from "@scru/parser";
import type { FetchJob } from "../fetch/types.ts";

export const CRAWL_OUTPUTS = ["html", "markdown", "text", "json"] as const;

export type CrawlOutput = (typeof CRAWL_OUTPUTS)[number];

export type CrawlJob = {
  taskId: string;
  workspaceId: string;
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
  pageType: string | null;
  data: ExtractedData | null;
  error: string | null;
};

export type CrawlStop = "finished" | "limit" | "no_extractor";

export type CrawlProgress = {
  pagesFetched: number;
  pagesFailed: number;
  pagesQueued: number;
  creditsPerPage: number;
  stoppedBy: CrawlStop;
};

export type CrawlExtractor = {
  id: string;
  version: number;
  prepared: boolean;
};

export type CrawlOutcome = CrawlProgress & {
  extractor: CrawlExtractor | null;
  preparationCredits: number;
};
