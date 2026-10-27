import { z } from "@hono/zod-openapi";
import { countrySchema, publicUrlSchema } from "../fetch/schemas.ts";

const LOWEST_PRIORITY = 1;
const HIGHEST_PRIORITY = 10;

export const prepareExtractorRequestSchema = z
  .object({
    url: publicUrlSchema,
    jsRender: z.boolean().default(false),
    blockResources: z.boolean().default(true),
    premiumProxy: z.boolean().default(false),
    country: countrySchema.optional(),
    priority: z
      .number()
      .int()
      .min(LOWEST_PRIORITY)
      .max(HIGHEST_PRIORITY)
      .default(LOWEST_PRIORITY),
    idempotencyKey: z.string().trim().min(1).max(200).optional(),
    webhook: z.object({ url: z.url() }).optional(),
  })
  .superRefine((request, ctx) => {
    if (request.country !== undefined && !request.premiumProxy)
      ctx.addIssue({
        code: "custom",
        path: ["country"],
        message: "Set premiumProxy to true to use this option",
      });
  })
  .openapi("PrepareExtractorRequest");

export type PrepareExtractorRequest = z.infer<
  typeof prepareExtractorRequestSchema
>;

const fieldSchema = z.object({
  name: z.string(),
  description: z.string(),
  selector: z.string(),
  attribute: z.string().nullable(),
});

const pageTypeSchema = z.object({
  name: z.string(),
  pattern: z.string(),
  itemSelector: z.string().nullable(),
  fields: z.array(fieldSchema),
  fillRate: z.number(),
});

export const extractorSchema = z.object({
  id: z.string(),
  host: z.string(),
  version: z.number().int(),
  pageTypes: z.array(pageTypeSchema),
  createdAt: z.string(),
});

export const extractorListResponseSchema = z
  .object({
    success: z.literal(true),
    extractors: z.array(extractorSchema),
  })
  .openapi("ExtractorList");

export const extractRequestSchema = z
  .object({ url: publicUrlSchema })
  .openapi("ExtractRequest");

export type ExtractRequest = z.infer<typeof extractRequestSchema>;

const extractedRecord = z.record(z.string(), z.string().nullable());

export const extractResponseSchema = z
  .object({
    success: z.literal(true),
    result: z.object({
      url: z.string(),
      statusCode: z.number().int(),
      extractor: z.object({ id: z.string(), version: z.number().int() }),
      pageType: z.string(),
      data: z.union([extractedRecord, z.array(extractedRecord)]),
    }),
  })
  .openapi("ExtractResponse");

export type ExtractResponse = z.infer<typeof extractResponseSchema>;
