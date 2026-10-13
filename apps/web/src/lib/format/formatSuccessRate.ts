export const formatSuccessRate = (succeeded: number, total: number): string =>
  total === 0 ? "—" : `${Math.round((succeeded / total) * 100)}%`;
