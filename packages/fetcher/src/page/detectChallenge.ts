import type { FetchedPage } from "../types.ts";

export type ChallengeReason =
  "cloudflare" | "datadome" | "captcha" | "blocked_status";

const BLOCKED_STATUSES = new Set([403, 429, 503]);

const CLOUDFLARE_INTERSTITIAL = /<title>\s*Just a moment\.\.\.\s*<\/title>/i;

const MARKERS: ReadonlyArray<readonly [ChallengeReason, RegExp]> = [
  ["cloudflare", /challenges\.cloudflare\.com|cf_chl_opt|cf-chl-/],
  ["datadome", /captcha-delivery\.com/],
  ["captcha", /g-recaptcha|h-captcha|hcaptcha\.com|px-captcha/],
];

export const detectChallenge = ({
  status,
  html,
}: Pick<FetchedPage, "status" | "html">): ChallengeReason | null => {
  if (CLOUDFLARE_INTERSTITIAL.test(html)) return "cloudflare";
  if (!BLOCKED_STATUSES.has(status)) return null;
  return (
    MARKERS.find(([, marker]) => marker.test(html))?.[0] ?? "blocked_status"
  );
};
