import { createRoute } from "@hono/zod-openapi";
import { errorResponse } from "../errors/errorResponse.ts";
import { taskParamsSchema, taskResponseSchema } from "./schemas.ts";

export const getTaskRoute = createRoute({
  method: "get",
  path: "/v1/async/task/{taskId}",
  summary: "Get the status and result of a task",
  security: [{ bearerAuth: [] }],
  request: { params: taskParamsSchema },
  responses: {
    200: {
      description: "The task",
      content: { "application/json": { schema: taskResponseSchema } },
    },
    400: errorResponse("The task id is not valid"),
    401: errorResponse("The API key is missing, invalid or revoked"),
    404: errorResponse("No task with this id belongs to the workspace"),
    429: errorResponse("The rate limit was reached"),
  },
});
