import type { ExtractedData, ExtractorField } from "./extractorTypes.ts";

export type FieldFill = Record<string, number>;

const toRecords = (data: ExtractedData) =>
  Array.isArray(data) ? data : [data];

export const measureFill = (
  results: ExtractedData[],
  fields: ExtractorField[],
): FieldFill => {
  const records = results.flatMap(toRecords);
  return Object.fromEntries(
    fields.map(({ name }) => [
      name,
      records.length === 0
        ? 0
        : records.filter((record) => record[name] !== null).length /
          records.length,
    ]),
  );
};

export const averageFill = (fill: FieldFill): number => {
  const rates = Object.values(fill);
  return rates.length === 0
    ? 0
    : rates.reduce((sum, rate) => sum + rate, 0) / rates.length;
};
