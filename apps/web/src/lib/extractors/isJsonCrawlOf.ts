import { z } from "zod";

const payloadSchema = z.object({ url: z.url(), output: z.literal("json") });

export const isJsonCrawlOf = (payload: unknown, host: string): boolean => {
  const parsed = payloadSchema.safeParse(payload);
  return parsed.success && new URL(parsed.data.url).hostname === host;
};
