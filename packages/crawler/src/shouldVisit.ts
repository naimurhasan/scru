import { toPathPattern } from "./toPathPattern.ts";

export type VisitRules = {
  host: string;
  include: string[];
  exclude: string[];
};

const ASSET =
  /\.(avif|bmp|css|csv|docx?|eot|exe|gif|gz|ico|jpe?g|js|json|mp3|mp4|pdf|png|pptx?|rar|svg|tar|ttf|webm|webp|woff2?|xlsx?|xml|zip)$/i;

const matchesAny = (path: string, globs: string[]) =>
  globs.some((glob) => toPathPattern(glob).test(path));

export const shouldVisit = (
  link: string,
  { host, include, exclude }: VisitRules,
): boolean => {
  const url = new URL(link);
  const path = `${url.pathname}${url.search}`;
  if (url.hostname !== host) return false;
  if (ASSET.test(url.pathname)) return false;
  if (include.length > 0 && !matchesAny(path, include)) return false;
  return !matchesAny(path, exclude);
};
