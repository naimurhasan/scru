import type { CrawlOutput } from "@scru/core";
import type { PageContent } from "@scru/crawler";
import { extractPage } from "@scru/extractor";
import { convertHtml, type PageType } from "@scru/parser";

export const createPageReader =
  (output: CrawlOutput, pageTypes: PageType[]) =>
  (html: string, pageUrl: string): PageContent => {
    if (output !== "json")
      return { content: convertHtml(html, output), pageType: null, data: null };
    const extracted = extractPage(pageTypes, html, pageUrl);
    return {
      content: null,
      pageType: extracted?.pageType ?? null,
      data: extracted?.data ?? null,
    };
  };
