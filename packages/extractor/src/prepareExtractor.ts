import {
  averageFill,
  extractPageType,
  type FieldFill,
  measureFill,
  type PageType,
  simplifyHtml,
} from "@scru/parser";
import type { CompleteJson } from "./createOpenRouterClient.ts";
import { findEchoFields } from "./findEchoFields.ts";
import { type PageTypeAnswer, readPageTypeAnswer } from "./pageTypeAnswer.ts";
import { buildDraftPrompt, buildRepairPrompt } from "./prompts.ts";
import { pickPageGroups } from "./pickPageGroups.ts";
import { groupUrlsByPattern } from "./urlPatterns.ts";

export type SamplePage = {
  url: string;
  html: string;
};

export type PreparedExtractor = {
  pageTypes: PageType[];
  modelCalls: number;
};

const PROMPT_PAGES = 2;
const CHECK_PAGES = 3;
const PAGE_CHARS = 15_000;
const GOOD_FILL = 0.8;
const WEAK_FIELD = 0.5;

const fillOf = (draft: PageTypeAnswer, pages: string[]): FieldFill =>
  measureFill(
    pages.map((html) => extractPageType(html, draft)),
    draft.fields,
  );

export const prepareExtractor = async (
  completeJson: CompleteJson,
  samples: SamplePage[],
): Promise<PreparedExtractor> => {
  let modelCalls = 0;
  const ask = async (messages: Parameters<CompleteJson>[0]) => {
    modelCalls += 1;
    return readPageTypeAnswer(await completeJson(messages).catch(() => null));
  };
  const htmlByUrl = new Map(samples.map(({ url, html }) => [url, html]));
  const pageTypes: PageType[] = [];

  for (const group of pickPageGroups(
    groupUrlsByPattern([...htmlByUrl.keys()], samples[0]?.url),
    samples[0]?.url,
  )) {
    const pages = group.urls.flatMap((url) => htmlByUrl.get(url) ?? []);
    const promptPages = pages.slice(0, PROMPT_PAGES);
    const unseen = pages.slice(PROMPT_PAGES, PROMPT_PAGES + CHECK_PAGES);
    const checkPages = unseen.length > 0 ? unseen : promptPages;

    let draft = await ask(
      buildDraftPrompt(
        group.pattern,
        promptPages.map((html) => simplifyHtml(html, PAGE_CHARS)),
      ),
    );
    if (!draft) continue;
    let fill = fillOf(draft, checkPages);

    const weak = draft.fields
      .map(({ name }) => name)
      .filter((name) => (fill[name] ?? 0) < WEAK_FIELD);
    if (averageFill(fill) < GOOD_FILL && weak.length > 0 && checkPages[0]) {
      const repaired = await ask(
        buildRepairPrompt(draft, weak, simplifyHtml(checkPages[0], PAGE_CHARS)),
      );
      const repairedFill = repaired && fillOf(repaired, checkPages);
      if (
        repaired &&
        repairedFill &&
        averageFill(repairedFill) > averageFill(fill)
      ) {
        draft = repaired;
        fill = repairedFill;
      }
    }

    const echoes = new Set(
      findEchoFields(
        checkPages.map((html) => extractPageType(html, draft)),
        draft.fields,
      ),
    );
    const fields = draft.fields.filter(
      ({ name }) => (fill[name] ?? 0) > 0 && !echoes.has(name),
    );
    if (fields.length === 0) continue;
    pageTypes.push({
      name: draft.name,
      pattern: group.pattern,
      itemSelector: draft.itemSelector,
      fields,
      fillRate: averageFill(
        Object.fromEntries(fields.map(({ name }) => [name, fill[name] ?? 0])),
      ),
    });
  }

  return { pageTypes, modelCalls };
};
