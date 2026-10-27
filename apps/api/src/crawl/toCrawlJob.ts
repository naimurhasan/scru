import type { CrawlJob } from "@scru/core";
import type { CrawlRequest } from "./schemas.ts";

export const toCrawlJob = (
  request: CrawlRequest,
  taskId: string,
): CrawlJob => ({
  taskId,
  url: request.url,
  maxDepth: request.maxDepth,
  limit: request.limit,
  include: request.include,
  exclude: request.exclude,
  output: request.output,
  page: {
    jsRender: request.jsRender,
    instructions: [],
    waitFor: null,
    waitMs: 0,
    screenshot: false,
    blockResources: request.blockResources,
    proxy: request.premiumProxy
      ? { country: request.country ?? null, sessionId: null }
      : null,
  },
});
