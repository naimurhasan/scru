import { toTaskView } from "@scru/core";
import type { ApiApp, ApiConfig, ApiDeps } from "../deps.ts";
import { ApiError } from "../errors/ApiError.ts";
import { crawlPagesRoute, submitCrawlRoute } from "./crawlRoutes.ts";
import { submitCrawl } from "./submitCrawl.ts";

export const registerCrawlRoutes = (
  app: ApiApp,
  deps: ApiDeps,
  config: ApiConfig,
): void => {
  app.openapi(submitCrawlRoute, async (c) => {
    const task = await submitCrawl(
      deps,
      config,
      c.get("actor"),
      c.req.valid("json"),
    );
    return c.json({ success: true as const, task: toTaskView(task) }, 202);
  });

  app.openapi(crawlPagesRoute, async (c) => {
    const { taskId } = c.req.valid("param");
    const task = await deps.findTask(c.get("actor").workspaceId, taskId);
    if (task?.taskType !== "CRAWL")
      throw new ApiError("NOT_FOUND", "No crawl with this id");
    const list = await deps.listCrawlPages(taskId, c.req.valid("query"));
    return c.json({ success: true as const, ...list }, 200);
  });
};
