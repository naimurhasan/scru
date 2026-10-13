const INDENT = 2;

export const prettyJson = (value: unknown): string =>
  JSON.stringify(value, null, INDENT);
