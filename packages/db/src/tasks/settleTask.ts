import type { TaskSettlement, WebhookEvent } from "@scru/core";
import { and, eq, inArray } from "drizzle-orm";
import type { Database, Transaction } from "../client.ts";
import { insertRequestLog } from "../requestLogs/insertRequestLog.ts";
import { tasks, webhookDeliveries, workspaces } from "../schema.ts";
import { chargeCredits } from "../workspaces/chargeCredits.ts";
import type { Task } from "./createTask.ts";

const OPEN_STATUSES = ["QUEUED", "PROCESSING"];
const OK = 200;
const FORBIDDEN = 403;

export type SettledTask = {
  task: Task;
  deliveryId: string | null;
};

type Failure = Extract<TaskSettlement, { ok: false }>;

const OUT_OF_CREDITS: Failure = {
  ok: false,
  errorCode: "INSUFFICIENT_CREDITS",
  errorMessage: "Not enough credits to complete this task",
  httpStatus: FORBIDDEN,
};

const lockOpenTask = async (tx: Transaction, taskId: string) => {
  const [task] = await tx
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, taskId), inArray(tasks.status, OPEN_STATUSES)))
    .for("update")
    .limit(1);
  return task ?? null;
};

const chargeOrFail = async (
  tx: Transaction,
  workspaceId: string,
  settlement: TaskSettlement,
): Promise<TaskSettlement> => {
  if (!settlement.ok) return settlement;
  const remaining = await chargeCredits(tx, workspaceId, settlement.cost);
  return remaining === null ? OUT_OF_CREDITS : settlement;
};

const closeTask = async (
  tx: Transaction,
  task: Task,
  settlement: TaskSettlement,
  completedAt: Date,
): Promise<Task> => {
  const [closed] = await tx
    .update(tasks)
    .set(
      settlement.ok
        ? {
            status: "COMPLETED",
            result: settlement.result,
            creditsCharged: settlement.cost,
            completedAt,
          }
        : {
            status: "FAILED",
            errorCode: settlement.errorCode,
            errorMessage: settlement.errorMessage,
            completedAt,
          },
    )
    .where(eq(tasks.id, task.id))
    .returning();
  return closed ?? task;
};

const logTask = (
  tx: Transaction,
  task: Task,
  settlement: TaskSettlement,
  completedAt: Date,
) =>
  insertRequestLog(tx, {
    workspaceId: task.workspaceId,
    apiKeyId: task.apiKeyId,
    engine: task.taskType.toLowerCase(),
    request: task.payload,
    durationMs:
      completedAt.getTime() - (task.startedAt ?? task.createdAt).getTime(),
    ...(settlement.ok
      ? {
          httpStatus: OK,
          creditsCharged: settlement.cost,
          response: { success: true, result: settlement.loggedResult },
        }
      : {
          httpStatus: settlement.httpStatus,
          errorCode: settlement.errorCode,
          creditsCharged: 0,
          response: {
            success: false,
            error: {
              code: settlement.errorCode,
              message: settlement.errorMessage,
            },
          },
        }),
  });

const planDelivery = async (
  tx: Transaction,
  task: Task,
  event: WebhookEvent,
): Promise<string | null> => {
  const [workspace] = await tx
    .select({ webhookUrl: workspaces.webhookUrl })
    .from(workspaces)
    .where(eq(workspaces.id, task.workspaceId))
    .limit(1);
  const url = task.webhookUrl ?? workspace?.webhookUrl ?? null;
  if (url === null) return null;
  const [delivery] = await tx
    .insert(webhookDeliveries)
    .values({ workspaceId: task.workspaceId, taskId: task.id, url, event })
    .returning({ id: webhookDeliveries.id });
  return delivery?.id ?? null;
};

export const settleTask = (
  db: Database,
  taskId: string,
  outcome: TaskSettlement,
): Promise<SettledTask | null> =>
  db.transaction(async (tx) => {
    const open = await lockOpenTask(tx, taskId);
    if (!open) return null;
    const completedAt = new Date();
    const settlement = await chargeOrFail(tx, open.workspaceId, outcome);
    const task = await closeTask(tx, open, settlement, completedAt);
    await logTask(tx, open, settlement, completedAt);
    const deliveryId = await planDelivery(
      tx,
      task,
      settlement.ok ? "task.completed" : "task.failed",
    );
    return { task, deliveryId };
  });
