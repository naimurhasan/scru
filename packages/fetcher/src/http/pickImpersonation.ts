import type { Browser } from "impit";

const CHROME_PROFILES = [
  100, 101, 104, 107, 110, 116, 124, 125, 131, 136, 142, 151,
] as const;

const CHROME_VERSION = /Chrome\/(\d+)/;

export const pickImpersonation = (userAgent: string): Browser => {
  const major = Number(userAgent.match(CHROME_VERSION)?.[1]);
  if (!major) return "chrome";
  const closest = CHROME_PROFILES.filter((version) => version <= major).at(-1);
  return closest ? (`chrome${closest}` as Browser) : "chrome";
};
