import type { Database } from "../client.ts";
import { tasks } from "../schema.ts";

export type NewTask = Pick<
  typeof tasks.$inferInsert,
  | "workspaceId"
  | "apiKeyId"
  | "taskType"
  | "priority"
  | "idempotencyKey"
  | "payload"
  | "webhookUrl"
>;

export type Task = typeof tasks.$inferSelect;

export const createTask = async (
  db: Database,
  task: NewTask,
): Promise<Task | null> => {
  const [created] = await db
    .insert(tasks)
    .values(task)
    .onConflictDoNothing({
      target: [tasks.workspaceId, tasks.idempotencyKey],
    })
    .returning();
  return created ?? null;
};
