import type { GoogleSearchJob, SearchOutcome } from "@scru/core";
import {
  FetchFailedError,
  fetchGoogleSearch,
  type BrowserProvider,
  type RetryPolicy,
} from "@scru/fetcher";
import { parseGoogleSearch } from "@scru/parser";

const PAGE_TIMEOUT_MS = 30_000;
const RETRY_POLICY: RetryPolicy = { attempts: 2, backoffMs: 5_000 };

export const createSearchProcessor =
  (provider: BrowserProvider) =>
  async ({ data }: { data: GoogleSearchJob }): Promise<SearchOutcome> => {
    try {
      const page = await fetchGoogleSearch(
        provider,
        {
          query: data.query,
          country: data.country,
          language: data.language,
          timeoutMs: PAGE_TIMEOUT_MS,
        },
        RETRY_POLICY,
      );
      return {
        ok: true,
        result: parseGoogleSearch(page.html),
        html: data.includeHtml ? page.html : null,
      };
    } catch (error) {
      if (error instanceof FetchFailedError)
        return { ok: false, reason: error.reason };
      throw error;
    }
  };
