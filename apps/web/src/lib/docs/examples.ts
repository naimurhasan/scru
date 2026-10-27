export const EXAMPLE_RESPONSE = {
  success: true,
  result: {
    organicResults: [
      {
        position: 1,
        title: "Best CRM Software for Small Business in 2026",
        link: "https://crm.org/crmland/best-crm-for-small-business",
        snippet:
          "CRMs like HubSpot and Zoho Bigin are designed for small teams that want to get moving in under 30 minutes…",
        page: 1,
      },
    ],
    peopleAlsoAsk: [{ question: "What are the top 3 CRM tools?" }],
    relatedSearches: [{ query: "Simple CRM for small business" }],
    knowledgePanel: null,
  },
};

export const EXAMPLE_TASK = {
  success: true,
  task: {
    id: "56664462-f83b-42f5-ba9e-e728ffc60df1",
    taskType: "GOOGLE",
    status: "QUEUED",
    payload: { query: "what is a webhook", country: "US", pages: 1 },
    result: null,
    error: null,
    creditsCharged: 0,
    createdAt: "2026-10-13T12:14:01.776Z",
    startedAt: null,
    completedAt: null,
  },
};

export const buildTaskCurl = (apiUrl: string): string =>
  [
    `curl -X POST ${apiUrl}/v1/async/task \\`,
    `  -H "Authorization: Bearer $SCRU_API_KEY" \\`,
    `  -H "Content-Type: application/json" \\`,
    `  -d '{"taskType":"GOOGLE","payload":{"query":"what is a webhook"},"webhook":{"url":"https://your-app.com/hooks/scru"}}'`,
  ].join("\n");

export const VERIFY_SIGNATURE = `import { createHmac, timingSafeEqual } from "node:crypto";

export const isFromScru = (body: string, header: string, secret: string) => {
  const [, timestamp, signature] =
    header.match(/^t=(\\d+),v1=([0-9a-f]+)$/) ?? [];
  if (!timestamp || !signature) return false;
  const expected = createHmac("sha256", secret)
    .update(\`\${timestamp}.\${body}\`)
    .digest("hex");
  return (
    signature.length === expected.length &&
    timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  );
};`;

export const FETCH_EXAMPLE_BODY = {
  url: "https://books.toscrape.com/",
  cssExtractor: {
    titles: "article.product_pod h3 a @title",
    prices: ".price_color",
  },
};

export const FETCH_EXAMPLE_RESPONSE = {
  success: true,
  result: {
    url: "https://books.toscrape.com/",
    statusCode: 200,
    data: {
      titles: ["A Light in the Attic", "Tipping the Velvet", "Soumission"],
      prices: ["£51.77", "£53.74", "£50.10"],
    },
  },
};

export const FETCH_INSTRUCTIONS_EXAMPLE = [
  { fill: { selector: "#username", value: "demo" } },
  { fill: { selector: "#password", value: "demo" } },
  { click: "input[type=submit]" },
  { waitFor: "a[href='/logout']" },
];

export const buildFetchQuery = (apiUrl: string): string =>
  [
    `curl -G ${apiUrl}/v1/fetch \\`,
    `  -H "Authorization: Bearer $SCRU_API_KEY" \\`,
    `  --data-urlencode "url=https://books.toscrape.com/" \\`,
    `  --data-urlencode "output=markdown"`,
  ].join("\n");

export const CRAWL_EXAMPLE_BODY = {
  url: "https://books.toscrape.com/",
  maxDepth: 1,
  limit: 20,
  include: ["/catalogue/category/*"],
  output: "markdown",
};

export const buildCrawlPagesCurl = (apiUrl: string): string =>
  [
    `curl "${apiUrl}/v1/crawl/$TASK_ID/pages?after=-1&limit=20" \\`,
    `  -H "Authorization: Bearer $SCRU_API_KEY"`,
  ].join("\n");
