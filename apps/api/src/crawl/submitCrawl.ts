import { calculateFetchCredits, calculatePreparationCredits } from "@scru/core";
import type { RequestActor, Task } from "@scru/db";
import { MAX_SAMPLE_PAGES } from "@scru/extractor";
import type { ApiConfig, ApiDeps } from "../deps.ts";
import { invalidField } from "../errors/invalidField.ts";
import { queueTask } from "../tasks/queueTask.ts";
import type { CrawlRequest } from "./schemas.ts";
import { toCrawlJob } from "./toCrawlJob.ts";

const needsPreparation = async (
  deps: Pick<ApiDeps, "findLatestExtractor">,
  actor: RequestActor,
  { output, url }: CrawlRequest,
) =>
  output === "json" &&
  (await deps.findLatestExtractor(actor.workspaceId, new URL(url).hostname)) ===
    null;

export const submitCrawl = async (
  deps: Pick<ApiDeps, "createTask" | "enqueueCrawl" | "findLatestExtractor">,
  config: ApiConfig,
  actor: RequestActor,
  request: CrawlRequest,
): Promise<Task> => {
  const { priority, idempotencyKey, webhook, ...crawl } = request;
  if (crawl.premiumProxy && !config.proxiesEnabled)
    throw invalidField("premiumProxy", "Premium proxies are not available");
  const preparing = await needsPreparation(deps, actor, request);
  if (preparing && !config.extractorsEnabled)
    throw invalidField("output", "Prepare an extractor for this site first");
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
    cost:
      perPage * crawl.limit +
      (preparing ? calculatePreparationCredits(MAX_SAMPLE_PAGES, perPage) : 0),
    enqueue: (task) =>
      deps.enqueueCrawl(
        toCrawlJob(request, task.id, actor.workspaceId),
        task.priority,
      ),
  });
};
