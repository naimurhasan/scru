import type { CheerioAPI } from "cheerio";
import { cleanText } from "../cleanText.ts";
import { normalizeLink } from "./normalizeLink.ts";
import type { OrganicResult } from "./types.ts";

const TITLE_LINKS = "#rso a:has(h3)";
const RESULT_BLOCK = "[data-rpos], .MjjYud";
const SNIPPET = '[data-sncf="1"], .VwiC3b';
const EXCLUDED_AREAS = ".related-question-pair";

export const parseOrganicResults = (
  $: CheerioAPI,
  page: number,
): OrganicResult[] =>
  $(TITLE_LINKS)
    .not((_, link) => $(link).closest(EXCLUDED_AREAS).length > 0)
    .toArray()
    .flatMap((link) => {
      const anchor = $(link);
      const title = cleanText(anchor.find("h3").first().text());
      const url = normalizeLink(anchor.attr("href"));
      if (!title || !url) return [];
      const snippet = anchor
        .closest(RESULT_BLOCK)
        .find(SNIPPET)
        .first()
        .clone();
      snippet.find("a").remove();
      return [{ title, link: url, snippet: cleanText(snippet.text()) }];
    })
    .map((result, index) => ({ position: index + 1, ...result, page }));
