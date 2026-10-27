import type { FetchOutput } from "@scru/core";

export const FETCH_OUTPUT_LABELS: Record<FetchOutput, string> = {
  html: "HTML",
  markdown: "Markdown",
  text: "Plain text",
  screenshot: "Screenshot",
};

export const FETCH_OUTPUT_VALUES = Object.keys(FETCH_OUTPUT_LABELS) as [
  FetchOutput,
  ...FetchOutput[],
];
