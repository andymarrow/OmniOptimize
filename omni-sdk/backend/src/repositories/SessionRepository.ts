import { db } from "../db/client";
import { sessions } from "../db/schema";
import { eq } from "drizzle-orm";

export class SessionRepository {
  /**
   * Upsert a session - create or update if exists
   * Idempotent operation safe for retries
   */
  async upsertSession({
    sessionId,
    projectId,
    clientId,
    userId,
  }: {
    sessionId: string;
    projectId: string;
    clientId: string;
    userId: string | null;
  }) {
    try {
      const existing = await db
        .select()
        .from(sessions)
        .where(eq(sessions.id, sessionId))
        .limit(1);

      if (existing.length > 0) {
        // Update existing session
        await db
          .update(sessions)
          .set({
            userId: userId,
            updatedAt: new Date(),
          })
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
}

export const sessionRepository = new SessionRepository();
