import { errorResponseSchema } from "./errorResponseSchema.ts";

export const errorResponse = (description: string) => ({
  description,
  content: { "application/json": { schema: errorResponseSchema } },
});
