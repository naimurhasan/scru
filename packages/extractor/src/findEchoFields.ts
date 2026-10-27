import type { ExtractedData, ExtractorField } from "@scru/parser";

const recordsOf = (data: ExtractedData) =>
  Array.isArray(data) ? data : [data];

export const findEchoFields = (
  results: ExtractedData[],
  fields: ExtractorField[],
): string[] => {
  const records = results.flatMap(recordsOf);
  const seen = new Set<string>();
  return fields.flatMap(({ name }) => {
    const signature = JSON.stringify(records.map((record) => record[name]));
    if (seen.has(signature)) return [name];
    seen.add(signature);
    return [];
  });
};
