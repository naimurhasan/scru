import type { PageTypeAnswer } from "./pageTypeAnswer.ts";

export type ChatMessage = {
  role: "system" | "user";
  content: string;
};

const SYSTEM: ChatMessage = {
  role: "system",
  content:
    "You write CSS selectors that pull structured data out of web pages. Answer with one JSON object and nothing else.",
};

const ANSWER_SHAPE = `{
  "name": "snake_case name for this kind of page, like product_detail or product_list",
  "itemSelector": "CSS selector that matches each repeated record on a list page, or null when the page shows one main record",
  "fields": [
    {
      "name": "snake_case field name",
      "description": "what the field holds",
      "selector": "CSS selector, relative to the item when itemSelector is set; an empty string means the item itself",
      "attribute": "attribute to read, like href, src or title, or null to read the text"
    }
  ]
}`;

const RULES = [
  "Pick the 3 to 12 fields a person would most want from this kind of page, such as names, prices, links, images, ratings, dates and descriptions.",
  "Prefer class, id and itemprop selectors over positions like :nth-child, so the selectors keep working on other pages of the same kind.",
  "Skip navigation, headers, footers, ads and anything that is the same on every page of the site.",
  "When a link or image holds the full value in an attribute such as title, href or src, read that attribute.",
];

const pageBlock = (html: string, index: number) =>
  `<page ${index + 1}>\n${html}\n</page ${index + 1}>`;

export const buildDraftPrompt = (
  pattern: string,
  pages: string[],
): ChatMessage[] => [
  SYSTEM,
  {
    role: "user",
    content: [
      `These ${pages.length} pages share the URL pattern ${pattern}. Their HTML is simplified.`,
      ...RULES,
      `Answer in this shape:\n${ANSWER_SHAPE}`,
      ...pages.map(pageBlock),
    ].join("\n\n"),
  },
];

export const buildRepairPrompt = (
  draft: PageTypeAnswer,
  emptyFields: string[],
  page: string,
): ChatMessage[] => [
  SYSTEM,
  {
    role: "user",
    content: [
      `These selectors were written for one kind of page:\n${JSON.stringify(draft, null, 2)}`,
      `On the page below, which the selectors were not written from, these fields came back empty: ${emptyFields.join(", ")}.`,
      "Return the whole answer again in the same shape, with selectors that work on both kinds of sample. Keep fields that already work unchanged. Drop a field only if this page truly does not have it.",
      ...RULES,
      pageBlock(page, 0),
    ].join("\n\n"),
  },
];
