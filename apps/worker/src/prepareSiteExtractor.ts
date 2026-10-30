import { setTimeout as delay } from "node:timers/promises";
import type {
  ExtractorJob,
  FetchJob,
  PageOutcome,
  ProxyRequest,
  StoredExtractor,
} from "@scru/core";
import type { NewExtractor } from "@scru/db";
import {
  type CompleteJson,
  prepareExtractor,
  sampleSite,
} from "@scru/extractor";
import type { PageType } from "@scru/parser";

export type PreparationDeps = {
  fetchPage: (job: FetchJob) => Promise<PageOutcome>;
  fetchRobots: (
    origin: string,
    proxy: ProxyRequest | null,
  ) => Promise<string | null>;
  completeJson: CompleteJson;
  model: string;
  saveExtractor: (extractor: NewExtractor) => Promise<StoredExtractor>;
  pauseMs: number;
};

export type SitePreparation = {
  saved: StoredExtractor | null;
  pageTypes: PageType[];
  pagesFetched: number;
  modelCalls: number;
};

export const prepareSiteExtractor = async (
  deps: PreparationDeps,
  job: ExtractorJob,
): Promise<SitePreparation> => {
  const sample = await sampleSite(
    {
      fetchPage: deps.fetchPage,
      fetchRobots: (origin) => deps.fetchRobots(origin, job.page.proxy),
      pause: () => delay(deps.pauseMs),
    },
    job.url,
    job.page,
  );
  const prepared =
    sample.pages.length > 0
      ? await prepareExtractor(deps.completeJson, sample.pages)
      : { pageTypes: [], modelCalls: 0 };
  const saved =
    prepared.pageTypes.length > 0
      ? await deps.saveExtractor({
          workspaceId: job.workspaceId,
          taskId: job.taskId,
          host: new URL(job.url).hostname,
          pageTypes: prepared.pageTypes,
          fetchOptions: job.page,
          model: deps.model,
        })
      : null;
  return {
    saved,
    pageTypes: prepared.pageTypes,
    pagesFetched: sample.pagesFetched,
    modelCalls: prepared.modelCalls,
  };
};
