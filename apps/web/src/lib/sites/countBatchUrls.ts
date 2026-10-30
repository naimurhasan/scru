import { z } from "zod";

const payloadSchema = z.object({ urls: z.array(z.string()) });

export const countBatchUrls = (payload: unknown): number => {
  const parsed = payloadSchema.safeParse(payload);
  return parsed.success ? parsed.data.urls.length : 0;
};
