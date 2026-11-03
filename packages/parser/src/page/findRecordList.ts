import type { CheerioAPI } from "cheerio";
import type { Element } from "domhandler";

const MIN_RECORDS = 4;
const MIN_RECORD_TEXT = 20;
const MAX_RECORD_WEIGHT = 40;

const weightOf = ($: CheerioAPI, element: Element) =>
  $(element).text().trim().length < MIN_RECORD_TEXT
    ? 0
    : Math.min($(element).find("*").length, MAX_RECORD_WEIGHT);

const scoreOf = ($: CheerioAPI, parent: Element) => {
  const groups = new Map<string, number[]>();
  for (const child of $(parent).children().toArray()) {
    groups.set(child.tagName, [
      ...(groups.get(child.tagName) ?? []),
      weightOf($, child),
    ]);
  }
  return Math.max(
    0,
    ...[...groups.values()]
      .map((weights) => weights.filter((weight) => weight > 0))
      .filter((weights) => weights.length >= MIN_RECORDS)
      .map((weights) => weights.reduce((sum, weight) => sum + weight, 0)),
  );
};

export const findRecordList = ($: CheerioAPI): Element | null => {
  const [best] = $("body *")
    .toArray()
    .map((element) => ({ element, score: scoreOf($, element) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);
  return best?.element ?? null;
};
