CREATE TABLE "heatmap_clicks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" text NOT NULL,
	"session_id" text NOT NULL,
	"url" text NOT NULL,
	"grid_x" integer NOT NULL,
	"grid_y" integer NOT NULL,
	"x_norm" numeric(5, 4) NOT NULL,
	"y_norm" numeric(5, 4) NOT NULL,
	"page_x" integer,
	"page_y" integer,
	"selector" text,
	"tag_name" text,
	"element_text_hash" text,
	"screen_class" text,
	"layout_hash" text,
	"page_width" integer,
	"page_height" integer,
	"viewport_width" integer,
	"viewport_height" integer,
	"count" integer DEFAULT 1 NOT NULL,
	"last_click_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rrweb_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" text NOT NULL,
	"replay_id" text NOT NULL,
	"event_id" text NOT NULL,
	"project_id" text NOT NULL,
	"client_id" text NOT NULL,
	"user_id" text,
	"timestamp" timestamp with time zone NOT NULL,
	"url" text NOT NULL,
	"referrer" text,
	"rrweb_payload" jsonb NOT NULL,
	"schema_version" text NOT NULL,
	"page_width" integer,
	"page_height" integer,
	"viewport_width" integer,
	"viewport_height" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "rrweb_events_event_id_unique" UNIQUE("event_id")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"client_id" text NOT NULL,
	"user_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
