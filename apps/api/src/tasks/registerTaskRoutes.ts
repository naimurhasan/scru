import { toTaskView } from "@scru/core";
import type { ApiApp, ApiConfig, ApiDeps } from "../deps.ts";
import { ApiError } from "../errors/ApiError.ts";
import { getTaskRoute } from "./getTaskRoute.ts";
import { submitTask } from "./submitTask.ts";
import { submitTaskRoute } from "./submitTaskRoute.ts";

export const registerTaskRoutes = (
  app: ApiApp,
  deps: ApiDeps,
  config: ApiConfig,
): void => {
  app.openapi(submitTaskRoute, async (c) => {
    const task = await submitTask(
      deps,
      config,
      c.get("actor"),
      c.req.valid("json"),
    );
    return c.json({ success: true as const, task: toTaskView(task) }, 202);
  });

  app.openapi(getTaskRoute, async (c) => {
    const { taskId } = c.req.valid("param");
    const task = await deps.findTask(c.get("actor").workspaceId, taskId);
    if (!task) throw new ApiError("NOT_FOUND", "No task with this id");
    return c.json({ success: true as const, task: toTaskView(task) }, 200);
  });
};
