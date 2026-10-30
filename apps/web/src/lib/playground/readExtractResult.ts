import { z } from "zod";

const extractedRecord = z.record(z.string(), z.string().nullable());

const extractResultSchema = z.object({
  url: z.string(),
  extractor: z.object({ version: z.number() }),
  pageType: z.string(),
  data: z.union([extractedRecord, z.array(extractedRecord)]),
});

const successBodySchema = z.object({
  success: z.literal(true),
  result: extractResultSchema,
});

export type ExtractResult = z.infer<typeof extractResultSchema>;

export const readExtractResult = (body: unknown): ExtractResult | null => {
  const parsed = successBodySchema.safeParse(body);
  return parsed.success ? parsed.data.result : null;
};
