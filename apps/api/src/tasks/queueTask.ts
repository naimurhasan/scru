import { isHttpUrl, isPublicUrl, type TaskType } from "@scru/core";
import type { RequestActor, Task } from "@scru/db";
import type { ApiConfig, ApiDeps } from "../deps.ts";
import { ApiError } from "../errors/ApiError.ts";

export type TaskSubmission = {
  taskType: TaskType;
  payload: unknown;
  priority: number;
  idempotencyKey: string | null;
  webhookUrl: string | null;
  cost: number;
  enqueue: (task: Task) => Promise<void>;
};

const isAllowedWebhookUrl = (url: string, config: ApiConfig) =>
  config.allowPrivateWebhooks ? isHttpUrl(url) : isPublicUrl(url);

export const queueTask = async (
  deps: Pick<ApiDeps, "createTask">,
  config: ApiConfig,
  actor: RequestActor,
  { cost, webhookUrl, enqueue, ...submission }: TaskSubmission,
): Promise<Task> => {
  if (actor.credits < cost)
    throw new ApiError(
      "INSUFFICIENT_CREDITS",
      "Not enough credits for this request",
      { required: cost },
    );

  if (webhookUrl !== null && !isAllowedWebhookUrl(webhookUrl, config))
    throw new ApiError("VALIDATION_ERROR", "The request is invalid", [
      { field: "webhook.url", message: "Use a public http or https address" },
    ]);

  const task = await deps.createTask({
    workspaceId: actor.workspaceId,
    apiKeyId: actor.apiKeyId,
    webhookUrl,
    ...submission,
  });
  if (!task)
    throw new ApiError(
      "CONFLICT",
      "A task with this idempotency key already exists",
    );

  await enqueue(task);
  return task;
};
