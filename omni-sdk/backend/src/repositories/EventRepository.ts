import { db } from "../db/client";
import { events } from "../db/schema";
import { eq, count, inArray } from "drizzle-orm";

export class EventRepository {
  /**
   * Insert an event into the events table
   * Idempotent on eventId (unique constraint)
   * Only tracks event metadata (type, timestamp, url, etc.)
   * Detailed event data stored in specialized tables (rrwebEvents, heatmapClicks)
   */
  async insertEvent({
    eventId,
    projectId,
    sessionId,
    clientId,
    userId,
    type,
    timestamp,
    url,
    referrer,
  }: {
    eventId: string;
    projectId: string;
    sessionId: string;
    clientId: string;
    userId: string | null;
    type: string;
    timestamp: Date;
    url: string;
    referrer?: string;
  }) {
    try {
      // Check if event already exists (idempotency)
      const existing = await db
        .select()
        .from(events)
        .where(eq(events.eventId, eventId))
        .limit(1);

      if (existing.length > 0) {
        console.log(
          `[EventRepository] Event ${eventId} already exists, skipping`
        );
        return existing[0];
      }

      // Insert new event
      const result = await db
        .insert(events)
        .values({
          eventId,
          projectId,
          sessionId,
          clientId,
          userId,
          type,
          timestamp,
          url,
          referrer: referrer || null,
        })
        .returning();

      return result[0];
    } catch (error) {
      console.error("Error inserting event:", error);
      throw error;
    }
  }

  /**
   * Get event count for a session
   */
  async getEventCountBySession(sessionId: string): Promise<number> {
    try {
      const result = await db
        .select({ count: count() })
        .from(events)
        .where(eq(events.sessionId, sessionId));

      return result[0]?.count || 0;
    } catch (error) {
      console.error("Error getting event count:", error);
      throw error;
    }
  }

  /**
   * Get event counts for multiple sessions
   */
  async getEventCountsBySessionIds(
    sessionIds: string[]
  ): Promise<Map<string, number>> {
    try {
      if (sessionIds.length === 0) {
        return new Map();
      }

      const result = await db
        .select({
          sessionId: events.sessionId,
          count: count(),
        })
        .from(events)
        .where(({ sessionId }) => inArray(sessionId, sessionIds))
        .groupBy(events.sessionId);

      return new Map(result.map((r) => [r.sessionId, r.count]));
    } catch (error) {
      console.error("Error getting event counts:", error);
      throw error;
    }
  }
}

export const eventRepository = new EventRepository();
