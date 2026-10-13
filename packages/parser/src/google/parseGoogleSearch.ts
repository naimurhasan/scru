import { load } from "cheerio";
import { parseKnowledgePanel } from "./parseKnowledgePanel.ts";
import { parseOrganicResults } from "./parseOrganicResults.ts";
import { parsePeopleAlsoAsk } from "./parsePeopleAlsoAsk.ts";
import { parseRelatedSearches } from "./parseRelatedSearches.ts";
import type { GoogleSearchResult } from "./types.ts";

export const parseGoogleSearch = (
  html: string,
  page = 1,
): GoogleSearchResult => {
  const $ = load(html);
  return {
    organicResults: parseOrganicResults($, page),
    peopleAlsoAsk: parsePeopleAlsoAsk($),
    relatedSearches: parseRelatedSearches($),
    knowledgePanel: parseKnowledgePanel($),
  };
};
