CREATE TABLE "tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"api_key_id" uuid,
	"task_type" text NOT NULL,
	"status" text DEFAULT 'QUEUED' NOT NULL,
	"priority" integer DEFAULT 1 NOT NULL,
	"idempotency_key" text,
	"payload" jsonb NOT NULL,
	"result" jsonb,
	"error_code" text,
	"error_message" text,
	"credits_charged" integer DEFAULT 0 NOT NULL,
	"webhook_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "webhook_deliveries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"task_id" uuid NOT NULL,
	"url" text NOT NULL,
	"event" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"http_status" integer,
	"last_error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"delivered_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "workspaces" ADD COLUMN "concurrency_limit" integer DEFAULT 2 NOT NULL;--> statement-breakpoint
ALTER TABLE "workspaces" ADD COLUMN "webhook_url" text;--> statement-breakpoint
ALTER TABLE "workspaces" ADD COLUMN "webhook_secret" text DEFAULT 'whsec_' || replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '') NOT NULL;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_api_key_id_api_keys_id_fk" FOREIGN KEY ("api_key_id") REFERENCES "public"."api_keys"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webhook_deliveries" ADD CONSTRAINT "webhook_deliveries_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webhook_deliveries" ADD CONSTRAINT "webhook_deliveries_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "tasks_workspace_created_idx" ON "tasks" USING btree ("workspace_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "tasks_workspace_idempotency_idx" ON "tasks" USING btree ("workspace_id","idempotency_key");--> statement-breakpoint
CREATE INDEX "webhook_deliveries_workspace_created_idx" ON "webhook_deliveries" USING btree ("workspace_id","created_at");