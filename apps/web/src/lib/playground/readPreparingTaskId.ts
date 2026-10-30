import { z } from "zod";

const preparingSchema = z.object({
  status: z.literal("PREPARING"),
  task: z.object({ id: z.string() }),
});

export const readPreparingTaskId = (body: unknown): string | null => {
  const parsed = preparingSchema.safeParse(body);
  return parsed.success ? parsed.data.task.id : null;
};
