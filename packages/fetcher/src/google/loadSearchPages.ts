import type { Page } from "playwright-core";
import type { FetchedPage } from "../types.ts";
import { detectBlock } from "./detectBlock.ts";
import { openFirstPage, type SearchInput } from "./openFirstPage.ts";
import { openNextPage } from "./openNextPage.ts";

export type SearchPagesInput = SearchInput & {
  pages: number;
};

export const loadSearchPages = async (
  page: Page,
  input: SearchPagesInput,
): Promise<FetchedPage[]> => {
  const first = await openFirstPage(page, input);
  if (detectBlock(first)) return [first];
  const loaded = [first];
  while (loaded.length < input.pages) {
    const next = await openNextPage(page, input.timeoutMs).catch(() => null);
    if (!next || detectBlock(next)) break;
    loaded.push(next);
  }
  return loaded;
};
