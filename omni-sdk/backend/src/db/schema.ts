import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  numeric,
  integer,
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
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
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

// Relations (optional, not used in this phase but good for type safety)
export const sessionsRelations = relations(sessions, ({ many }) => ({
  rrwebEvents: many(rrwebEvents),
  heatmapClicks: many(heatmapClicks),
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
