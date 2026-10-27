import type { ExtractorFetchOptions, StoredExtractor } from "@scru/core";
import type { PageType } from "@scru/parser";
import { and, eq, max } from "drizzle-orm";
import type { Database } from "../client.ts";
import { extractors } from "../schema.ts";
import { toStoredExtractor } from "./toStoredExtractor.ts";

export type NewExtractor = {
  workspaceId: string;
  taskId: string;
  host: string;
  pageTypes: PageType[];
  fetchOptions: ExtractorFetchOptions;
  model: string;
};

export const saveExtractor = (
  db: Database,
  extractor: NewExtractor,
): Promise<StoredExtractor> =>
  db.transaction(async (tx) => {
    const [latest] = await tx
      .select({ version: max(extractors.version) })
      .from(extractors)
      .where(
        and(
          eq(extractors.workspaceId, extractor.workspaceId),
          eq(extractors.host, extractor.host),
        ),
      );
    const [saved] = await tx
      .insert(extractors)
      .values({ ...extractor, version: (latest?.version ?? 0) + 1 })
      .returning();
    if (!saved) throw new Error("The extractor was not saved");
    return toStoredExtractor(saved);
  });
