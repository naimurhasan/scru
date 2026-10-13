import { OpenAPIHono } from "@hono/zod-openapi";
import { authenticate } from "./auth/authenticate.ts";
import type { ApiConfig, ApiDeps, ApiEnv } from "./deps.ts";
import { ApiError } from "./errors/ApiError.ts";
import { toApiError } from "./errors/toApiError.ts";
import { toErrorBody } from "./errors/toErrorBody.ts";
import { executeGoogleSearch } from "./google/executeGoogleSearch.ts";
import { googleSearchRoute } from "./google/googleSearchRoute.ts";
import { toRequestLog } from "./google/toRequestLog.ts";

export const createApp = (deps: ApiDeps, config: ApiConfig) => {
  const app = new OpenAPIHono<ApiEnv>({
    defaultHook: (result) => {
      if (!result.success)
        throw new ApiError(
          "VALIDATION_ERROR",
          "The request body is invalid",
          result.error.issues.map(({ path, message }) => ({
            field: path.join("."),
            message,
          })),
        );
    },
  });

  app.onError((error, c) => {
    const apiError = toApiError(error);
    if (apiError.code === "INTERNAL_ERROR") console.error(error);
    return c.json(toErrorBody(apiError, new Date()), apiError.status);
  });

  app.notFound((c) =>
    c.json(
      toErrorBody(
        new ApiError("NOT_FOUND", `No route for ${c.req.method} ${c.req.path}`),
        new Date(),
      ),
      404,
    ),
  );

  app.get("/health", (c) => c.json({ status: "ok" }));

  app.openAPIRegistry.registerComponent("securitySchemes", "bearerAuth", {
    type: "http",
    scheme: "bearer",
  });
  app.doc31("/openapi.json", {
    openapi: "3.1.0",
    info: { title: "scru API", version: "1.0.0" },
  });

  app.use("/v1/*", authenticate(deps, config));

  app.openapi(googleSearchRoute, async (c) => {
    const actor = c.get("actor");
    const request = c.req.valid("json");
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
  });

  return app;
};
