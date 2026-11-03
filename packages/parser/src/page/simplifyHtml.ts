import { load } from "cheerio";
import { findRecordList } from "./findRecordList.ts";

const NOISE =
  "script, style, noscript, template, svg, iframe, head, link, meta, canvas, video, audio, object";
const CHROME =
  "nav, aside, dialog, [role=navigation], [role=banner], [role=contentinfo], [role=search], [role=dialog]";
const PAGE_EDGES = "header, footer";
const CONTENT = "main, article";
const MAIN = "main, [role=main]";
const MAX_ATTRIBUTE_CHARS = 80;
const KEPT_ATTRIBUTES = new Set([
  "class",
  "id",
  "href",
  "src",
  "alt",
  "title",
  "itemprop",
  "datetime",
  "content",
  "aria-label",
  "data-testid",
]);

const squeeze = (html: string) =>
  html.replace(/\s+/g, " ").replace(/> </g, "><").trim();

export const simplifyHtml = (html: string, maxChars: number): string => {
  const $ = load(html);
  $(NOISE).remove();
  $(CHROME).remove();
  $(PAGE_EDGES)
    .filter((_, element) => $(element).closest(CONTENT).length === 0)
    .remove();
  $("*")
    .contents()
    .filter((_, node) => node.type === "comment")
    .remove();
  $("*").each((_, element) => {
    const node = $(element);
    for (const [name, value] of Object.entries(node.attr() ?? {}))
      if (!KEPT_ATTRIBUTES.has(name)) node.removeAttr(name);
      else if (value.length > MAX_ATTRIBUTE_CHARS)
        node.attr(name, value.slice(0, MAX_ATTRIBUTE_CHARS));
  });
  const main = $(MAIN).first();
  const page = squeeze(
    (main.length > 0 ? $.html(main) : null) ??
      $("body").html() ??
      $.root().html() ??
      "",
  );
  if (page.length <= maxChars) return page;
  const list = findRecordList($);
  const records = list ? squeeze($.html(list)) : "";
  if (!records || page.slice(0, maxChars).includes(records.slice(0, 200)))
    return page.slice(0, maxChars);
  const top = Math.floor(maxChars / 2);
  return `${page.slice(0, top)}${records}`.slice(0, maxChars);
};
