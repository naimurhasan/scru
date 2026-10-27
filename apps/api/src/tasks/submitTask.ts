import { calculateCredits, isPublicUrl, isHttpUrl } from "@scru/core";
import type { RequestActor, Task } from "@scru/db";
import type { ApiConfig, ApiDeps } from "../deps.ts";
import { ApiError } from "../errors/ApiError.ts";
import { toSearchJob } from "../google/toSearchJob.ts";
import type { SubmitTaskRequest } from "./schemas.ts";

const isAllowedWebhookUrl = (url: string, config: ApiConfig) =>
  config.allowPrivateWebhooks ? isHttpUrl(url) : isPublicUrl(url);

export const submitTask = async (
  deps: Pick<ApiDeps, "createTask" | "enqueueTask">,
  config: ApiConfig,
  actor: RequestActor,
  request: SubmitTaskRequest,
): Promise<Task> => {
  const cost = calculateCredits({
    pages: request.payload.pages,
    mode: "async",
  });
  if (actor.credits < cost)
    throw new ApiError(
      "INSUFFICIENT_CREDITS",
      "Not enough credits for this request",
      { required: cost },
    );

  const webhookUrl = request.webhook?.url ?? null;
  if (webhookUrl !== null && !isAllowedWebhookUrl(webhookUrl, config))
    throw new ApiError("VALIDATION_ERROR", "The request is invalid", [
      { field: "webhook.url", message: "Use a public http or https address" },
    ]);

  const task = await deps.createTask({
    workspaceId: actor.workspaceId,
    apiKeyId: actor.apiKeyId,
    taskType: request.taskType,
    priority: request.priority,
    idempotencyKey: request.idempotencyKey ?? null,
    payload: request.payload,
    webhookUrl,
  });
  if (!task)
    throw new ApiError(
      "CONFLICT",
      "A task with this idempotency key already exists",
    );

  await deps.enqueueTask(toSearchJob(request.payload, task.id), task.priority);
  return task;
};
