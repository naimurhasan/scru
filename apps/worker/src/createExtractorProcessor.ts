import {
  calculateFetchCredits,
  type ExtractorJob,
  type ExtractorOutcome,
} from "@scru/core";
import {
  type PreparationDeps,
  prepareSiteExtractor,
} from "./prepareSiteExtractor.ts";

export const createExtractorProcessor =
  (deps: PreparationDeps) =>
  async ({ data }: { data: ExtractorJob }): Promise<ExtractorOutcome> => {
    const { saved, pageTypes, pagesFetched, modelCalls } =
      await prepareSiteExtractor(deps, data);
    return {
      extractorId: saved?.id ?? null,
      version: saved?.version ?? null,
      pageTypes: pageTypes.map(({ name, pattern, fillRate, fields }) => ({
        name,
        pattern,
        fillRate,
        fields: fields.map((field) => field.name),
      })),
      pagesFetched,
      modelCalls,
      creditsPerPage: calculateFetchCredits({
        jsRender: data.page.jsRender,
        premiumProxy: data.page.proxy !== null,
      }),
    };
  };
