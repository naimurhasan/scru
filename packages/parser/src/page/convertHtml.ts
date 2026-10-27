import { toMarkdown } from "./toMarkdown.ts";
import { toText } from "./toText.ts";

export type TextOutput = "html" | "markdown" | "text";

const CONVERTERS: Record<TextOutput, (html: string) => string> = {
  html: (html) => html,
  markdown: toMarkdown,
  text: toText,
};

export const convertHtml = (html: string, output: TextOutput): string =>
  CONVERTERS[output](html);
