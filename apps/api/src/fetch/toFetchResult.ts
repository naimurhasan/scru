import type { FetchOutput, PageSnapshot } from "@scru/core";
import { extractWithCss, toMarkdown, toText } from "@scru/parser";
import type { FetchRequest, FetchResult } from "./schemas.ts";

const CONVERTERS: Record<FetchOutput, (page: PageSnapshot) => string> = {
  html: (page) => page.html,
  markdown: (page) => toMarkdown(page.html),
  text: (page) => toText(page.html),
  screenshot: (page) => page.screenshot ?? "",
};

export const toFetchResult = (
  page: PageSnapshot,
  { output, cssExtractor }: Pick<FetchRequest, "output" | "cssExtractor">,
): FetchResult => {
  const target = {
    url: page.url,
    statusCode: page.status,
    ...(page.instructions.length > 0 && { instructions: page.instructions }),
  };
  return cssExtractor
    ? { ...target, data: extractWithCss(page.html, cssExtractor) }
    : { ...target, output, content: CONVERTERS[output](page) };
};
