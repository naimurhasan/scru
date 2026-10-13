import { sql } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./authSchema.ts";

const DEFAULT_CONCURRENCY_LIMIT = 2;

const createdAt = () =>
  timestamp("created_at", { withTimezone: true }).notNull().defaultNow();

const moment = (name: string) => timestamp(name, { withTimezone: true });

export const workspaces = pgTable("workspaces", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  credits: integer("credits").notNull().default(0),
  concurrencyLimit: integer("concurrency_limit")
    .notNull()
    .default(DEFAULT_CONCURRENCY_LIMIT),
  webhookUrl: text("webhook_url"),
  webhookSecret: text("webhook_secret")
    .notNull()
    .default(
      sql`'whsec_' || replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '')`,
    ),
  ownerId: text("owner_id")
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: createdAt(),
});

export const apiKeys = pgTable("api_keys", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  keyHash: text("key_hash").notNull().unique(),
  keyPreview: text("key_preview").notNull(),
  createdAt: createdAt(),
  revokedAt: moment("revoked_at"),
});

export const requestLogs = pgTable(
  "request_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    apiKeyId: uuid("api_key_id").references(() => apiKeys.id, {
      onDelete: "set null",
    }),
    engine: text("engine").notNull(),
    request: jsonb("request").notNull(),
    response: jsonb("response"),
    httpStatus: integer("http_status").notNull(),
    errorCode: text("error_code"),
    creditsCharged: integer("credits_charged").notNull().default(0),
    durationMs: integer("duration_ms").notNull(),
    createdAt: createdAt(),
  },
  (table) => [
    index("request_logs_workspace_created_idx").on(
      table.workspaceId,
      table.createdAt,
    ),
  ],
);

export const tasks = pgTable(
  "tasks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    apiKeyId: uuid("api_key_id").references(() => apiKeys.id, {
      onDelete: "set null",
    }),
    taskType: text("task_type").notNull(),
    status: text("status").notNull().default("QUEUED"),
    priority: integer("priority").notNull().default(1),
    idempotencyKey: text("idempotency_key"),
    payload: jsonb("payload").notNull(),
    result: jsonb("result"),
    errorCode: text("error_code"),
    errorMessage: text("error_message"),
    creditsCharged: integer("credits_charged").notNull().default(0),
    webhookUrl: text("webhook_url"),
    createdAt: createdAt(),
    startedAt: moment("started_at"),
    completedAt: moment("completed_at"),
  },
  (table) => [
    index("tasks_workspace_created_idx").on(table.workspaceId, table.createdAt),
    uniqueIndex("tasks_workspace_idempotency_idx").on(
      table.workspaceId,
      table.idempotencyKey,
    ),
  ],
);

export const webhookDeliveries = pgTable(
  "webhook_deliveries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    taskId: uuid("task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    event: text("event").notNull(),
    status: text("status").notNull().default("pending"),
    attempts: integer("attempts").notNull().default(0),
    httpStatus: integer("http_status"),
    lastError: text("last_error"),
    createdAt: createdAt(),
    deliveredAt: moment("delivered_at"),
  },
  (table) => [
    index("webhook_deliveries_workspace_created_idx").on(
      table.workspaceId,
      table.createdAt,
    ),
  ],
);
