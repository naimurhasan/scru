const BEARER = /^Bearer\s+(\S+)$/i;

export const parseBearerToken = (header: string | undefined): string | null =>
  header?.trim().match(BEARER)?.[1] ?? null;
