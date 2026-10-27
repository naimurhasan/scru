import { load } from "cheerio";
import { cleanText } from "../cleanText.ts";
import { readExtractorRule } from "./readExtractorRule.ts";

export type ExtractedValue = string | string[];

const single = (values: string[]): ExtractedValue =>
  values.length === 1 ? (values[0] ?? "") : values;

export const extractWithCss = (
  html: string,
  extractor: Record<string, string>,
): Record<string, ExtractedValue> => {
  const $ = load(html);
  return Object.fromEntries(
    Object.entries(extractor).map(([name, rule]) => {
      const { selector, attribute } = readExtractorRule(rule);
      const values = $(selector)
        .toArray()
        .map((element) =>
          attribute === null
            ? cleanText($(element).text())
            : ($(element).attr(attribute) ?? ""),
        );
      return [name, single(values)];
    }),
  );
};
