import { z } from "zod";

const payloadSchema = z.object({ url: z.string() });

const resultSchema = z.object({
  extractorId: z.string().nullable(),
  version: z.number().nullable(),
  pageTypes: z.array(z.object({ name: z.string() })),
});

export type Preparation = {
  url: string | null;
  summary: string | null;
  extractorId: string | null;
};

const plural = (count: number, word: string) =>
  `${count} ${word}${count === 1 ? "" : "s"}`;

export const describePreparation = ({
  payload,
  result,
}: {
  payload: unknown;
  result: unknown;
}): Preparation => {
  const request = payloadSchema.safeParse(payload);
  const outcome = resultSchema.safeParse(result);
  return {
    url: request.success ? request.data.url : null,
    summary:
      outcome.success && outcome.data.version !== null
        ? `Version ${outcome.data.version}, ${plural(outcome.data.pageTypes.length, "page type")}`
        : null,
    extractorId: outcome.success ? outcome.data.extractorId : null,
  };
};
