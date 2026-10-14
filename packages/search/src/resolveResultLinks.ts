import type { GoogleSearchResult } from "@scru/parser";

const GOOGLE_HOSTS = new Set(["www.google.com", "google.com"]);
const REDIRECT_PATHS = new Set(["/goto", "/url"]);

export const isGoogleRedirect = (link: string): boolean => {
  if (!URL.canParse(link)) return false;
  const url = new URL(link);
  return GOOGLE_HOSTS.has(url.hostname) && REDIRECT_PATHS.has(url.pathname);
};

export const resolveResultLinks = async (
  result: GoogleSearchResult,
  resolve: (link: string) => Promise<string | null>,
): Promise<GoogleSearchResult> => ({
  ...result,
  organicResults: await Promise.all(
    result.organicResults.map(async (organic) => {
      if (!isGoogleRedirect(organic.link)) return organic;
      const destination = await resolve(organic.link).catch(() => null);
      return destination ? { ...organic, link: destination } : organic;
    }),
  ),
});
