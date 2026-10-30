import type { CrawlJob } from "@scru/core";
import type { CrawlRequest } from "./schemas.ts";
import { toPageOptions } from "./toPageOptions.ts";

export const toCrawlJob = (
  request: CrawlRequest,
  taskId: string,
  workspaceId: string,
): CrawlJob => ({
  taskId,
  workspaceId,
  url: request.url,
  maxDepth: request.maxDepth,
  limit: request.limit,
  include: request.include,
  exclude: request.exclude,
  output: request.output,
  page: toPageOptions(request),
});
