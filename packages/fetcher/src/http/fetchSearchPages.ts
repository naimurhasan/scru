import { detectBlock } from "../google/detectBlock.ts";
import type { FetchedPage } from "../types.ts";
import { buildSearchUrl } from "./buildSearchUrl.ts";
import type { SessionClient } from "./createSessionClient.ts";

export type HttpSearchInput = {
  query: string;
  country: string;
  language: string;
  pages: number;
};

const takeUntilBlocked = (pages: FetchedPage[]): FetchedPage[] => {
  const blocked = pages.findIndex((page) => detectBlock(page) !== null);
  return blocked === -1 ? pages : pages.slice(0, blocked);
};

export const fetchSearchPages = async (
  client: SessionClient,
  { pages, ...search }: HttpSearchInput,
): Promise<FetchedPage[]> => {
  const first = await client.fetchPage(buildSearchUrl({ ...search, page: 1 }));
  if (detectBlock(first) || pages === 1) return [first];
  const rest = await Promise.all(
    Array.from({ length: pages - 1 }, (_, index) =>
      client
        .fetchPage(buildSearchUrl({ ...search, page: index + 2 }))
        .catch(() => null),
    ),
  );
  const fetched = rest.filter((page): page is FetchedPage => page !== null);
  return [first, ...takeUntilBlocked(fetched)];
};
