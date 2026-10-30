import { z } from "zod";

const taskBodySchema = z.object({
  task: z.object({
    status: z.string(),
    payload: z.unknown(),
    result: z.unknown(),
    error: z.object({ message: z.string() }).nullable(),
  }),
});

export type TaskState = {
  status: string;
  payload: unknown;
  result: unknown;
  errorMessage: string | null;
};

export const readTaskState = (body: unknown): TaskState | null => {
  const parsed = taskBodySchema.safeParse(body);
  if (!parsed.success) return null;
  const { status, payload, result, error } = parsed.data.task;
  return { status, payload, result, errorMessage: error?.message ?? null };
};
