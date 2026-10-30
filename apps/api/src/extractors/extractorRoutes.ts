import { createRoute } from "@hono/zod-openapi";
import { errorResponse } from "../errors/errorResponse.ts";
import { taskResponseSchema } from "../tasks/schemas.ts";
import {
  extractorListResponseSchema,
  extractPreparingResponseSchema,
  extractRequestSchema,
  extractResponseSchema,
  prepareExtractorRequestSchema,
} from "./schemas.ts";

export const prepareExtractorRoute = createRoute({
  method: "post",
  path: "/v1/extractors",
  summary: "Study a site and build an extractor for its pages",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      required: true,
      content: {
        "application/json": { schema: prepareExtractorRequestSchema },
      },
    },
  },
  responses: {
    202: {
      description: "The preparation was queued as a task",
      content: { "application/json": { schema: taskResponseSchema } },
    },
    400: errorResponse("The request is invalid"),
    401: errorResponse("The API key is missing, invalid or revoked"),
    403: errorResponse("The workspace does not have enough credits"),
    409: errorResponse("A task with this idempotency key already exists"),
    429: errorResponse("The rate limit was reached"),
  },
});

export const listExtractorsRoute = createRoute({
  method: "get",
  path: "/v1/extractors",
  summary: "List the workspace's extractors, newest first",
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Extractors with their page types and fields",
      content: { "application/json": { schema: extractorListResponseSchema } },
    },
    401: errorResponse("The API key is missing, invalid or revoked"),
    429: errorResponse("The rate limit was reached"),
  },
});

export const extractRoute = createRoute({
  method: "post",
  path: "/v1/extract",
  summary: "Fetch a page and return its data with the site's extractor",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      required: true,
      content: { "application/json": { schema: extractRequestSchema } },
    },
  },
  responses: {
    200: {
      description: "The page's data",
      content: { "application/json": { schema: extractResponseSchema } },
    },
    202: {
      description:
        "The site has no extractor yet, so one is being prepared; send the request again once the task completes",
      content: {
        "application/json": { schema: extractPreparingResponseSchema },
      },
    },
    400: errorResponse("The request is invalid"),
    401: errorResponse("The API key is missing, invalid or revoked"),
    403: errorResponse("The workspace does not have enough credits"),
    404: errorResponse(
      "None of the site's page types fit the page; nothing was charged",
    ),
    429: errorResponse("The rate or concurrency limit was reached"),
    502: errorResponse("The page could not be fetched; nothing was charged"),
    504: errorResponse("The page did not load in time; nothing was charged"),
  },
});
