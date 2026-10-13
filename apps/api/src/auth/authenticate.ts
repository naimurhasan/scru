import { createMiddleware } from "hono/factory";
import type { ApiConfig, ApiDeps, ApiEnv } from "../deps.ts";
import { resolveActor } from "./resolveActor.ts";

export const authenticate = (deps: ApiDeps, config: ApiConfig) =>
  createMiddleware<ApiEnv>(async (c, next) => {
    c.set(
      "actor",
      await resolveActor(deps, config, {
        authorization: c.req.header("Authorization"),
        internalToken: c.req.header("X-Internal-Token"),
        workspaceId: c.req.header("X-Workspace-Id"),
      }),
    );
    await next();
  });
