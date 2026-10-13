import type { GoogleSearchResult } from "@scru/parser";

export type GoogleSearchJob = {
  query: string;
  country: string;
  language: string;
  includeHtml: boolean;
  taskId: string | null;
};

export type SearchFailureReason =
  | "captcha"
  | "http_error"
  | "unexpected_page"
  | "navigation_failed"
  | "timeout";

export type SearchOutcome =
  | { ok: true; result: GoogleSearchResult; html: string | null }
  | { ok: false; reason: SearchFailureReason };
