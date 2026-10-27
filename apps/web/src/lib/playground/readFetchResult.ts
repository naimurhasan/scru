import { z } from "zod";
import { FETCH_OUTPUT_VALUES } from "./fetchOutputs";

const fetchResultSchema = z.object({
  url: z.string(),
  statusCode: z.number(),
  output: z.enum(FETCH_OUTPUT_VALUES).optional(),
  content: z.string().optional(),
  data: z.record(z.string(), z.unknown()).optional(),
});

const successBodySchema = z.object({
  success: z.literal(true),
  result: fetchResultSchema,
});

export type FetchResult = z.infer<typeof fetchResultSchema>;

export const readFetchResult = (body: unknown): FetchResult | null => {
  const parsed = successBodySchema.safeParse(body);
  return parsed.success ? parsed.data.result : null;
};
