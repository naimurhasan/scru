import type { StoredExtractor } from "@scru/core";

export const toExtractorView = ({
  id,
  host,
  version,
  pageTypes,
  createdAt,
}: StoredExtractor) => ({
  id,
  host,
  version,
  pageTypes,
  createdAt: createdAt.toISOString(),
});
