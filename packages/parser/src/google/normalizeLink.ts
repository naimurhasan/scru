const GOOGLE_ORIGIN = "https://www.google.com";
const TRACKED_PATH = "/url";
const TARGET_PARAMS = ["q", "url"];

const isWebUrl = (value: string | null): value is string =>
  value !== null && /^https?:\/\//.test(value);

export const normalizeLink = (href: string | undefined): string | null => {
  if (!href || !URL.canParse(href, GOOGLE_ORIGIN)) return null;
  const url = new URL(href, GOOGLE_ORIGIN);
  if (url.origin !== GOOGLE_ORIGIN || url.pathname !== TRACKED_PATH)
    return url.href;
  const target = TARGET_PARAMS.map((name) => url.searchParams.get(name)).find(
    isWebUrl,
  );
  return target ?? url.href;
};
