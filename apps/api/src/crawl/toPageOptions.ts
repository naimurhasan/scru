import type { CrawlJob } from "@scru/core";

type PageRequest = {
  jsRender: boolean;
  blockResources: boolean;
  premiumProxy: boolean;
  country?: string;
};

export const toPageOptions = (request: PageRequest): CrawlJob["page"] => ({
  jsRender: request.jsRender,
  instructions: [],
  waitFor: null,
  waitMs: 0,
  screenshot: false,
  blockResources: request.blockResources,
  proxy: request.premiumProxy
    ? { country: request.country ?? null, sessionId: null }
    : null,
});
