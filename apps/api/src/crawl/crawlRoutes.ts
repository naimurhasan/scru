import { createRoute } from "@hono/zod-openapi";
import { errorResponse } from "../errors/errorResponse.ts";
import { taskParamsSchema, taskResponseSchema } from "../tasks/schemas.ts";
import {
  crawlPagesQuerySchema,
  crawlPagesResponseSchema,
  crawlRequestSchema,
} from "./schemas.ts";

export const submitCrawlRoute = createRoute({
  method: "post",
  path: "/v1/crawl",
  summary: "Crawl a site in the background and collect its pages",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      required: true,
      content: { "application/json": { schema: crawlRequestSchema } },
    },
  },
  responses: {
    202: {
      description: "The crawl was queued as a task",
      content: { "application/json": { schema: taskResponseSchema } },
    },
    400: errorResponse("The request is invalid"),
    401: errorResponse("The API key is missing, invalid or revoked"),
    403: errorResponse("The workspace cannot cover every page of the crawl"),
    409: errorResponse("A task with this idempotency key already exists"),
    429: errorResponse("The rate limit was reached"),
  },
});

export const crawlPagesRoute = createRoute({
  method: "get",
  path: "/v1/crawl/{taskId}/pages",
  summary: "List the pages a crawl has collected so far",
  security: [{ bearerAuth: [] }],
  request: { params: taskParamsSchema, query: crawlPagesQuerySchema },
  responses: {
    200: {
      description: "Pages in the order they were visited",
      content: { "application/json": { schema: crawlPagesResponseSchema } },
    },
    400: errorResponse("The request is invalid"),
    401: errorResponse("The API key is missing, invalid or revoked"),
    404: errorResponse("No crawl with this id belongs to the workspace"),
    429: errorResponse("The rate limit was reached"),
  },
});
