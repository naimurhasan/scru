import type { PageType } from "@scru/parser";
import type { FetchJob } from "../fetch/types.ts";

export type ExtractorFetchOptions = Omit<FetchJob, "url">;

export type ExtractorJob = {
  taskId: string;
  workspaceId: string;
  url: string;
  page: ExtractorFetchOptions;
};

export type PageTypeSummary = Pick<
  PageType,
  "name" | "pattern" | "fillRate"
> & {
  fields: string[];
};

export type ExtractorOutcome = {
  extractorId: string | null;
  version: number | null;
  pageTypes: PageTypeSummary[];
  pagesFetched: number;
  modelCalls: number;
  creditsPerPage: number;
};

export type StoredExtractor = {
  id: string;
  host: string;
  version: number;
  pageTypes: PageType[];
  fetchOptions: ExtractorFetchOptions;
  model: string;
  createdAt: Date;
};
