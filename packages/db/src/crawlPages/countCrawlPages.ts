import { count, eq } from "drizzle-orm";
import type { Database } from "../client.ts";
import { crawlPages } from "../schema.ts";

export const countCrawlPages = async (
  db: Database,
  taskId: string,
): Promise<number> => {
  const [row] = await db
    .select({ total: count() })
    .from(crawlPages)
    .where(eq(crawlPages.taskId, taskId));
  return row?.total ?? 0;
};
