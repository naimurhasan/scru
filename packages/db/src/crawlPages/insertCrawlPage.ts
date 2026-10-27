import type { CrawledPage } from "@scru/core";
import type { Database } from "../client.ts";
import { crawlPages } from "../schema.ts";

export const insertCrawlPage = async (
  db: Database,
  taskId: string,
  page: CrawledPage,
): Promise<void> => {
  await db.insert(crawlPages).values({ taskId, ...page });
};
