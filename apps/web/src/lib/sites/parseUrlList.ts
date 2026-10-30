export const parseUrlList = (text: string): string[] => [
  ...new Set(
    text
      .split(/\s+/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0),
  ),
];
