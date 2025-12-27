import { db } from "../db/client";
import { sessions, events, heatmapClicks } from "../db/schema";
import { eq, count, min, max } from "drizzle-orm";
import { eventRepository } from "./EventRepository";
import { withErrorHandling } from "./BaseRepository";

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
    return withErrorHandling("SessionRepository.upsertSession", async () => {
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
    });
  }

  /**
   * Get session by ID
   */
  async getSession(sessionId: string) {
    return withErrorHandling("SessionRepository.getSession", async () => {
      const result = await db
        .select()
        .from(sessions)
        .where(eq(sessions.id, sessionId))
        .limit(1);

      return result[0] || null;
    });
  }

  /**
   * Get all sessions for a project
   */
  async getSessionsByProject(projectId: string) {
    return withErrorHandling(
      "SessionRepository.getSessionsByProject",
      async () => {
        return await db
          .select()
          .from(sessions)
          .where(eq(sessions.projectId, projectId));
      }
    );
  }

  /**
   * Get sessions with stats for a project
   * Includes event counts and rage clicks
   * Rage clicks = per-user sequences of ≥5 clicks on same URL within 500ms windows
   */
  async getSessionsWithStats(projectId: string) {
    return withErrorHandling(
      "SessionRepository.getSessionsWithStats",
      async () => {
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

        // Get rage click counts per session using window function analysis
        const rageClickCounts = new Map<string, number>();

        for (const session of projectSessions) {
          const rageClickCount =
            await eventRepository.getRageClickCountBySession(
              session.id,
              3,
              600 // ms threshold
            );
          if (rageClickCount > 0) {
            rageClickCounts.set(session.id, rageClickCount);
          }
        }

        // Enrich sessions with stats
        return projectSessions.map((session) => ({
          ...session,
          eventsCount: eventCountMap.get(session.id) || 0,
          rageClicks: rageClickCounts.get(session.id) || 0,
        }));
      }
    );
  }
}

export const sessionRepository = new SessionRepository();
