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
    description: "The results could not be fetched. Nothing is charged.",
  },
  {
    name: "TIMEOUT",
    type: "504",
    description: "The search took too long. Nothing is charged.",
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
