import { z } from "@hono/zod-openapi";

export const errorResponseSchema = z
  .object({
    success: z.literal(false),
    error: z.object({
      code: z.string(),
      message: z.string(),
      details: z.unknown().optional(),
      timestamp: z.string(),
    }),
  })
  .openapi("Error");
