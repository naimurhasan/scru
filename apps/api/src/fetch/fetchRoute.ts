import { createRoute } from "@hono/zod-openapi";
import { errorResponse } from "../errors/errorResponse.ts";
import {
  fetchQuerySchema,
  fetchRequestSchema,
  fetchResponseSchema,
} from "./schemas.ts";

const responses = {
  200: {
    description: "The page in the requested output",
    content: { "application/json": { schema: fetchResponseSchema } },
  },
  400: errorResponse("The request is invalid"),
  401: errorResponse("The API key is missing, invalid or revoked"),
  403: errorResponse("The workspace does not have enough credits"),
  429: errorResponse("The rate or concurrency limit was reached"),
  502: errorResponse("The page could not be fetched; nothing was charged"),
  504: errorResponse("The page did not load in time; nothing was charged"),
};

const summary = "Fetch any page as HTML, Markdown, text, a screenshot or JSON";

export const fetchRoute = createRoute({
  method: "post",
  path: "/v1/fetch",
  summary,
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      required: true,
      content: { "application/json": { schema: fetchRequestSchema } },
    },
  },
  responses,
});

export const fetchQueryRoute = createRoute({
  method: "get",
  path: "/v1/fetch",
  summary: `${summary}, with the options as query parameters`,
  security: [{ bearerAuth: [] }],
  request: { query: fetchQuerySchema },
  responses,
});
