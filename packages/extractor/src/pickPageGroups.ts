import type { UrlGroup } from "./urlPatterns.ts";

export const MAX_PAGE_TYPES = 3;

export const pickPageGroups = (
  groups: UrlGroup[],
  startUrl?: string,
): UrlGroup[] => {
  const isStart = ({ urls }: UrlGroup) =>
    startUrl !== undefined && urls.includes(startUrl);
  const repeated = groups.filter(({ urls }) => urls.length > 1);
  const others = (repeated.length > 0 ? repeated : groups).filter(
    (group) => !isStart(group),
  );
  return [...groups.filter(isStart), ...others].slice(0, MAX_PAGE_TYPES);
};
