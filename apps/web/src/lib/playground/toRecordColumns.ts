export const toRecordColumns = (
  records: Array<Record<string, unknown>>,
): string[] => [...new Set(records.flatMap((record) => Object.keys(record)))];
