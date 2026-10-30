import {
  calculateFetchCredits,
  calculatePreparationCredits,
  type CrawlExtractor,
  type CrawlJob,
  type StoredExtractor,
} from "@scru/core";
import type { PageType } from "@scru/parser";
import {
  type PreparationDeps,
  prepareSiteExtractor,
} from "./prepareSiteExtractor.ts";

export type ExtractorLookup = {
  findLatestExtractor: (
    workspaceId: string,
    host: string,
  ) => Promise<StoredExtractor | null>;
  preparation: PreparationDeps | null;
};

export type ResolvedExtractor = {
  extractor: CrawlExtractor | null;
  pageTypes: PageType[];
  preparationCredits: number;
};

export const WITHOUT_EXTRACTOR: ResolvedExtractor = {
  extractor: null,
  pageTypes: [],
  preparationCredits: 0,
};

export type SiteJob = Pick<CrawlJob, "taskId" | "workspaceId" | "url" | "page">;

const toResolved = (
  { id, version, pageTypes }: StoredExtractor,
  prepared: boolean,
  preparationCredits: number,
): ResolvedExtractor => ({
  extractor: { id, version, prepared },
  pageTypes,
  preparationCredits,
});

export const resolveCrawlExtractor = async (
  { findLatestExtractor, preparation }: ExtractorLookup,
  job: SiteJob,
): Promise<ResolvedExtractor> => {
  const existing = await findLatestExtractor(
    job.workspaceId,
    new URL(job.url).hostname,
  );
  if (existing) return toResolved(existing, false, 0);
  if (!preparation) return WITHOUT_EXTRACTOR;
  const { saved, pagesFetched } = await prepareSiteExtractor(preparation, {
    taskId: job.taskId,
    workspaceId: job.workspaceId,
    url: job.url,
    page: job.page,
  });
  if (!saved) return WITHOUT_EXTRACTOR;
  const creditsPerPage = calculateFetchCredits({
    jsRender: job.page.jsRender,
    premiumProxy: job.page.proxy !== null,
  });
  return toResolved(
    saved,
    true,
    calculatePreparationCredits(pagesFetched, creditsPerPage),
  );
};
