export const PRODUCT_KEYS = [
  "fetch",
  "extract",
  "crawl",
  "batch",
  "browser",
] as const;

export type ProductKey = (typeof PRODUCT_KEYS)[number];

export const FETCH_FORMATS = ["md", "html", "txt", "png"] as const;

export type FetchFormat = (typeof FETCH_FORMATS)[number];

export type SceneKey = "sea" | "room" | "office" | "wind" | "port";

export type ShowcaseOutput = {
  file: string;
  status: string;
  lines: string[];
  progress?: number;
};

export type ShowcasePage = {
  url: string;
  title: string;
  subtitle: string;
  figure: string;
  note: string;
  scene: SceneKey;
};

export type ShowcaseProduct = {
  key: ProductKey;
  label: string;
  page: ShowcasePage;
  output: ShowcaseOutput;
  blurb: string;
  href: string;
};

const SHIPMENT: ShowcasePage = {
  url: "cargotrack.io/shipments/48213",
  title: "Shipment 48213",
  subtitle: "Rotterdam → Hamburg",
  figure: "ETA Oct 6",
  note: "In transit",
  scene: "sea",
};

export const FETCH_OUTPUTS: Record<FetchFormat, ShowcaseOutput> = {
  md: {
    file: "page.md",
    status: "200 OK",
    lines: [
      "# Shipment 48213",
      "**ETA Oct 6** · Rotterdam → Hamburg",
      "In transit",
      "",
      "## Overview",
      "Departed Rotterdam, on schedule.",
    ],
  },
  html: {
    file: "page.html",
    status: "200 OK",
    lines: [
      '<article class="shipment">',
      "  <h1>Shipment 48213</h1>",
      '  <p class="route">Rotterdam → Hamburg</p>',
      '  <span class="eta">ETA Oct 6</span>',
      '  <span class="state">In transit</span>',
      "</article>",
    ],
  },
  txt: {
    file: "page.txt",
    status: "200 OK",
    lines: [
      "Shipment 48213",
      "Rotterdam → Hamburg",
      "ETA Oct 6 In transit",
      "",
      "Overview",
      "Departed Rotterdam, on schedule.",
    ],
  },
  png: {
    file: "page.png",
    status: "200 OK",
    lines: [
      "image/png · 1280 × 800",
      "",
      "full page screenshot, ready to save",
    ],
  },
};

export const SHOWCASE_PRODUCTS: ShowcaseProduct[] = [
  {
    key: "fetch",
    label: "Fetch",
    page: SHIPMENT,
    output: FETCH_OUTPUTS.md,
    blurb: "Any page as Markdown, HTML, text or a screenshot.",
    href: "/docs/reference#fetch",
  },
  {
    key: "extract",
    label: "Extract",
    page: {
      url: "riversidehomes.co/listing/2-bed",
      title: "2-bed apartment, Riverside",
      subtitle: "84 m² · 2 bed · 1 bath",
      figure: "$425,000",
      note: "Available",
      scene: "room",
    },
    output: {
      file: "listing.json",
      status: "200 OK",
      lines: [
        "{",
        '  "title": "2-bed apartment, Riverside",',
        '  "area_m2": 84,',
        '  "price": 425000,',
        '  "status": "available"',
        "}",
      ],
    },
    blurb: "Paste a site once, then get any of its pages as JSON.",
    href: "/docs/reference#extract",
  },
  {
    key: "crawl",
    label: "Crawl",
    page: {
      url: "careers.haldenlabs.io/roles/data-engineer",
      title: "Senior Data Engineer",
      subtitle: "Remote · EU",
      figure: "$120k to $150k",
      note: "Full-time",
      scene: "office",
    },
    output: {
      file: "urls.txt",
      status: "done",
      lines: [
        "careers.haldenlabs.io/roles/data-engineer",
        "├ /teams/data",
        "│ ├ /roles/ml-engineer",
        "│ └ /roles/analyst",
        "├ /teams/platform",
        "│ ├ /roles/sre",
        "│ └ /roles/backend",
      ],
    },
    blurb: "Follow a site's links and collect every page it reaches.",
    href: "/docs/reference#crawl",
  },
  {
    key: "batch",
    label: "Batch",
    page: {
      url: "markets.halden.io/quote/HLDN",
      title: "Halden Energy (HLDN)",
      subtitle: "+1.4% today",
      figure: "$86.12",
      note: "Market open",
      scene: "wind",
    },
    output: {
      file: "job b_7f2a",
      status: "done",
      lines: ["pages  16 / 16"],
      progress: 1,
    },
    blurb:
      "A list of addresses as one job. Collect every result when it finishes.",
    href: "/docs/reference#batch",
  },
  {
    key: "browser",
    label: "Browser",
    page: { ...SHIPMENT, scene: "port" },
    output: {
      file: "session.log",
      status: "live",
      lines: [
        "› goto cargotrack.io/shipments/48213",
        "› click photo 2",
        '› click "Track"',
        "✓ tracking live",
      ],
    },
    blurb: "Drive a live session from your own code, click by click.",
    href: "/docs/reference#browser",
  },
];
