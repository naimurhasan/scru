import type { CrawlOutput } from "../crawl/types.ts";
import type { FetchJob } from "../fetch/types.ts";

export type BatchJob = {
  taskId: string;
  workspaceId: string;
  urls: string[];
  output: CrawlOutput;
  page: Omit<FetchJob, "url">;
};

export type BatchOutcome = {
  pagesFetched: number;
  pagesFailed: number;
  creditsPerPage: number;
  preparationCredits: number;
};
