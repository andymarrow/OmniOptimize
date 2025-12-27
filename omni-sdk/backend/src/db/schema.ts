import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  numeric,
  integer,
  date,
  index,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

/**
 * Sessions table - stores session metadata
 */
export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(), // session_id from SDK
  projectId: text("project_id").notNull(),
  clientId: text("client_id").notNull(),
  userId: text("user_id"),
  location: text("location").default("ET").notNull(), // ISO 2-letter country code
  device: text("device"), // 'mobile' | 'tablet' | 'desktop'
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/**
 * Events table - tracks all event types (rrweb, click, pageview, input, route, custom)
 * Generic event store for accurate event counting across all event sources
 * Note: Detailed event data is stored in specialized tables (rrwebEvents, heatmapClicks)
 */
export const events = pgTable("events", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: text("event_id").notNull().unique(), // from SDK (dedup key)
  projectId: text("project_id").notNull(),
  sessionId: text("session_id").notNull(),
  clientId: text("client_id").notNull(),
  userId: text("user_id"),
  type: text("type").notNull(), // 'rrweb', 'click', 'pageview', 'input', 'route', 'custom', 'session_snapshot'
  timestamp: timestamp("timestamp", { withTimezone: true }).notNull(),
  url: text("url").notNull(),
  referrer: text("referrer"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/**
 * RRweb events table - stores session replay events in order
 */
export const rrwebEvents = pgTable("rrweb_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: text("session_id").notNull(),
  replayId: text("replay_id").notNull(), // tab-scoped replay ID
  eventId: text("event_id").notNull().unique(), // from SDK (dedup key)
  projectId: text("project_id").notNull(),
  clientId: text("client_id").notNull(),
  userId: text("user_id"),
  timestamp: timestamp("timestamp", { withTimezone: true }).notNull(),
  url: text("url").notNull(),
  referrer: text("referrer"),
  // Raw rrweb payload (verbatim from SDK)
  rrwebPayload: jsonb("rrweb_payload").notNull(),
  schemaVersion: text("schema_version").notNull(),
  // Page info for later filtering
  pageWidth: integer("page_width"),
  pageHeight: integer("page_height"),
  viewportWidth: integer("viewport_width"),
  viewportHeight: integer("viewport_height"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/**
 * Heatmap clicks table - aggregated click data for heatmap rendering
 * Uses a 50x50 grid (0-50 for each normalized axis)
 */
export const heatmapClicks = pgTable("heatmap_clicks", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: text("project_id").notNull(),
  sessionId: text("session_id").notNull(),
  url: text("url").notNull(),
  // Grid bucket (0-49 for both axes in 50x50 grid)
  gridX: integer("grid_x").notNull(),
  gridY: integer("grid_y").notNull(),
  // Denormalized click info for reference
  xNorm: numeric("x_norm", { precision: 5, scale: 4 }).notNull(),
  yNorm: numeric("y_norm", { precision: 5, scale: 4 }).notNull(),
  pageX: integer("page_x"),
  pageY: integer("page_y"),
  // Element info
  selector: text("selector"),
  tagName: text("tag_name"),
  elementTextHash: text("element_text_hash"),
  // Layout info
  screenClass: text("screen_class"), // 'mobile' | 'tablet' | 'desktop'
  layoutHash: text("layout_hash"),
  pageWidth: integer("page_width"),
  pageHeight: integer("page_height"),
  viewportWidth: integer("viewport_width"),
  viewportHeight: integer("viewport_height"),
  // Aggregation
  count: integer("count").notNull().default(1),
  lastClickAt: timestamp("last_click_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/**
 * Users table - retention analytics identity cache
 * Stores the first time a distinct user (userId ?? clientId) was seen per project
 * Used to define cohort membership and start date for retention calculations
 *
 * Constraints:
 * - One row per (projectId, distinctId) combination
 * - firstSeenAt is immutable (set on first insert, never updated)
 * - Only insert when user is first encountered (upsert with ON CONFLICT DO NOTHING)
 */
export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: text("project_id").notNull(),
    distinctId: text("distinct_id").notNull(), // userId ?? clientId (analytics identity)
    firstSeenAt: timestamp("first_seen_at", { withTimezone: true }).notNull(), // UTC, immutable
    country: text("country"), // ISO-2 country code (e.g., 'US', 'GB', 'ET'). Set on first-seen, immutable.
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    unique("users_project_distinct_id_key").on(
      table.projectId,
      table.distinctId
    ),
    index("users_project_first_seen_idx").on(
      table.projectId,
      table.firstSeenAt
    ),
  ]
);

/**
 * User daily activity table - retention accelerator
 * Tracks the presence of a distinct user on a given calendar day (UTC)
 * One row per (projectId, distinctId, activityDate) combination
 *
 * Purpose:
 * - Fast day-N retention lookups without scanning raw events
 * - Denormalization: trades storage for query speed
 * - Used by retention queries to check if user had any activity on a specific day
 *
 * Schema notes:
 * - activityDate is stored as DATE (not timestamp) in UTC
 * - Computed from event timestamp as DATE(timestamp AT TIME ZONE 'UTC')
 * - One row per day per user, regardless of event count
 *
 * Indexes:
 * - (projectId, activityDate): for day-N cohort queries
 * - (projectId, distinctId): for user-specific activity lookups
 */
export const userDailyActivity = pgTable(
  "user_daily_activity",
  {
    projectId: text("project_id").notNull(),
    distinctId: text("distinct_id").notNull(), // userId ?? clientId
    activityDate: date("activity_date").notNull(), // DATE in UTC, e.g. '2025-01-15'
    lastActivityAt: timestamp("last_activity_at", { withTimezone: true })
      .defaultNow()
      .notNull(), // timestamp of most recent event that day
  },
  (table) => [
    // Composite primary key: one row per (projectId, distinctId, activityDate)
    unique("user_daily_activity_pk").on(
      table.projectId,
      table.distinctId,
      table.activityDate
    ),
    index("user_daily_activity_project_date_idx").on(
      table.projectId,
      table.activityDate
    ),
    index("user_daily_activity_project_distinct_idx").on(
      table.projectId,
      table.distinctId
    ),
  ]
);

// Relations (optional, not used in this phase but good for type safety)
export const sessionsRelations = relations(sessions, ({ many }) => ({
  events: many(events),
  rrwebEvents: many(rrwebEvents),
  heatmapClicks: many(heatmapClicks),
}));

export const eventsRelations = relations(events, ({ one }) => ({
  session: one(sessions, {
    fields: [events.sessionId],
    references: [sessions.id],
  }),
}));

export const rrwebEventsRelations = relations(rrwebEvents, ({ one }) => ({
  session: one(sessions, {
    fields: [rrwebEvents.sessionId],
    references: [sessions.id],
  }),
}));

export const heatmapClicksRelations = relations(heatmapClicks, ({ one }) => ({
  session: one(sessions, {
    fields: [heatmapClicks.sessionId],
    references: [sessions.id],
  }),
}));
