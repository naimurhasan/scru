import { load } from "cheerio";

export type ExtractorRule = {
  selector: string;
  attribute: string | null;
};

const ATTRIBUTE_SUFFIX = /\s*@([\w:-]+)$/;

export const readExtractorRule = (rule: string): ExtractorRule => {
  const match = rule.match(ATTRIBUTE_SUFFIX);
  return match?.[1] === undefined
    ? { selector: rule.trim(), attribute: null }
    : { selector: rule.slice(0, match.index).trim(), attribute: match[1] };
};

export const isValidExtractorRule = (rule: string): boolean => {
  const { selector } = readExtractorRule(rule);
  if (selector === "") return false;
  try {
    load("")(selector);
    return true;
  } catch {
    return false;
  }
};
