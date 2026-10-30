import { calculateFetchCredits, calculatePreparationCredits } from "@scru/core";
import type { RequestActor, Task } from "@scru/db";
import { MAX_SAMPLE_PAGES } from "@scru/extractor";
import { toPageOptions } from "../crawl/toPageOptions.ts";
import type { ApiConfig, ApiDeps } from "../deps.ts";
import { invalidField } from "../errors/invalidField.ts";
import { queueTask } from "../tasks/queueTask.ts";
import { missingExtractorHosts } from "./missingExtractorHosts.ts";
import type { BatchRequest } from "./schemas.ts";

export const submitBatch = async (
  deps: Pick<ApiDeps, "createTask" | "enqueueBatch" | "findLatestExtractor">,
  config: ApiConfig,
  actor: RequestActor,
  request: BatchRequest,
): Promise<Task> => {
  const { priority, idempotencyKey, webhook, ...batch } = request;
  if (batch.premiumProxy && !config.proxiesEnabled)
    throw invalidField("premiumProxy", "Premium proxies are not available");
  const missing =
    batch.output === "json"
      ? await missingExtractorHosts(
          (host) => deps.findLatestExtractor(actor.workspaceId, host),
          batch.urls,
        )
      : [];
  if (missing.length > 0 && !config.extractorsEnabled)
    throw invalidField(
      "output",
      `Prepare an extractor for ${missing[0]} first`,
    );
  const perPage = calculateFetchCredits({
    jsRender: batch.jsRender,
    premiumProxy: batch.premiumProxy,
  });
  return queueTask(deps, config, actor, {
    taskType: "BATCH",
    payload: batch,
    priority,
    idempotencyKey: idempotencyKey ?? null,
    webhookUrl: webhook?.url ?? null,
    cost:
      perPage * batch.urls.length +
      missing.length * calculatePreparationCredits(MAX_SAMPLE_PAGES, perPage),
    enqueue: (task) =>
      deps.enqueueBatch(
        {
          taskId: task.id,
          workspaceId: actor.workspaceId,
          urls: batch.urls,
          output: batch.output,
          page: toPageOptions(batch),
        },
        task.priority,
      ),
  });
};
