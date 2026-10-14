import type { GoogleSearchResult } from "@scru/parser";

export type GoogleSearchJob = {
  query: string;
  country: string;
  language: string;
  pages: number;
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
  | {
      ok: true;
      result: GoogleSearchResult;
      html: string | null;
      pages: number;
    }
  | { ok: false; reason: SearchFailureReason };
