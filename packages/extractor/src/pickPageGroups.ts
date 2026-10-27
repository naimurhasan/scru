import type { UrlGroup } from "./urlPatterns.ts";

export const MAX_PAGE_TYPES = 3;

export const pickPageGroups = (groups: UrlGroup[]): UrlGroup[] => {
  const repeated = groups.filter(({ urls }) => urls.length > 1);
  return (repeated.length > 0 ? repeated : groups).slice(0, MAX_PAGE_TYPES);
};
