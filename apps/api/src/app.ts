import { OpenAPIHono } from "@hono/zod-openapi";
import { authenticate } from "./auth/authenticate.ts";
import type { ApiConfig, ApiDeps, ApiEnv } from "./deps.ts";
import { ApiError } from "./errors/ApiError.ts";
import { toApiError } from "./errors/toApiError.ts";
import { toErrorBody } from "./errors/toErrorBody.ts";
import { toValidationError } from "./errors/toValidationError.ts";
import { registerFetch } from "./fetch/registerFetch.ts";
import { registerGoogleSearch } from "./google/registerGoogleSearch.ts";
import { enforceRateLimit } from "./limits/enforceRateLimit.ts";
import { registerTaskRoutes } from "./tasks/registerTaskRoutes.ts";
import { registerBatchRoutes } from "./batch/registerBatchRoutes.ts";
import { registerCrawlRoutes } from "./crawl/registerCrawlRoutes.ts";
import { registerExtractorRoutes } from "./extractors/registerExtractorRoutes.ts";

export const createApp = (deps: ApiDeps, config: ApiConfig) => {
  const app = new OpenAPIHono<ApiEnv>({
    defaultHook: (result) => {
      if (!result.success) throw toValidationError(result.error.issues);
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
  app.use("/v1/*", enforceRateLimit(deps.limits));

  registerGoogleSearch(app, deps);
  registerFetch(app, deps, config);
  registerTaskRoutes(app, deps, config);
  registerCrawlRoutes(app, deps, config);
  registerBatchRoutes(app, deps, config);
  registerExtractorRoutes(app, deps, config);

  return app;
};
