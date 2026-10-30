import { and, desc, eq } from "drizzle-orm";
import type { Database } from "../client.ts";
import { tasks } from "../schema.ts";

export const listTasksOfType = (
  db: Database,
  workspaceId: string,
  taskType: string,
  limit: number,
) =>
  db
    .select()
    .from(tasks)
    .where(
      and(eq(tasks.workspaceId, workspaceId), eq(tasks.taskType, taskType)),
    )
    .orderBy(desc(tasks.createdAt))
    .limit(limit);
