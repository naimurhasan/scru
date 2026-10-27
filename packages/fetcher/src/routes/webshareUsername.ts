import { createHash } from "node:crypto";
import type { RouteRequest } from "../types.ts";

const slotForSession = (sessionId: string, poolSize: number): number =>
  (createHash("sha256").update(sessionId).digest().readUInt32BE(0) % poolSize) +
  1;

export const webshareUsername = (
  username: string,
  poolSize: number,
  { country, sessionId, sticky }: RouteRequest,
  randomSlot: () => number,
): string => {
  if (sessionId) return `${username}-${slotForSession(sessionId, poolSize)}`;
  if (country) return `${username}-${country.toUpperCase()}-rotate`;
  if (sticky) return `${username}-${randomSlot()}`;
  return `${username}-rotate`;
};
