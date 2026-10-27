import { type Cheerio, load } from "cheerio";
import type { AnyNode } from "domhandler";
import { cleanText } from "../cleanText.ts";
import type {
  ExtractedData,
  ExtractedRecord,
  ExtractorField,
  PageTypeRules,
} from "./extractorTypes.ts";

const ADDRESS_ATTRIBUTES = new Set(["href", "src"]);

const toAbsolute = (value: string, pageUrl: string | null) =>
  pageUrl !== null && URL.canParse(value, pageUrl)
    ? new URL(value, pageUrl).href
    : value;

const readField = (
  scope: Cheerio<AnyNode>,
  { selector, attribute }: ExtractorField,
  pageUrl: string | null,
): string | null => {
  try {
    const target =
      selector.trim() === "" ? scope : scope.find(selector).first();
    if (target.length === 0) return null;
    const value =
      attribute === null ? cleanText(target.text()) : target.attr(attribute);
    if (!value) return null;
    return attribute !== null && ADDRESS_ATTRIBUTES.has(attribute)
      ? toAbsolute(value, pageUrl)
      : value;
  } catch {
    return null;
  }
};

const readRecord = (
  scope: Cheerio<AnyNode>,
  fields: ExtractorField[],
  pageUrl: string | null,
): ExtractedRecord =>
  Object.fromEntries(
    fields.map((field) => [field.name, readField(scope, field, pageUrl)]),
  );

const findItems = ($: ReturnType<typeof load>, itemSelector: string) => {
  try {
    return $(itemSelector).toArray();
  } catch {
    return [];
  }
};

export const extractPageType = (
  html: string,
  { itemSelector, fields }: PageTypeRules,
  pageUrl: string | null = null,
): ExtractedData => {
  const $ = load(html);
  if (itemSelector === null) return readRecord($.root(), fields, pageUrl);
  return findItems($, itemSelector).map((item) =>
    readRecord($(item), fields, pageUrl),
  );
};
