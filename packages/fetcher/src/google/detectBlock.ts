import type { FetchedPage } from "../types.ts";

export type BlockReason = "captcha" | "http_error" | "unexpected_page";

const isCaptcha = ({ url, html }: FetchedPage) =>
  url.includes("/sorry/") || html.includes('id="captcha-form"');

export const detectBlock = (page: FetchedPage): BlockReason | null => {
  if (isCaptcha(page)) return "captcha";
  if (page.status >= 400) return "http_error";
  if (!page.html.includes('id="search"')) return "unexpected_page";
  return null;
};
