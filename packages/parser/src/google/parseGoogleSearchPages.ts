import { mergeSearchPages } from "./mergeSearchPages.ts";
import { parseGoogleSearch } from "./parseGoogleSearch.ts";
import type { GoogleSearchResult } from "./types.ts";

export const parseGoogleSearchPages = (
  htmlPages: string[],
): GoogleSearchResult =>
  mergeSearchPages(
    htmlPages.map((html, index) => parseGoogleSearch(html, index + 1)),
  );
