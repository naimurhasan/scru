import { createHash, timingSafeEqual } from "node:crypto";

const digest = (value: string) => createHash("sha256").update(value).digest();

export const isSameSecret = (given: string, expected: string): boolean =>
  timingSafeEqual(digest(given), digest(expected));
