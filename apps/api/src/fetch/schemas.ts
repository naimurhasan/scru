import { z } from "@hono/zod-openapi";
import { FETCH_OUTPUTS, isPublicUrl } from "@scru/core";
import { isValidExtractorRule } from "@scru/parser";

const MAX_WAIT_MS = 30_000;
const MAX_EXTRACTOR_FIELDS = 50;
const MAX_INSTRUCTIONS = 20;
const MAX_SCROLL_PX = 50_000;

const NEEDS_JS_RENDER = "Set jsRender to true to use this option";
const NEEDS_PREMIUM_PROXY = "Set premiumProxy to true to use this option";

const extractorSchema = z
  .record(
    z.string().trim().min(1).max(100),
    z
      .string()
      .trim()
      .max(500)
      .refine(isValidExtractorRule, "Use a valid CSS selector"),
  )
  .refine(
    (extractor) => Object.keys(extractor).length <= MAX_EXTRACTOR_FIELDS,
    `Use at most ${MAX_EXTRACTOR_FIELDS} fields`,
  )
  .openapi({ example: { title: "h1", links: "a.product @href" } });

export const countrySchema = z
  .string()
  .regex(/^[A-Za-z]{2}$/, "Use a two-letter country code")
  .transform((code) => code.toUpperCase())
  .openapi({ example: "US" });

export const publicUrlSchema = z
  .url({ protocol: /^https?$/ })
  .refine(isPublicUrl, "Use a public http or https address")
  .openapi({ example: "https://books.toscrape.com/" });

const selector = z.string().trim().min(1).max(500);
const fieldValue = z.object({ selector, value: z.string().max(2_000) });

const instructionSchema = z.union([
  z.strictObject({ click: selector }),
  z.strictObject({ fill: fieldValue }),
  z.strictObject({ select: fieldValue }),
  z.strictObject({ press: z.string().trim().min(1).max(50) }),
  z.strictObject({ wait: z.number().int().min(0).max(MAX_WAIT_MS) }),
  z.strictObject({ waitFor: selector }),
  z.strictObject({
    scrollY: z.number().int().min(-MAX_SCROLL_PX).max(MAX_SCROLL_PX),
  }),
]);

export const fetchRequestSchema = z
  .object({
    url: publicUrlSchema,
    jsRender: z.boolean().default(false),
    jsInstructions: z
      .array(instructionSchema)
      .max(MAX_INSTRUCTIONS)
      .default([])
      .openapi({
        example: [
          { fill: { selector: "#search", value: "lamp" } },
          { press: "Enter" },
          { waitFor: ".results" },
        ],
      }),
    waitFor: selector.optional(),
    wait: z.number().int().min(0).max(MAX_WAIT_MS).default(0),
    output: z.enum(FETCH_OUTPUTS).default("html"),
    cssExtractor: extractorSchema.optional(),
    blockResources: z.boolean().default(true),
    premiumProxy: z.boolean().default(false),
    country: countrySchema.optional(),
    sessionId: z
      .string()
      .trim()
      .min(1)
      .max(100)
      .optional()
      .openapi({ example: "checkout-42" }),
  })
  .superRefine((request, ctx) => {
    const rules = [
      [
        "jsInstructions",
        request.jsInstructions.length > 0 && !request.jsRender,
        NEEDS_JS_RENDER,
      ],
      [
        "waitFor",
        request.waitFor !== undefined && !request.jsRender,
        NEEDS_JS_RENDER,
      ],
      ["wait", request.wait > 0 && !request.jsRender, NEEDS_JS_RENDER],
      [
        "output",
        request.output === "screenshot" && !request.jsRender,
        NEEDS_JS_RENDER,
      ],
      [
        "country",
        request.country !== undefined && !request.premiumProxy,
        NEEDS_PREMIUM_PROXY,
      ],
      [
        "sessionId",
        request.sessionId !== undefined && !request.premiumProxy,
        NEEDS_PREMIUM_PROXY,
      ],
      [
        "sessionId",
        request.sessionId !== undefined && request.country !== undefined,
        "A session keeps one address, so it cannot be combined with country",
      ],
    ] as const;
    for (const [field, broken, message] of rules)
      if (broken) ctx.addIssue({ code: "custom", path: [field], message });
  })
  .openapi("FetchRequest");

export type FetchRequest = z.infer<typeof fetchRequestSchema>;

export const fetchResultSchema = z.object({
  url: z.string(),
  statusCode: z.number().int(),
  output: z.enum(FETCH_OUTPUTS).optional(),
  content: z.string().optional(),
  data: z
    .record(z.string(), z.union([z.string(), z.array(z.string())]))
    .optional(),
  instructions: z
    .array(
      z.object({
        instruction: instructionSchema,
        ok: z.boolean(),
        durationMs: z.number().int(),
        error: z.string().nullable(),
      }),
    )
    .optional(),
});

export type FetchResult = z.infer<typeof fetchResultSchema>;

export const fetchResponseSchema = z
  .object({
    success: z.literal(true),
    result: fetchResultSchema,
  })
  .openapi("FetchResponse");

export type FetchResponse = z.infer<typeof fetchResponseSchema>;

const queryText = z.string().optional();

export const fetchQuerySchema = z.object({
  url: z.string().openapi({ example: "https://books.toscrape.com/" }),
  jsRender: queryText.openapi({ example: "true" }),
  jsInstructions: queryText.openapi({ description: "JSON array" }),
  waitFor: queryText,
  wait: queryText.openapi({ example: "1000" }),
  output: queryText.openapi({ example: "markdown" }),
  cssExtractor: queryText.openapi({ description: "JSON object" }),
  blockResources: queryText,
  premiumProxy: queryText,
  country: queryText,
  sessionId: queryText,
});
