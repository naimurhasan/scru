import { createRoute } from "@hono/zod-openapi";
import { errorResponse } from "../errors/errorResponse.ts";
import { submitTaskRequestSchema, taskResponseSchema } from "./schemas.ts";

export const submitTaskRoute = createRoute({
  method: "post",
  path: "/v1/async/task",
  summary: "Queue a search and get a task id back immediately",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      required: true,
      content: { "application/json": { schema: submitTaskRequestSchema } },
    },
  },
  responses: {
    202: {
      description: "The task was queued",
      content: { "application/json": { schema: taskResponseSchema } },
    },
    400: errorResponse("The request body is invalid"),
    401: errorResponse("The API key is missing, invalid or revoked"),
    403: errorResponse("The workspace does not have enough credits"),
    409: errorResponse("A task with this idempotency key already exists"),
    429: errorResponse("The rate limit was reached"),
  },
});
