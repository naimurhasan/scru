import type { ExtractorFetchOptions, StoredExtractor } from "@scru/core";
import type { PageType } from "@scru/parser";
import type { extractors } from "../schema.ts";

export const toStoredExtractor = (
  row: typeof extractors.$inferSelect,
): StoredExtractor => ({
  id: row.id,
  host: row.host,
  version: row.version,
  pageTypes: row.pageTypes as PageType[],
  fetchOptions: row.fetchOptions as ExtractorFetchOptions,
  model: row.model,
  createdAt: row.createdAt,
});
