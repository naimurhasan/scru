import type { CheerioAPI } from "cheerio";
import { cleanText } from "../cleanText.ts";
import type { KnowledgePanel } from "./types.ts";

const TITLE = '[data-attrid="title"]';
const SUBTITLE = '[data-attrid="subtitle"]';
const DESCRIPTION = '[data-attrid="description"] .kno-rdesc span';
const FACTS = '[data-attrid^="kc:/"]';
const FACT_LABEL = ".w8qArf";
const FACT_VALUE = ".kno-fv";
const EXPANDER_SUFFIX = /\s*·\s*See more$/;

const textOrNull = (text: string): string | null => cleanText(text) || null;

export const parseKnowledgePanel = ($: CheerioAPI): KnowledgePanel | null => {
  const title = cleanText($(TITLE).first().text());
  if (!title) return null;
  const facts = $(FACTS)
    .toArray()
    .map((fact) => ({
      label: cleanText($(fact).find(FACT_LABEL).first().text()).replace(
        /\s*:$/,
        "",
      ),
      value: cleanText($(fact).find(FACT_VALUE).first().text()).replace(
        EXPANDER_SUFFIX,
        "",
      ),
    }))
    .filter(({ label, value }) => label && value);
  return {
    title,
    subtitle: textOrNull($(SUBTITLE).first().text()),
    description: textOrNull($(DESCRIPTION).first().text()),
    facts,
  };
};
