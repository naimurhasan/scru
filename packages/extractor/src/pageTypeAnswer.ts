import type { PageTypeRules } from "@scru/parser";
import { z } from "zod";

const fieldName = z
  .string()
  .trim()
  .min(1)
  .max(60)
  .transform((name) => name.replace(/[^\w]+/g, "_").toLowerCase());

export const pageTypeAnswerSchema = z.object({
  name: fieldName,
  itemSelector: z
    .string()
    .trim()
    .max(300)
    .nullable()
    .transform((selector) => (selector ? selector : null)),
  fields: z
    .array(
      z.object({
        name: fieldName,
        description: z.string().trim().max(300).default(""),
        selector: z.string().trim().max(300),
        attribute: z
          .string()
          .trim()
          .max(60)
          .nullable()
          .default(null)
          .transform((attribute) => (attribute ? attribute : null)),
      }),
    )
    .min(1)
    .max(20),
});

export type PageTypeAnswer = PageTypeRules & { name: string };

export const readPageTypeAnswer = (answer: unknown): PageTypeAnswer | null => {
  const parsed = pageTypeAnswerSchema.safeParse(answer);
  if (!parsed.success) return null;
  const seen = new Set<string>();
  const fields = parsed.data.fields.filter(({ name, selector }) => {
    if (!selector || seen.has(name)) return false;
    seen.add(name);
    return true;
  });
  return fields.length > 0 ? { ...parsed.data, fields } : null;
};
