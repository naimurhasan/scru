import type { ExtractorField, PageType } from "./types";

const toFieldName = (name: string) =>
  name
    .trim()
    .replace(/[^\w]+/g, "_")
    .toLowerCase();

const cleanField = ({
  name,
  description,
  selector,
  attribute,
}: ExtractorField): ExtractorField => ({
  name: toFieldName(name),
  description: description.trim(),
  selector: selector.trim(),
  attribute: attribute?.trim() ? attribute.trim() : null,
});

const hasDuplicateNames = (fields: ExtractorField[]) =>
  new Set(fields.map(({ name }) => name)).size !== fields.length;

export type FieldEdits =
  { ok: true; pageTypes: PageType[] } | { ok: false; error: string };

export const applyFieldEdits = (
  pageTypes: PageType[],
  fieldsByPageType: ExtractorField[][],
): FieldEdits => {
  if (fieldsByPageType.length !== pageTypes.length)
    return { ok: false, error: "The extractor changed. Reload the page." };
  const cleaned = fieldsByPageType.map((fields) => fields.map(cleanField));
  if (cleaned.some((fields) => fields.length === 0))
    return { ok: false, error: "Each page type needs at least one field." };
  if (cleaned.some((fields) => fields.some(({ name }) => name === "")))
    return { ok: false, error: "Every field needs a name." };
  if (cleaned.some(hasDuplicateNames))
    return { ok: false, error: "Field names must be unique in a page type." };
  return {
    ok: true,
    pageTypes: pageTypes.map((pageType, index) => ({
      ...pageType,
      fields: cleaned[index] ?? [],
    })),
  };
};
