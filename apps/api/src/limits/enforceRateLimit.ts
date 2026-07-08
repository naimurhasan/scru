import { createMiddleware } from "hono/factory";
import type { ApiDeps, ApiEnv } from "../deps.ts";
import { ApiError } from "../errors/ApiError.ts";

export const enforceRateLimit = (limits: ApiDeps["limits"]) =>
  createMiddleware<ApiEnv>(async (c, next) => {
    const decision = await limits.takeRateSlot(c.get("actor").workspaceId);
    c.header("X-RateLimit-Limit", String(decision.limit));
    c.header("X-RateLimit-Remaining", String(decision.remaining));
    if (!decision.allowed)
      throw new ApiError(
        "RATE_LIMITED",
        "Too many requests this second. Retry shortly.",
        { limit: decision.limit },
      );
    await next();
  });
