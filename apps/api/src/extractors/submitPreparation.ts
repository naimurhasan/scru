import { calculateFetchCredits, calculatePreparationCredits } from "@scru/core";
import type { RequestActor, Task } from "@scru/db";
import { MAX_SAMPLE_PAGES } from "@scru/extractor";
import type { ApiConfig, ApiDeps } from "../deps.ts";
import { invalidField } from "../errors/invalidField.ts";
import { queueTask } from "../tasks/queueTask.ts";
import type { PrepareExtractorRequest } from "./schemas.ts";

export const submitPreparation = (
  deps: Pick<ApiDeps, "createTask" | "enqueueExtractor">,
  config: ApiConfig,
  actor: RequestActor,
  request: PrepareExtractorRequest,
): Promise<Task> => {
  const { priority, idempotencyKey, webhook, ...options } = request;
  if (!config.extractorsEnabled)
    throw invalidField("url", "Extractors are not available");
  if (options.premiumProxy && !config.proxiesEnabled)
    throw invalidField("premiumProxy", "Premium proxies are not available");
  const perPage = calculateFetchCredits({
    jsRender: options.jsRender,
    premiumProxy: options.premiumProxy,
  });
  return queueTask(deps, config, actor, {
    taskType: "EXTRACTOR",
    payload: options,
    priority,
    idempotencyKey: idempotencyKey ?? null,
    webhookUrl: webhook?.url ?? null,
    cost: calculatePreparationCredits(MAX_SAMPLE_PAGES, perPage),
    enqueue: (task) =>
      deps.enqueueExtractor(
        {
          taskId: task.id,
          workspaceId: actor.workspaceId,
          url: options.url,
          page: {
            jsRender: options.jsRender,
            instructions: [],
            waitFor: null,
            waitMs: 0,
            screenshot: false,
            blockResources: options.blockResources,
            proxy: options.premiumProxy
              ? { country: options.country ?? null, sessionId: null }
              : null,
          },
        },
        task.priority,
      ),
  });
};
