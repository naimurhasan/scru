import type { GoogleSearchJob } from "@scru/core";
import type { GoogleSearchRequest } from "./schemas.ts";

const LANGUAGE = "en";

export const toSearchJob = (
  request: GoogleSearchRequest,
  taskId: string | null,
): GoogleSearchJob => ({
  query: request.query,
  country: request.country,
  language: LANGUAGE,
  includeHtml: request.include.html,
  taskId,
});
