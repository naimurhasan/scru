import { load } from "cheerio";
import { cleanText } from "../cleanText.ts";

const HIDDEN = "script, style, noscript, template, svg, iframe, head";

export const toText = (html: string): string => {
  const $ = load(html);
  $(HIDDEN).remove();
  return cleanText($.root().text());
};
