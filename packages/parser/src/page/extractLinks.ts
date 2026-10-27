import { load } from "cheerio";

const resolve = (href: string, base: string): string | null => {
  if (!URL.canParse(href, base)) return null;
  const url = new URL(href, base);
  if (url.protocol !== "http:" && url.protocol !== "https:") return null;
  url.hash = "";
  return url.href;
};

export const extractLinks = (html: string, pageUrl: string): string[] => {
  const $ = load(html);
  const base = resolve($("base[href]").attr("href") ?? "", pageUrl) ?? pageUrl;
  const links = $("a[href]")
    .toArray()
    .map((anchor) => resolve($(anchor).attr("href") ?? "", base))
    .filter((link): link is string => link !== null);
  return [...new Set(links)];
};
