export const countRecords = (data: unknown): number => {
  if (Array.isArray(data)) return data.length;
  return data === null || data === undefined ? 0 : 1;
};
