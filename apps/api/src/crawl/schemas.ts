import { z } from "@hono/zod-openapi";
import { extractedDataSchema } from "../extractors/schemas.ts";
import { publicUrlSchema } from "../fetch/schemas.ts";
import { requirePremiumForCountry, siteJobShape } from "./siteJobSchema.ts";

const MAX_DEPTH = 5;
const MAX_PAGES = 500;
const MAX_PATTERNS = 20;
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
    ...siteJobShape,
  })
  .superRefine(requirePremiumForCountry)
  .openapi("CrawlRequest");

export type CrawlRequest = z.infer<typeof crawlRequestSchema>;

export const crawlPagesQuerySchema = z.object({
  after: z.coerce.number().int().min(-1).default(-1),
  limit: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(20),
});

export const crawledPageSchema = z.object({
  position: z.number().int(),
  url: z.string(),
  depth: z.number().int(),
  statusCode: z.number().int().nullable(),
  content: z.string().nullable(),
  pageType: z.string().nullable(),
  data: extractedDataSchema.nullable(),
  error: z.string().nullable(),
});

export const crawlPagesResponseSchema = z
  .object({
    success: z.literal(true),
    pages: z.array(crawledPageSchema),
    nextCursor: z.number().int().nullable(),
  })
  .openapi("CrawlPagesResponse");
