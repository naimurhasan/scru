import { z } from "@hono/zod-openapi";
import { CRAWL_OUTPUTS } from "@scru/core";
import { countrySchema, publicUrlSchema } from "../fetch/schemas.ts";

const MAX_DEPTH = 5;
const MAX_PAGES = 500;
const MAX_PATTERNS = 20;
const LOWEST_PRIORITY = 1;
const HIGHEST_PRIORITY = 10;
const MAX_PAGE_SIZE = 50;

const pathPatterns = z
  .array(
    z
      .string()
      .trim()
      .min(1)
      .max(200)
      .regex(/^[/*]/, "Start a pattern with / or *"),
  )
  .max(MAX_PATTERNS)
  .default([]);

export const crawlRequestSchema = z
  .object({
    url: publicUrlSchema,
    maxDepth: z.number().int().min(0).max(MAX_DEPTH).default(2),
    limit: z.number().int().min(1).max(MAX_PAGES).default(50),
    include: pathPatterns.openapi({ example: ["/catalogue/*"] }),
    exclude: pathPatterns.openapi({ example: ["*/page-*"] }),
    output: z.enum(CRAWL_OUTPUTS).default("html"),
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
  .openapi("CrawlRequest");

export type CrawlRequest = z.infer<typeof crawlRequestSchema>;

export const crawlPagesQuerySchema = z.object({
  after: z.coerce.number().int().min(-1).default(-1),
  limit: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(20),
});

export const crawlPagesResponseSchema = z
  .object({
    success: z.literal(true),
    pages: z.array(
      z.object({
        position: z.number().int(),
        url: z.string(),
        depth: z.number().int(),
        statusCode: z.number().int().nullable(),
        content: z.string().nullable(),
        error: z.string().nullable(),
      }),
    ),
    nextCursor: z.number().int().nullable(),
  })
  .openapi("CrawlPagesResponse");
