const SECOND = 1_000;

export const formatDuration = (milliseconds: number): string =>
  milliseconds < SECOND
    ? `${Math.round(milliseconds)} ms`
    : `${(milliseconds / SECOND).toFixed(1)} s`;
