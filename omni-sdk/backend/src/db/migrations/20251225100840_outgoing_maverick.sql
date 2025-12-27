CREATE TABLE "user_daily_activity" (
	"project_id" text NOT NULL,
	"distinct_id" text NOT NULL,
	"activity_date" date NOT NULL,
	"last_activity_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_daily_activity_pk" UNIQUE("project_id","distinct_id","activity_date")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" text NOT NULL,
	"distinct_id" text NOT NULL,
	"first_seen_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_project_distinct_id_key" UNIQUE("project_id","distinct_id")
);
--> statement-breakpoint
CREATE INDEX "user_daily_activity_project_date_idx" ON "user_daily_activity" USING btree ("project_id","activity_date");--> statement-breakpoint
CREATE INDEX "user_daily_activity_project_distinct_idx" ON "user_daily_activity" USING btree ("project_id","distinct_id");--> statement-breakpoint
CREATE INDEX "users_project_first_seen_idx" ON "users" USING btree ("project_id","first_seen_at");