import { z } from "@hono/zod-openapi";
import { googleSearchRequestSchema } from "../google/schemas.ts";

const LOWEST_PRIORITY = 1;
const HIGHEST_PRIORITY = 10;

export const submitTaskRequestSchema = z
  .object({
    taskType: z.literal("GOOGLE").openapi({ example: "GOOGLE" }),
    payload: googleSearchRequestSchema,
    priority: z
      .number()
      .int()
      .min(LOWEST_PRIORITY)
      .max(HIGHEST_PRIORITY)
      .default(LOWEST_PRIORITY),
    idempotencyKey: z.string().trim().min(1).max(200).optional(),
    webhook: z.object({ url: z.url() }).optional(),
  })
  .openapi("SubmitTaskRequest");

export type SubmitTaskRequest = z.infer<typeof submitTaskRequestSchema>;

export const taskParamsSchema = z.object({
  taskId: z.uuid().openapi({ param: { name: "taskId", in: "path" } }),
});

export const taskViewSchema = z.object({
  id: z.string(),
  taskType: z.string(),
  status: z.string().openapi({ example: "QUEUED" }),
  payload: z.unknown(),
  result: z.unknown(),
  error: z.object({ code: z.string(), message: z.string() }).nullable(),
  creditsCharged: z.number().int(),
  createdAt: z.string(),
  startedAt: z.string().nullable(),
  completedAt: z.string().nullable(),
});

export const taskResponseSchema = z
  .object({
    success: z.literal(true),
    task: taskViewSchema,
  })
  .openapi("TaskResponse");
