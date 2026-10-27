import { setTimeout as delay } from "node:timers/promises";
import {
  calculateFetchCredits,
  type ExtractorJob,
  type ExtractorOutcome,
  type FetchJob,
  type PageOutcome,
  type ProxyRequest,
  type StoredExtractor,
} from "@scru/core";
import type { NewExtractor } from "@scru/db";
import {
  type CompleteJson,
  prepareExtractor,
  sampleSite,
} from "@scru/extractor";

export type ExtractorProcessorDeps = {
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

export const createExtractorProcessor =
  (deps: ExtractorProcessorDeps) =>
  async ({ data }: { data: ExtractorJob }): Promise<ExtractorOutcome> => {
    const sample = await sampleSite(
      {
        fetchPage: deps.fetchPage,
        fetchRobots: (origin) => deps.fetchRobots(origin, data.page.proxy),
        pause: () => delay(deps.pauseMs),
      },
      data.url,
      data.page,
    );
    const prepared =
      sample.pages.length > 0
        ? await prepareExtractor(deps.completeJson, sample.pages)
        : { pageTypes: [], modelCalls: 0 };
    const saved =
      prepared.pageTypes.length > 0
        ? await deps.saveExtractor({
            workspaceId: data.workspaceId,
            taskId: data.taskId,
            host: new URL(data.url).hostname,
            pageTypes: prepared.pageTypes,
            fetchOptions: data.page,
            model: deps.model,
          })
        : null;
    return {
      extractorId: saved?.id ?? null,
      version: saved?.version ?? null,
      pageTypes: prepared.pageTypes.map(
        ({ name, pattern, fillRate, fields }) => ({
          name,
          pattern,
          fillRate,
          fields: fields.map((field) => field.name),
        }),
      ),
      pagesFetched: sample.pagesFetched,
      modelCalls: prepared.modelCalls,
      creditsPerPage: calculateFetchCredits({
        jsRender: data.page.jsRender,
        premiumProxy: data.page.proxy !== null,
      }),
    };
  };
