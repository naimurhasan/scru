import type { PageSnapshot } from "@scru/core";
import { convertHtml, extractWithCss } from "@scru/parser";
import type { FetchRequest, FetchResult } from "./schemas.ts";

const toContent = (page: PageSnapshot, output: FetchRequest["output"]) =>
  output === "screenshot"
    ? (page.screenshot ?? "")
    : convertHtml(page.html, output);

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
    : { ...target, output, content: toContent(page, output) };
};
