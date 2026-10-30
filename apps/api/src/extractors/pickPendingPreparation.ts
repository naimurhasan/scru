import { isTaskPending } from "@scru/core";
import type { Task } from "@scru/db";
import { z } from "zod";

const payloadSchema = z.object({ url: z.url() });

const hostOf = (payload: unknown) => {
  const parsed = payloadSchema.safeParse(payload);
  return parsed.success ? new URL(parsed.data.url).hostname : null;
};

export const pickPendingPreparation = (
  tasks: Task[],
  host: string,
): Task | null =>
  tasks.find(
    (task) => isTaskPending(task.status) && hostOf(task.payload) === host,
  ) ?? null;
