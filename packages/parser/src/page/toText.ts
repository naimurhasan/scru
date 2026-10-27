import { load } from "cheerio";
import { cleanText } from "../cleanText.ts";

const HIDDEN = "script, style, noscript, template, svg, iframe, head";
const BLOCKS =
  "address, article, aside, blockquote, br, dd, div, dl, dt, fieldset, figcaption, figure, footer, form, h1, h2, h3, h4, h5, h6, header, hr, li, main, nav, ol, p, pre, section, table, td, th, tr, ul";

export const toText = (html: string): string => {
  const $ = load(html);
  $(HIDDEN).remove();
  $(BLOCKS).append(" ");
  return cleanText($.root().text());
};
