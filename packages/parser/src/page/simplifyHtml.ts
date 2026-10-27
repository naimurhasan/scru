import { load } from "cheerio";

const NOISE =
  "script, style, noscript, template, svg, iframe, head, link, meta, canvas, video, audio, object";
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

export const simplifyHtml = (html: string, maxChars: number): string => {
  const $ = load(html);
  $(NOISE).remove();
  $("*")
    .contents()
    .filter((_, node) => node.type === "comment")
    .remove();
  $("*").each((_, element) => {
    const node = $(element);
    for (const name of Object.keys(node.attr() ?? {}))
      if (!KEPT_ATTRIBUTES.has(name)) node.removeAttr(name);
  });
  const body = ($("body").html() ?? $.root().html() ?? "")
    .replace(/\s+/g, " ")
    .replace(/> </g, "><")
    .trim();
  return body.slice(0, maxChars);
};
