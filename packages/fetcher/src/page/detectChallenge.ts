import type { FetchedPage } from "../types.ts";

export type ChallengeReason =
  | "cloudflare"
  | "akamai"
  | "aws_waf"
  | "perimeterx"
  | "datadome"
  | "captcha"
  | "blocked_status";

const BLOCKED_STATUSES = new Set([403, 429, 503]);

const INTERSTITIALS: ReadonlyArray<readonly [ChallengeReason, RegExp]> = [
  ["cloudflare", /<title>\s*Just a moment\.\.\.\s*<\/title>/i],
  ["akamai", /[?&]bm-verify=|\/_sec\/verify\?provider=interstitial/],
  ["aws_waf", /window\.awsWafCookieDomainList|window\.gokuProps/],
  ["perimeterx", /<title>\s*Robot or human\?\s*<\/title>/i],
];

const MARKERS: ReadonlyArray<readonly [ChallengeReason, RegExp]> = [
  ["cloudflare", /challenges\.cloudflare\.com|cf_chl_opt|cf-chl-/],
  ["datadome", /captcha-delivery\.com/],
  ["captcha", /g-recaptcha|h-captcha|hcaptcha\.com|px-captcha/],
];

const findReason = (
  rules: ReadonlyArray<readonly [ChallengeReason, RegExp]>,
  html: string,
) => rules.find(([, marker]) => marker.test(html))?.[0] ?? null;

export const detectChallenge = ({
  status,
  html,
}: Pick<FetchedPage, "status" | "html">): ChallengeReason | null => {
  const interstitial = findReason(INTERSTITIALS, html);
  if (interstitial) return interstitial;
  if (!BLOCKED_STATUSES.has(status)) return null;
  return findReason(MARKERS, html) ?? "blocked_status";
};
