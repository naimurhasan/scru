import { z } from "@hono/zod-openapi";
import {
  requirePremiumForCountry,
  siteJobShape,
} from "../crawl/siteJobSchema.ts";
import { publicUrlSchema } from "../fetch/schemas.ts";
import { taskViewSchema } from "../tasks/schemas.ts";

const MAX_URLS = 1000;

export const batchRequestSchema = z
  .object({
    urls: z
      .array(publicUrlSchema)
      .min(1)
      .max(MAX_URLS)
      .openapi({
        example: [
          "https://books.toscrape.com/",
          "https://quotes.toscrape.com/",
        ],
      }),
    ...siteJobShape,
  })
  .superRefine(requirePremiumForCountry)
  .openapi("BatchRequest");

export type BatchRequest = z.infer<typeof batchRequestSchema>;

export const batchStatusResponseSchema = z
  .object({
    success: z.literal(true),
    task: taskViewSchema,
    progress: z.object({ done: z.number().int(), total: z.number().int() }),
  })
  .openapi("BatchStatusResponse");
