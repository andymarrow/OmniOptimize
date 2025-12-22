import { db } from "../db/client";
import { rrwebEvents } from "../db/schema";
import { eq } from "drizzle-orm";
import type { RrwebEventPayload } from "../types";

export class RrwebRepository {
  /**
   * Insert a single rrweb event
   * Uses event_id as unique constraint (idempotent on retry)
   */
  async insertRrwebEvent({
    eventId,
    projectId,
    sessionId,
    replayId,
    clientId,
    userId,
    timestamp,
    url,
    referrer,
    rrwebPayload,
    schemaVersion,
    pageWidth,
    pageHeight,
    viewportWidth,
    viewportHeight,
  }: {
    eventId: string;
    projectId: string;
    sessionId: string;
    replayId: string;
    clientId: string;
    userId: string | null;
    timestamp: Date;
    url: string;
    referrer?: string;
    rrwebPayload: RrwebEventPayload;
    schemaVersion: string;
    pageWidth?: number;
    pageHeight?: number;
    viewportWidth?: number;
    viewportHeight?: number;
  }) {
    try {
      // Check if event already exists (for idempotency)
      const existing = await db
        .select()
        .from(rrwebEvents)
        .where(eq(rrwebEvents.eventId, eventId))
        .limit(1);

      if (existing.length > 0) {
        console.log(
          `[RrwebRepository] Event ${eventId} already exists, skipping`
        );
        return existing[0];
      }

      // Insert new event
      const result = await db
        .insert(rrwebEvents)
        .values({
          eventId,
          projectId,
          sessionId,
          replayId,
          clientId,
          userId,
          timestamp,
          url,
          referrer: referrer || null,
          rrwebPayload,
          schemaVersion,
          pageWidth,
          pageHeight,
          viewportWidth,
          viewportHeight,
        })
        .returning();

      return result[0];
    } catch (error) {
      console.error("Error inserting rrweb event:", error);
      throw error;
    }
  }

  /**
   * Get all rrweb events for a session, ordered by timestamp
   */
  async getRrwebEventsBySession(sessionId: string) {
    try {
      return await db
        .select()
        .from(rrwebEvents)
        .where(eq(rrwebEvents.sessionId, sessionId))
        .orderBy(rrwebEvents.timestamp);
    } catch (error) {
      console.error("Error getting rrweb events by session:", error);
      throw error;
    }
  }

  /**
   * Get rrweb events for a specific replay (tab)
   */
  async getRrwebEventsByReplay(replayId: string) {
    try {
      return await db
        .select()
        .from(rrwebEvents)
        .where(eq(rrwebEvents.replayId, replayId))
        .orderBy(rrwebEvents.timestamp);
    } catch (error) {
      console.error("Error getting rrweb events by replay:", error);
      throw error;
    }
  }

  /**
   * Count rrweb events for a session
   */
  async countRrwebEventsBySession(sessionId: string): Promise<number> {
    try {
      const result = await db
        .select()
        .from(rrwebEvents)
        .where(eq(rrwebEvents.sessionId, sessionId));

      return result.length;
    } catch (error) {
      console.error("Error counting rrweb events:", error);
      throw error;
    }
  }
}

export const rrwebRepository = new RrwebRepository();
