import type { Context } from "hono";
import type { ApiApp, ApiConfig, ApiDeps, ApiEnv } from "../deps.ts";
import { toValidationError } from "../errors/toValidationError.ts";
import { meterRequest } from "../requests/meterRequest.ts";
import { executeFetch } from "./executeFetch.ts";
import { fetchQueryRoute, fetchRoute } from "./fetchRoute.ts";
import { readFetchQuery } from "./readFetchQuery.ts";
import {
  fetchRequestSchema,
  type FetchRequest,
  type FetchResponse,
} from "./schemas.ts";

const loggedBody = ({
  result: { content: _content, ...result },
}: FetchResponse) => ({
  success: true,
  result,
});

export const registerFetch = (
  app: ApiApp,
  deps: ApiDeps,
  config: ApiConfig,
): void => {
  const fetchFor = (c: Context<ApiEnv>, request: FetchRequest) =>
    meterRequest(c, deps, {
      engine: "fetch",
      request,
      execute: (actor) => executeFetch(deps, config, actor, request),
      loggedBody,
    });

  app.openapi(fetchRoute, async (c) =>
    c.json(await fetchFor(c, c.req.valid("json")), 200),
  );

  app.openapi(fetchQueryRoute, async (c) => {
    const parsed = fetchRequestSchema.safeParse(
      readFetchQuery(c.req.valid("query")),
    );
    if (!parsed.success) throw toValidationError(parsed.error.issues);
    return c.json(await fetchFor(c, parsed.data), 200);
  });
};
