ALTER TABLE "user_daily_activity" DROP CONSTRAINT "user_daily_activity_pk";--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_project_distinct_id_key";--> statement-breakpoint
DROP INDEX "user_daily_activity_project_date_idx";--> statement-breakpoint
DROP INDEX "user_daily_activity_project_distinct_idx";--> statement-breakpoint
DROP INDEX "users_project_first_seen_idx";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "country" text;