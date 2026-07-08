import { and, eq } from "drizzle-orm";
import type { Database } from "../client.ts";
import { tasks } from "../schema.ts";
import type { Task } from "./createTask.ts";

export const findTask = async (
  db: Database,
  workspaceId: string,
  taskId: string,
): Promise<Task | null> => {
  const [task] = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, taskId), eq(tasks.workspaceId, workspaceId)))
    .limit(1);
  return task ?? null;
};
