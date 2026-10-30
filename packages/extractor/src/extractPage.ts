import {
  averageFill,
  type ExtractedData,
  extractPageType,
  measureFill,
  type PageType,
} from "@scru/parser";
import { matchesUrlPattern } from "./urlPatterns.ts";

export type ExtractedPage = {
  pageType: string;
  data: ExtractedData;
};

const MIN_FALLBACK_FILL = 0.6;

export const findPageType = (
  pageTypes: PageType[],
  url: string,
): PageType | null =>
  pageTypes.find(({ pattern }) => matchesUrlPattern(pattern, url)) ?? null;

const extractWith = (
  pageType: PageType,
  html: string,
  url: string,
): ExtractedPage => ({
  pageType: pageType.name,
  data: extractPageType(html, pageType, url),
});

const fillOf = (pageType: PageType, { data }: ExtractedPage) =>
  averageFill(measureFill([data], pageType.fields));

const bestFilled = (
  pageTypes: PageType[],
  html: string,
  url: string,
): ExtractedPage | null => {
  const [best] = pageTypes
    .map((pageType) => {
      const page = extractWith(pageType, html, url);
      return { page, fill: fillOf(pageType, page) };
    })
    .sort((a, b) => b.fill - a.fill);
  return best && best.fill >= MIN_FALLBACK_FILL ? best.page : null;
};

export const extractPage = (
  pageTypes: PageType[],
  html: string,
  url: string,
): ExtractedPage | null => {
  const matched = findPageType(pageTypes, url);
  return matched
    ? extractWith(matched, html, url)
    : bestFilled(pageTypes, html, url);
};
