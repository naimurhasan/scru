import { z } from "zod";

const taskBodySchema = z.object({ task: z.object({ id: z.string() }) });

export const readTaskId = (body: unknown): string | null => {
  const parsed = taskBodySchema.safeParse(body);
  return parsed.success ? parsed.data.task.id : null;
};
