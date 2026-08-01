import type { GoogleSearchResult } from "./types.ts";

const uniqueBy = <Item>(items: Item[], key: (item: Item) => string): Item[] =>
  items.filter(
    (item, index) =>
      items.findIndex((other) => key(other) === key(item)) === index,
  );

export const mergeSearchPages = (
  pages: GoogleSearchResult[],
): GoogleSearchResult => ({
  organicResults: pages
    .flatMap((page) => page.organicResults)
    .map((result, index) => ({ ...result, position: index + 1 })),
  peopleAlsoAsk: uniqueBy(
    pages.flatMap((page) => page.peopleAlsoAsk),
    ({ question }) => question,
  ),
  relatedSearches: uniqueBy(
    pages.flatMap((page) => page.relatedSearches),
    ({ query }) => query,
  ),
  knowledgePanel:
    pages.find((page) => page.knowledgePanel)?.knowledgePanel ?? null,
});
