import type { ApiApp, ApiDeps } from "../deps.ts";
import { reserveConcurrency } from "../limits/reserveConcurrency.ts";
import { executeGoogleSearch } from "./executeGoogleSearch.ts";
import { googleSearchRoute } from "./googleSearchRoute.ts";
import { toRequestLog } from "./toRequestLog.ts";

export const registerGoogleSearch = (app: ApiApp, deps: ApiDeps): void => {
  app.openapi(googleSearchRoute, async (c) => {
    const actor = c.get("actor");
    const request = c.req.valid("json");
    await reserveConcurrency(c, deps.limits);
    try {
      const startedAt = Date.now();
      const execution = await executeGoogleSearch(deps, actor, request);
      await deps.recordRequest(
        toRequestLog({
          actor,
          request,
          execution,
          durationMs: Date.now() - startedAt,
          now: new Date(),
        }),
      );
      if (!execution.ok) throw execution.error;
      c.header("X-Credits-Charged", String(execution.creditsCharged));
      c.header("X-Credits-Remaining", String(execution.creditsRemaining));
      return c.json(execution.body, 200);
    } finally {
      await deps.limits.releaseConcurrency(actor.workspaceId);
    }
  });
};
