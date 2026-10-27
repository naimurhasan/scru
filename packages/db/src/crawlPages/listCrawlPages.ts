import type { CrawledPage } from "@scru/core";
import { and, asc, eq, gt } from "drizzle-orm";
import type { Database } from "../client.ts";
import { crawlPages } from "../schema.ts";

export type CrawlPageList = {
  pages: CrawledPage[];
  nextCursor: number | null;
};

export const listCrawlPages = async (
  db: Database,
  taskId: string,
  { after, limit }: { after: number; limit: number },
): Promise<CrawlPageList> => {
  const rows = await db
    .select({
      position: crawlPages.position,
      url: crawlPages.url,
      depth: crawlPages.depth,
      statusCode: crawlPages.statusCode,
      content: crawlPages.content,
      error: crawlPages.error,
    })
    .from(crawlPages)
    .where(and(eq(crawlPages.taskId, taskId), gt(crawlPages.position, after)))
    .orderBy(asc(crawlPages.position))
    .limit(limit + 1);
  const pages = rows.slice(0, limit);
  return {
    pages,
    nextCursor: rows.length > limit ? (pages.at(-1)?.position ?? null) : null,
  };
};
