CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" text NOT NULL,
	"project_id" text NOT NULL,
	"session_id" text NOT NULL,
	"client_id" text NOT NULL,
	"user_id" text,
	"type" text NOT NULL,
	"timestamp" timestamp with time zone NOT NULL,
	"url" text NOT NULL,
	"referrer" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "events_event_id_unique" UNIQUE("event_id")
);
--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "location" text DEFAULT 'ET' NOT NULL;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "device" text;