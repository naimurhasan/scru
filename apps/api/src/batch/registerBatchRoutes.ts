import { toTaskView } from "@scru/core";
import type { ApiApp, ApiConfig, ApiDeps } from "../deps.ts";
import { ApiError } from "../errors/ApiError.ts";
import {
  batchPagesRoute,
  batchStatusRoute,
  submitBatchRoute,
} from "./batchRoutes.ts";
import { submitBatch } from "./submitBatch.ts";

const findBatch = async (
  deps: ApiDeps,
  workspaceId: string,
  taskId: string,
) => {
  const task = await deps.findTask(workspaceId, taskId);
  if (task?.taskType !== "BATCH")
    throw new ApiError("NOT_FOUND", "No batch with this id");
  return task;
};

const totalOf = (payload: unknown) =>
  (payload as { urls: string[] }).urls.length;

export const registerBatchRoutes = (
  app: ApiApp,
  deps: ApiDeps,
  config: ApiConfig,
): void => {
  app.openapi(submitBatchRoute, async (c) => {
    const task = await submitBatch(
      deps,
      config,
      c.get("actor"),
      c.req.valid("json"),
    );
    return c.json({ success: true as const, task: toTaskView(task) }, 202);
  });

  app.openapi(batchStatusRoute, async (c) => {
    const { taskId } = c.req.valid("param");
    const task = await findBatch(deps, c.get("actor").workspaceId, taskId);
    const done = await deps.countCrawlPages(taskId);
    return c.json(
      {
        success: true as const,
        task: toTaskView(task),
        progress: { done, total: totalOf(task.payload) },
      },
      200,
    );
  });

  app.openapi(batchPagesRoute, async (c) => {
    const { taskId } = c.req.valid("param");
    await findBatch(deps, c.get("actor").workspaceId, taskId);
    const list = await deps.listCrawlPages(taskId, c.req.valid("query"));
    return c.json({ success: true as const, ...list }, 200);
  });
};
