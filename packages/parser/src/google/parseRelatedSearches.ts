import type { CheerioAPI } from "cheerio";
import { cleanText } from "../cleanText.ts";
import type { RelatedSearch } from "./types.ts";

const RELATED_LINKS = '#bres a[href^="/search"]';

export const parseRelatedSearches = ($: CheerioAPI): RelatedSearch[] => {
  const queries = $(RELATED_LINKS)
    .toArray()
    .map((link) => cleanText($(link).text()))
    .filter(Boolean);
  return [...new Set(queries)].map((query) => ({ query }));
};
