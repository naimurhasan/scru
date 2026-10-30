import type { CrawledPage } from "@scru/core";

const ERRORS: Record<string, string> = {
  blocked: "Blocked",
  timeout: "Timed out",
  navigation_failed: "Could not open",
  selector_not_found: "Element not found",
  no_extractor: "Site could not be learned",
};

export const describePageResult = (
  page: Pick<CrawledPage, "error" | "pageType" | "content">,
): string => {
  if (page.error !== null) return ERRORS[page.error] ?? page.error;
  if (page.pageType !== null) return page.pageType;
  if (page.content !== null)
    return `${page.content.length.toLocaleString("en-US")} characters`;
  return "Not covered";
};
