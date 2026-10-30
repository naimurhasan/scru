export type DocField = {
  name: string;
  type: string;
  description: string;
};

export const SEARCH_REQUEST_FIELDS: DocField[] = [
  {
    name: "query",
    type: "string, required",
    description: "What to search for, up to 500 characters.",
  },
  {
    name: "country",
    type: "string",
    description: "Two-letter country code for the results. Defaults to US.",
  },
  {
    name: "pages",
    type: "integer, 1–10",
    description:
      "How many result pages to fetch. Defaults to 1. Each extra page costs 2 credits.",
  },
  {
    name: "resolveLinks",
    type: "boolean",
    description:
      "Return each result's real address. Defaults to true. Set false for a faster answer with Google redirect links instead.",
  },
  {
    name: "include.html",
    type: "boolean",
    description: "Also return the raw HTML of the first page.",
  },
];

export const SEARCH_RESULT_FIELDS: DocField[] = [
  {
    name: "organicResults[]",
    type: "array",
    description:
      "position, title, link, snippet and page for every organic result, numbered across pages.",
  },
  {
    name: "peopleAlsoAsk[]",
    type: "array",
    description: "The questions Google shows under People also ask.",
  },
  {
    name: "relatedSearches[]",
    type: "array",
    description: "The queries Google suggests at the bottom of the page.",
  },
  {
    name: "knowledgePanel",
    type: "object or null",
    description:
      "title, subtitle, description and facts when Google shows a panel.",
  },
  {
    name: "html",
    type: "string",
    description: "Only when include.html is true.",
  },
];

export const TASK_REQUEST_FIELDS: DocField[] = [
  {
    name: "taskType",
    type: "string, required",
    description: "GOOGLE is the only type today.",
  },
  {
    name: "payload",
    type: "object, required",
    description: "The same body as the Google search endpoint.",
  },
  {
    name: "priority",
    type: "integer, 1–10",
    description: "Higher runs first. Defaults to 1.",
  },
  {
    name: "idempotencyKey",
    type: "string",
    description:
      "Send the same key twice and the second request is refused with 409, so a retry never runs a search twice.",
  },
  {
    name: "webhook.url",
    type: "string",
    description:
      "Where to send the finished task. Falls back to the endpoint set on the Webhooks page.",
  },
];

export const ERROR_CODES: DocField[] = [
  {
    name: "VALIDATION_ERROR",
    type: "400",
    description:
      "The body or a parameter is invalid. details lists each field.",
  },
  {
    name: "UNAUTHORIZED",
    type: "401",
    description: "The key is missing, wrong or revoked.",
  },
  {
    name: "INSUFFICIENT_CREDITS",
    type: "403",
    description:
      "The balance does not cover the request. details.required says how much it needs.",
  },
  {
    name: "NOT_FOUND",
    type: "404",
    description: "No such route, or no task with that id in your workspace.",
  },
  {
    name: "CONFLICT",
    type: "409",
    description: "A task with this idempotency key already exists.",
  },
  {
    name: "RATE_LIMITED",
    type: "429",
    description: "More requests this second than your limit. Retry shortly.",
  },
  {
    name: "CONCURRENCY_LIMIT_REACHED",
    type: "429",
    description:
      "Too many sync searches in progress. Wait for one to finish or use an async task.",
  },
  {
    name: "INTERNAL_ERROR",
    type: "500",
    description: "Something failed on our side.",
  },
  {
    name: "FETCH_FAILED",
    type: "502",
    description:
      "The page or results could not be fetched. details.reason says why, for example blocked or selector_not_found. Nothing is charged.",
  },
  {
    name: "TIMEOUT",
    type: "504",
    description: "The request took too long. Nothing is charged.",
  },
];

export const LIMIT_HEADERS: DocField[] = [
  {
    name: "X-RateLimit-Limit",
    type: "every request",
    description: "Requests allowed per second.",
  },
  {
    name: "X-RateLimit-Remaining",
    type: "every request",
    description: "Requests left in the current second.",
  },
  {
    name: "X-Concurrency-Limit",
    type: "sync search",
    description: "Sync searches allowed at the same time.",
  },
  {
    name: "X-Concurrency-Remaining",
    type: "sync search",
    description: "Free slots after this request started.",
  },
  {
    name: "X-Credits-Charged",
    type: "sync search",
    description: "Credits this request cost.",
  },
  {
    name: "X-Credits-Remaining",
    type: "sync search",
    description: "Balance after this request.",
  },
];

export const FETCH_REQUEST_FIELDS: DocField[] = [
  {
    name: "url",
    type: "string, required",
    description: "The page to fetch. Must be a public http or https address.",
  },
  {
    name: "output",
    type: "string",
    description:
      "html (default), markdown, text or screenshot. A screenshot is a base64 PNG of the full page.",
  },
  {
    name: "jsRender",
    type: "boolean",
    description:
      "Run the page's JavaScript before reading it. Needed for pages that build their content in the page, and for screenshots, waitFor, wait and jsInstructions.",
  },
  {
    name: "waitFor",
    type: "string",
    description:
      "CSS selector to wait for before reading the page. Fails with selector_not_found if it never appears.",
  },
  {
    name: "wait",
    type: "integer, 0–30000",
    description: "Extra milliseconds to wait before reading the page.",
  },
  {
    name: "jsInstructions",
    type: "array, up to 20",
    description:
      "Steps to run on the page before it is read, such as filling a search box and pressing Enter. See Page instructions.",
  },
  {
    name: "cssExtractor",
    type: "object",
    description:
      'Field name to CSS selector. Add " @attribute" to read an attribute, for example "a.product @href". Returns data instead of content.',
  },
  {
    name: "premiumProxy",
    type: "boolean",
    description: "Send the request from another address.",
  },
  {
    name: "country",
    type: "string",
    description: "Two-letter country code for the address. Needs premiumProxy.",
  },
  {
    name: "sessionId",
    type: "string",
    description:
      "Requests with the same session id use the same address. Needs premiumProxy; cannot be combined with country.",
  },
  {
    name: "blockResources",
    type: "boolean",
    description:
      "Skip images, fonts and media for a faster answer. Defaults to true.",
  },
];

export const FETCH_RESULT_FIELDS: DocField[] = [
  {
    name: "url",
    type: "string",
    description: "The final address, after any redirects.",
  },
  {
    name: "statusCode",
    type: "integer",
    description: "The status the site answered with.",
  },
  {
    name: "output, content",
    type: "string",
    description: "The page in the requested output.",
  },
  {
    name: "data",
    type: "object",
    description:
      "With cssExtractor: each field's text, or a list when several elements match.",
  },
  {
    name: "instructions[]",
    type: "array",
    description:
      "With jsInstructions: each step with ok, durationMs and error. A failed step does not fail the request.",
  },
];

export const FETCH_INSTRUCTIONS: DocField[] = [
  { name: "click", type: "selector", description: "Click an element." },
  {
    name: "fill",
    type: "{ selector, value }",
    description: "Type a value into a field.",
  },
  {
    name: "select",
    type: "{ selector, value }",
    description: "Choose an option in a select box.",
  },
  {
    name: "press",
    type: "key",
    description: "Press a key, for example Enter or Tab.",
  },
  { name: "wait", type: "milliseconds", description: "Pause." },
  {
    name: "waitFor",
    type: "selector",
    description: "Wait until an element appears.",
  },
  {
    name: "scrollY",
    type: "pixels",
    description: "Scroll down, or up with a negative number.",
  },
];

export const FETCH_PRICES: DocField[] = [
  {
    name: "Plain",
    type: "1 credit",
    description: "The page as the site sends it.",
  },
  {
    name: "jsRender",
    type: "5 credits",
    description: "The page after its JavaScript has run.",
  },
  {
    name: "premiumProxy",
    type: "10 credits",
    description: "Sent from another address.",
  },
  {
    name: "jsRender + premiumProxy",
    type: "25 credits",
    description: "Both. Failed requests are always free.",
  },
];

export const CRAWL_REQUEST_FIELDS: DocField[] = [
  {
    name: "url",
    type: "string, required",
    description:
      "Where the crawl starts. Only links on the same host are followed.",
  },
  {
    name: "maxDepth",
    type: "integer, 0–5",
    description:
      "How many links away from the start page to go. Defaults to 2; 0 fetches only the start page.",
  },
  {
    name: "limit",
    type: "integer, 1–500",
    description: "The most pages to fetch. Defaults to 50.",
  },
  {
    name: "include[] / exclude[]",
    type: "path patterns",
    description:
      'Only follow paths that match include and none of exclude. * matches anything, for example "/catalogue/*".',
  },
  {
    name: "output",
    type: "string",
    description:
      "html (default), markdown or text for each page, or json to read every page with the site's extractor. A site with no extractor yet is prepared first.",
  },
  {
    name: "jsRender, blockResources, premiumProxy, country",
    type: "as in Fetch",
    description: "Applied to every page of the crawl.",
  },
  {
    name: "priority, idempotencyKey, webhook.url",
    type: "as in Async tasks",
    description:
      "A crawl is a task, so it queues, polls and notifies the same way.",
  },
];

export const CRAWL_PAGE_FIELDS: DocField[] = [
  {
    name: "position",
    type: "integer",
    description:
      "Order of the visit, from 0. Pass the last one as after to read on.",
  },
  {
    name: "url, depth",
    type: "string, integer",
    description:
      "The page and how many links away from the start it was found.",
  },
  {
    name: "statusCode, content",
    type: "integer, string",
    description: "What the site answered, in the requested output.",
  },
  {
    name: "pageType, data",
    type: "string, object or array",
    description:
      "With output json: which page type fit the page and its records, as in Extract. Both are null for a page no page type fits.",
  },
  {
    name: "error",
    type: "string or null",
    description: "Why a page could not be fetched. Failed pages are free.",
  },
];

export const EXTRACTOR_REQUEST_FIELDS: DocField[] = [
  {
    name: "url",
    type: "string, required",
    description:
      "A page of the site that links to the kinds of pages you want data from, usually the home page or a listing.",
  },
  {
    name: "jsRender, blockResources, premiumProxy, country",
    type: "as in Fetch",
    description:
      "How the site's pages are fetched, both while preparing and every time the extractor runs.",
  },
  {
    name: "priority, idempotencyKey, webhook.url",
    type: "as in Async tasks",
    description:
      "Preparing is a task, so it queues, polls and notifies the same way.",
  },
];

export const EXTRACT_RESULT_FIELDS: DocField[] = [
  {
    name: "pageType",
    type: "string",
    description:
      "Which kind of page it is, for example product_detail. Matched by address first, then by which page type fits the page best.",
  },
  {
    name: "data",
    type: "object or array",
    description:
      "One object for a page about one thing, or one object per item for a list page. Missing values are null; links and images are full addresses.",
  },
  {
    name: "extractor",
    type: "object",
    description: "The id and version that read the page.",
  },
];

export const BATCH_REQUEST_FIELDS: DocField[] = [
  {
    name: "urls",
    type: "string[], 1–1,000, required",
    description: "The pages to fetch. They may come from any sites.",
  },
  {
    name: "output",
    type: "string",
    description:
      "html (default), markdown or text for each page, or json to read each page with its site's extractor. Sites with no extractor yet are prepared first.",
  },
  {
    name: "jsRender, blockResources, premiumProxy, country",
    type: "as in Fetch",
    description: "Applied to every page of the batch.",
  },
  {
    name: "priority, idempotencyKey, webhook.url",
    type: "as in Async tasks",
    description:
      "A batch is a task, so it queues, polls and notifies the same way.",
  },
];
