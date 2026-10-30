import { z } from "@hono/zod-openapi";
import { CRAWL_OUTPUTS } from "@scru/core";
import { countrySchema } from "../fetch/schemas.ts";

const LOWEST_PRIORITY = 1;
const HIGHEST_PRIORITY = 10;

export const siteJobShape = {
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
};

export const requirePremiumForCountry = (
  request: { country?: string; premiumProxy: boolean },
  ctx: z.RefinementCtx,
) => {
  if (request.country !== undefined && !request.premiumProxy)
    ctx.addIssue({
      code: "custom",
      path: ["country"],
      message: "Set premiumProxy to true to use this option",
    });
};
