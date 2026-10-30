import { createRoute } from "@hono/zod-openapi";
import {
  crawlPagesQuerySchema,
  crawlPagesResponseSchema,
} from "../crawl/schemas.ts";
import { errorResponse } from "../errors/errorResponse.ts";
import { taskParamsSchema, taskResponseSchema } from "../tasks/schemas.ts";
import { batchRequestSchema, batchStatusResponseSchema } from "./schemas.ts";

export const submitBatchRoute = createRoute({
  method: "post",
  path: "/v1/batch",
  summary: "Fetch a list of addresses as one background job",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      required: true,
      content: { "application/json": { schema: batchRequestSchema } },
    },
  },
  responses: {
    202: {
      description: "The batch was queued as a task",
      content: { "application/json": { schema: taskResponseSchema } },
    },
    400: errorResponse("The request is invalid"),
    401: errorResponse("The API key is missing, invalid or revoked"),
    403: errorResponse("The workspace cannot cover every address of the batch"),
    409: errorResponse("A task with this idempotency key already exists"),
    429: errorResponse("The rate limit was reached"),
  },
});

export const batchStatusRoute = createRoute({
  method: "get",
  path: "/v1/batch/{taskId}",
  summary: "Show a batch and how many of its addresses are done",
  security: [{ bearerAuth: [] }],
  request: { params: taskParamsSchema },
  responses: {
    200: {
      description: "The batch task and its progress",
      content: { "application/json": { schema: batchStatusResponseSchema } },
    },
    401: errorResponse("The API key is missing, invalid or revoked"),
    404: errorResponse("No batch with this id belongs to the workspace"),
    429: errorResponse("The rate limit was reached"),
  },
});

export const batchPagesRoute = createRoute({
  method: "get",
  path: "/v1/batch/{taskId}/pages",
  summary: "List the results a batch has collected so far",
  security: [{ bearerAuth: [] }],
  request: { params: taskParamsSchema, query: crawlPagesQuerySchema },
  responses: {
    200: {
      description: "Results in the order the addresses were sent",
      content: { "application/json": { schema: crawlPagesResponseSchema } },
    },
    400: errorResponse("The request is invalid"),
    401: errorResponse("The API key is missing, invalid or revoked"),
    404: errorResponse("No batch with this id belongs to the workspace"),
    429: errorResponse("The rate limit was reached"),
  },
});
