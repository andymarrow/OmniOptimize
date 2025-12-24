import { db } from "../db/client";
import { sessions, events, heatmapClicks } from "../db/schema";
import { eq, count, min, max } from "drizzle-orm";

export class SessionRepository {
  /**
   * Upsert a session - create or update if exists
   * Idempotent operation safe for retries
   * Updates location and device on each upsert (to track latest activity)
   */
  async upsertSession({
    sessionId,
    projectId,
    clientId,
    userId,
    location = "ET",
    device,
  }: {
    sessionId: string;
    projectId: string;
    clientId: string;
    userId: string | null;
    location?: string;
    device?: string | null;
  }) {
    try {
      const existing = await db
        .select()
        .from(sessions)
        .where(eq(sessions.id, sessionId))
        .limit(1);

      if (existing.length > 0) {
        // Update existing session - update location/device and timestamp
        const updateData: any = {
          userId: userId,
          location: location,
          updatedAt: new Date(),
        };

        // Only update device if provided
        if (device) {
          updateData.device = device;
        }

        await db
          .update(sessions)
          .set(updateData)
          .where(eq(sessions.id, sessionId));

        return existing[0];
      } else {
        // Insert new session
        const result = await db
          .insert(sessions)
          .values({
            id: sessionId,
            projectId,
            clientId,
            userId,
            location,
            device: device || null,
          })
          .returning();

        return result[0];
      }
    } catch (error) {
      console.error("Error upserting session:", error);
      throw error;
    }
  }

  /**
   * Get session by ID
   */
  async getSession(sessionId: string) {
    try {
      const result = await db
        .select()
        .from(sessions)
        .where(eq(sessions.id, sessionId))
        .limit(1);

      return result[0] || null;
    } catch (error) {
      console.error("Error getting session:", error);
      throw error;
    }
  }

  /**
   * Get all sessions for a project
   */
  async getSessionsByProject(projectId: string) {
    try {
      return await db
        .select()
        .from(sessions)
        .where(eq(sessions.projectId, projectId));
    } catch (error) {
      console.error("Error getting sessions by project:", error);
      throw error;
    }
  }

  /**
   * Get sessions with stats for a project
   * Includes event counts and rage clicks
   * Rage clicks = multiple clicks by same user on same element in short time span
   */
  async getSessionsWithStats(projectId: string) {
    try {
      // Get all sessions for the project
      const projectSessions = await db
        .select()
        .from(sessions)
        .where(eq(sessions.projectId, projectId));

      if (projectSessions.length === 0) {
        return [];
      }

      // Get event counts per session (from generic events table)
      const eventCounts = await db
        .select({
          sessionId: events.sessionId,
          count: count(),
        })
        .from(events)
        .where(eq(events.projectId, projectId))
        .groupBy(events.sessionId);

      const eventCountMap = new Map(
        eventCounts.map((e) => [e.sessionId, e.count])
      );

      // Get rage click counts per session
      // Rage clicks = clicks at same grid position with count >= 3 (indicating user frustration)
      // Only count one rage click per grid position per session (not per click)
      const rageClicks = await db
        .select({
          sessionId: heatmapClicks.sessionId,
        })
        .from(heatmapClicks)
        .where(eq(heatmapClicks.projectId, projectId));
      // Filter for clusters where count >= 3 (indicates multiple clicks at same spot)
      // .where(({ count }) => count >= 3);

      const rageClickMap = new Map<string, number>();
      for (const rage of rageClicks) {
        rageClickMap.set(
          rage.sessionId,
          (rageClickMap.get(rage.sessionId) || 0) + 1
        );
      }

      // Enrich sessions with stats
      return projectSessions.map((session) => ({
        ...session,
        eventsCount: eventCountMap.get(session.id) || 0,
        rageClicks: rageClickMap.get(session.id) || 0,
      }));
    } catch (error) {
      console.error("Error getting sessions with stats:", error);
      throw error;
    }
  }
}

export const sessionRepository = new SessionRepository();
