import { setTimeout as delay } from "node:timers/promises";
import { FetchFailedError, type FetchFailure } from "../FetchFailedError.ts";
import type { BrowserProvider, FetchedPage } from "../types.ts";
import { detectBlock } from "./detectBlock.ts";
import { loadSearchPages, type SearchPagesInput } from "./loadSearchPages.ts";

export type RetryPolicy = {
  attempts: number;
  backoffMs: number;
};

type Attempt = { pages: FetchedPage[] } | { failure: FetchFailure };

const firstPageFailure = (pages: FetchedPage[]): FetchFailure | null => {
  const [first] = pages;
  return first ? detectBlock(first) : "unexpected_page";
};

const attemptSearch = async (
  provider: BrowserProvider,
  input: SearchPagesInput,
): Promise<Attempt> => {
  const tab = await provider.openPage();
  try {
    const pages = await loadSearchPages(tab, input);
    const failure = firstPageFailure(pages);
    return failure ? { failure } : { pages };
  } catch {
    return { failure: "navigation_failed" };
  } finally {
    await tab.close();
  }
};

export const fetchGoogleSearch = async (
  provider: BrowserProvider,
  input: SearchPagesInput,
  { attempts, backoffMs }: RetryPolicy,
): Promise<FetchedPage[]> => {
  for (let attempt = 1; ; attempt += 1) {
    const result = await attemptSearch(provider, input);
    if ("pages" in result) return result.pages;
    if (attempt >= attempts)
      throw new FetchFailedError(result.failure, attempt);
    await delay(backoffMs * attempt);
  }
};
