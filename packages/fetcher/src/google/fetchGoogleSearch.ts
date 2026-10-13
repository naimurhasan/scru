import { setTimeout as delay } from "node:timers/promises";
import { FetchFailedError, type FetchFailure } from "../FetchFailedError.ts";
import type { BrowserProvider, FetchedPage } from "../types.ts";
import { detectBlock } from "./detectBlock.ts";
import { loadSearchPage, type SearchPageInput } from "./loadSearchPage.ts";

export type RetryPolicy = {
  attempts: number;
  backoffMs: number;
};

type Attempt = { page: FetchedPage } | { failure: FetchFailure };

const attemptSearch = async (
  provider: BrowserProvider,
  input: SearchPageInput,
): Promise<Attempt> => {
  const tab = await provider.openPage();
  try {
    const page = await loadSearchPage(tab, input);
    const failure = detectBlock(page);
    return failure ? { failure } : { page };
  } catch {
    return { failure: "navigation_failed" };
  } finally {
    await tab.close();
  }
};

export const fetchGoogleSearch = async (
  provider: BrowserProvider,
  input: SearchPageInput,
  { attempts, backoffMs }: RetryPolicy,
): Promise<FetchedPage> => {
  for (let attempt = 1; ; attempt += 1) {
    const result = await attemptSearch(provider, input);
    if ("page" in result) return result.page;
    if (attempt >= attempts)
      throw new FetchFailedError(result.failure, attempt);
    await delay(backoffMs * attempt);
  }
};
