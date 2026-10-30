export type ProductLink = {
  key: "fetch" | "extract" | "crawl" | "batch";
  label: string;
  href: string;
  hint: string;
};

export const PRODUCT_LINKS: ProductLink[] = [
  {
    key: "fetch",
    label: "Fetch",
    href: "/dashboard/fetch",
    hint: "Get any page as HTML, Markdown, text or a screenshot",
  },
  {
    key: "extract",
    label: "Extract",
    href: "/dashboard/extract",
    hint: "Get any page of a site as JSON",
  },
  {
    key: "crawl",
    label: "Crawl",
    href: "/dashboard/crawl",
    hint: "Collect every page a site links to",
  },
  {
    key: "batch",
    label: "Batch",
    href: "/dashboard/batch",
    hint: "Send a list of addresses as one job",
  },
];
