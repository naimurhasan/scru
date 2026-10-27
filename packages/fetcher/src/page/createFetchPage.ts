import type {
  FetchJob,
  PageOutcome,
  ProxyRequest,
  RenderJob,
} from "@scru/core";
import type { FetchedPage } from "../types.ts";
import { detectChallenge } from "./detectChallenge.ts";

export type FetchPageDeps = {
  fetchHttp: (url: string, proxy: ProxyRequest | null) => Promise<FetchedPage>;
  render: (job: RenderJob) => Promise<PageOutcome>;
};

export const createFetchPage =
  (deps: FetchPageDeps) =>
  async ({ jsRender, ...job }: FetchJob): Promise<PageOutcome> => {
    if (jsRender) return deps.render(job);
    const page = await deps.fetchHttp(job.url, job.proxy).catch(() => null);
    if (page && !detectChallenge(page))
      return {
        ok: true,
        page: { ...page, screenshot: null, instructions: [] },
      };
    return deps.render(job);
  };
