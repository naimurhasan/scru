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
  pages: request.pages,
  includeHtml: request.include.html,
  resolveLinks: request.resolveLinks,
  browserOnly: false,
  taskId,
});
