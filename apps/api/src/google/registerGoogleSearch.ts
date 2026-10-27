import type { ApiApp, ApiDeps } from "../deps.ts";
import { meterRequest } from "../requests/meterRequest.ts";
import { executeGoogleSearch } from "./executeGoogleSearch.ts";
import { googleSearchRoute } from "./googleSearchRoute.ts";
import type { GoogleSearchResponse } from "./schemas.ts";

const withoutHtml = ({ html: _html, ...result }: { html?: string }) => result;

const loggedBody = ({ result }: GoogleSearchResponse) => ({
  success: true,
  result: withoutHtml(result),
});

export const registerGoogleSearch = (app: ApiApp, deps: ApiDeps): void => {
  app.openapi(googleSearchRoute, async (c) => {
    const request = c.req.valid("json");
    const body = await meterRequest(c, deps, {
      engine: "google",
      request,
      execute: (actor) => executeGoogleSearch(deps, actor, request),
      loggedBody,
    });
    return c.json(body, 200);
  });
};
