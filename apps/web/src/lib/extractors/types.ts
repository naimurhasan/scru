import type { StoredExtractor } from "@scru/core";

export type PageType = StoredExtractor["pageTypes"][number];

export type ExtractorField = PageType["fields"][number];
