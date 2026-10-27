import { calculateFetchCredits } from "@scru/core";
import type { RequestActor, Task } from "@scru/db";
import type { ApiConfig, ApiDeps } from "../deps.ts";
import { ApiError } from "../errors/ApiError.ts";
import { queueTask } from "../tasks/queueTask.ts";
import type { CrawlRequest } from "./schemas.ts";
import { toCrawlJob } from "./toCrawlJob.ts";

const PROXIES_UNAVAILABLE = new ApiError(
  "VALIDATION_ERROR",
  "The request is invalid",
  [{ field: "premiumProxy", message: "Premium proxies are not available" }],
);

export const submitCrawl = (
  deps: Pick<ApiDeps, "createTask" | "enqueueCrawl">,
  config: ApiConfig,
  actor: RequestActor,
  request: CrawlRequest,
): Promise<Task> => {
  const { priority, idempotencyKey, webhook, ...crawl } = request;
  if (crawl.premiumProxy && !config.proxiesEnabled) throw PROXIES_UNAVAILABLE;
  const perPage = calculateFetchCredits({
    jsRender: crawl.jsRender,
    premiumProxy: crawl.premiumProxy,
  });
  return queueTask(deps, config, actor, {
    taskType: "CRAWL",
    payload: crawl,
    priority,
    idempotencyKey: idempotencyKey ?? null,
    webhookUrl: webhook?.url ?? null,
    cost: perPage * crawl.limit,
    enqueue: (task) =>
      deps.enqueueCrawl(toCrawlJob(request, task.id), task.priority),
  });
};
