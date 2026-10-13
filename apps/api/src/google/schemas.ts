import { z } from "@hono/zod-openapi";

export const googleSearchRequestSchema = z
  .object({
    query: z
      .string()
      .trim()
      .min(1)
      .max(500)
      .openapi({ example: "best crm tools for small businesses" }),
    country: z
      .string()
      .regex(/^[A-Za-z]{2}$/, "Use a two-letter country code")
      .default("US")
      .transform((code) => code.toUpperCase())
      .openapi({ example: "US" }),
    include: z
      .object({ html: z.boolean().default(false) })
      .default({ html: false }),
  })
  .openapi("GoogleSearchRequest");

export type GoogleSearchRequest = z.infer<typeof googleSearchRequestSchema>;

const organicResultSchema = z.object({
  position: z.number().int(),
  title: z.string(),
  link: z.string(),
  snippet: z.string(),
  page: z.number().int(),
});

const knowledgePanelSchema = z.object({
  title: z.string(),
  subtitle: z.string().nullable(),
  description: z.string().nullable(),
  facts: z.array(z.object({ label: z.string(), value: z.string() })),
});

export const googleSearchResponseSchema = z
  .object({
    success: z.literal(true),
    result: z.object({
      organicResults: z.array(organicResultSchema),
      peopleAlsoAsk: z.array(z.object({ question: z.string() })),
      relatedSearches: z.array(z.object({ query: z.string() })),
      knowledgePanel: knowledgePanelSchema.nullable(),
      html: z.string().optional(),
    }),
  })
  .openapi("GoogleSearchResponse");

export type GoogleSearchResponse = z.infer<typeof googleSearchResponseSchema>;

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
