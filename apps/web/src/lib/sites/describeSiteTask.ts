import { z } from "zod";

const payloadSchema = z.union([
  z.object({ urls: z.array(z.string()) }),
  z.object({ url: z.string() }),
]);

export const describeSiteTask = (payload: unknown): string => {
  const parsed = payloadSchema.safeParse(payload);
  if (!parsed.success) return "—";
  if ("urls" in parsed.data)
    return `${parsed.data.urls.length} address${parsed.data.urls.length === 1 ? "" : "es"}`;
  return parsed.data.url;
};
