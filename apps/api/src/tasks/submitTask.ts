import { calculateCredits } from "@scru/core";
import type { RequestActor, Task } from "@scru/db";
import type { ApiConfig, ApiDeps } from "../deps.ts";
import { toSearchJob } from "../google/toSearchJob.ts";
import { queueTask } from "./queueTask.ts";
import type { SubmitTaskRequest } from "./schemas.ts";

export const submitTask = (
  deps: Pick<ApiDeps, "createTask" | "enqueueTask">,
  config: ApiConfig,
  actor: RequestActor,
  request: SubmitTaskRequest,
): Promise<Task> =>
  queueTask(deps, config, actor, {
    taskType: request.taskType,
    payload: request.payload,
    priority: request.priority,
    idempotencyKey: request.idempotencyKey ?? null,
    webhookUrl: request.webhook?.url ?? null,
    cost: calculateCredits({ pages: request.payload.pages, mode: "async" }),
    enqueue: (task) =>
      deps.enqueueTask(toSearchJob(request.payload, task.id), task.priority),
  });
