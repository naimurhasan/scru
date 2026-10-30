import "server-only";
import { listCrawlPages, listTasksOfType } from "@scru/db";
import { db } from "@/lib/db";

const RECENT_TASKS = 20;
const SHOWN_PAGES = 100;

export const loadSiteTasks = async (
  workspaceId: string,
  taskType: "CRAWL" | "BATCH",
  selectedId: unknown,
) => {
  const tasks = await listTasksOfType(db, workspaceId, taskType, RECENT_TASKS);
  const selected =
    tasks.find(({ id }) => id === selectedId) ?? tasks[0] ?? null;
  const pages = selected
    ? (await listCrawlPages(db, selected.id, { after: -1, limit: SHOWN_PAGES }))
        .pages
    : [];
  return { tasks, selected, pages };
};
