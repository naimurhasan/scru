export type SearchUrlInput = {
  query: string;
  country: string;
  language: string;
  page: number;
};

const RESULTS_PER_PAGE = 10;

export const buildSearchUrl = ({
  query,
  country,
  language,
  page,
}: SearchUrlInput): string => {
  const url = new URL("https://www.google.com/search");
  url.searchParams.set("q", query);
  url.searchParams.set("hl", language);
  url.searchParams.set("gl", country.toLowerCase());
  if (page > 1)
    url.searchParams.set("start", String((page - 1) * RESULTS_PER_PAGE));
  return url.href;
};
