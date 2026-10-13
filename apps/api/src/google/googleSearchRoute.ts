import { createRoute } from "@hono/zod-openapi";
import {
  errorResponseSchema,
  googleSearchRequestSchema,
  googleSearchResponseSchema,
} from "./schemas.ts";

const errorResponse = (description: string) => ({
  description,
  content: { "application/json": { schema: errorResponseSchema } },
});

export const googleSearchRoute = createRoute({
  method: "post",
  path: "/v1/monitor/google",
  summary: "Search Google and get the results as JSON",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      required: true,
      content: { "application/json": { schema: googleSearchRequestSchema } },
    },
  },
  responses: {
    200: {
      description: "Parsed search results",
      content: { "application/json": { schema: googleSearchResponseSchema } },
    },
    400: errorResponse("The request body is invalid"),
    401: errorResponse("The API key is missing, invalid or revoked"),
    403: errorResponse("The workspace does not have enough credits"),
    502: errorResponse("Google could not be fetched; nothing was charged"),
    504: errorResponse(
      "The search did not finish in time; nothing was charged",
    ),
  },
});
