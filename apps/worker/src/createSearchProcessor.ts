import type { GoogleSearchJob, SearchOutcome } from "@scru/core";
import {
  FetchFailedError,
  fetchGoogleSearch,
  type BrowserProvider,
  type RetryPolicy,
} from "@scru/fetcher";
import { parseGoogleSearchPages } from "@scru/parser";

const PAGE_TIMEOUT_MS = 30_000;
const RETRY_POLICY: RetryPolicy = { attempts: 2, backoffMs: 5_000 };

export const createSearchProcessor =
  (provider: BrowserProvider) =>
  async ({ data }: { data: GoogleSearchJob }): Promise<SearchOutcome> => {
    try {
      const pages = await fetchGoogleSearch(
        provider,
        {
          query: data.query,
          country: data.country,
          language: data.language,
          pages: data.pages,
          timeoutMs: PAGE_TIMEOUT_MS,
        },
        RETRY_POLICY,
      );
      return {
        ok: true,
        result: parseGoogleSearchPages(pages.map(({ html }) => html)),
        html: data.includeHtml ? (pages[0]?.html ?? null) : null,
        pages: pages.length,
      };
    } catch (error) {
      if (error instanceof FetchFailedError)
        return { ok: false, reason: error.reason };
      throw error;
    }
  };
