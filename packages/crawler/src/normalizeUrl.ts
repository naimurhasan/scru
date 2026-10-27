export const normalizeUrl = (value: string): string => {
  const url = new URL(value);
  url.hash = "";
  url.searchParams.sort();
  return url.href;
};
