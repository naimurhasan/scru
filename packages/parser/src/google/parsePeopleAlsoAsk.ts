import type { CheerioAPI } from "cheerio";
import { cleanText } from "../cleanText.ts";
import type { PeopleAlsoAskItem } from "./types.ts";

const QUESTIONS = ".related-question-pair[data-q]";

export const parsePeopleAlsoAsk = ($: CheerioAPI): PeopleAlsoAskItem[] =>
  $(QUESTIONS)
    .toArray()
    .map((pair) => cleanText($(pair).attr("data-q") ?? ""))
    .filter(Boolean)
    .map((question) => ({ question }));
