import { z } from "zod";

const FALLBACK = "Something went wrong. Please try again.";

const errorBodySchema = z.object({
  error: z.object({
    message: z.string(),
    details: z.array(z.object({ message: z.string() })).optional(),
  }),
});

export const readErrorMessage = (body: unknown): string => {
  const parsed = errorBodySchema.safeParse(body);
  if (!parsed.success) return FALLBACK;
  return parsed.data.error.details?.[0]?.message ?? parsed.data.error.message;
};
