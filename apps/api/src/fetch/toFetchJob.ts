import type { FetchJob } from "@scru/core";
import type { FetchRequest } from "./schemas.ts";

export const toFetchJob = (request: FetchRequest): FetchJob => ({
  url: request.url,
  jsRender: request.jsRender,
  instructions: request.jsInstructions,
  waitFor: request.waitFor ?? null,
  waitMs: request.wait,
  screenshot: request.output === "screenshot",
  blockResources: request.blockResources,
  proxy: request.premiumProxy
    ? { country: request.country ?? null, sessionId: request.sessionId ?? null }
    : null,
});
