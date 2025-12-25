import { db } from "../db/client";
import { users, userDailyActivity } from "../db/schema";
import { sql } from "drizzle-orm";
import { withErrorHandling } from "./BaseRepository";

/**
 * User Repository
 * Handles analytics identity tracking for retention
 *
 * Purpose:
 * - Track first-seen time for each (projectId, distinctId)
 * - Track daily activity presence for retention queries
 * - All operations use ON CONFLICT DO NOTHING for idempotency
 */
export class UserRepository {
  /**
   * Insert or ignore user first-seen record
   * Idempotent: if user already exists, does nothing
   *
   * Called on every event ingest to ensure user is in first-seen cache
   * Country is set ONLY on first insert, never updated on conflicts
   *
   * @param projectId - Project identifier
   * @param distinctId - Analytics identity (userId ?? clientId)
   * @param firstSeenAt - Timestamp of this event (first time we see this user)
   * @param country - ISO-2 country code (e.g., 'US', 'ET'). Set only on first insert.
   */
  async upsertUserFirstSeen(
    projectId: string,
    distinctId: string,
    firstSeenAt: Date,
    country?: string
  ): Promise<void> {
    return withErrorHandling("UserRepository.upsertUserFirstSeen", async () => {
      // Use raw SQL for ON CONFLICT DO NOTHING (Drizzle doesn't handle this efficiently)
      await db.execute(sql`
        INSERT INTO users (project_id, distinct_id, first_seen_at, country, created_at)
        VALUES (${projectId}, ${distinctId}, ${firstSeenAt}, ${country || null}, NOW())
        ON CONFLICT ON CONSTRAINT users_project_distinct_id_key DO NOTHING
      `);
    });
  }

  /**
   * Insert or ignore daily activity record
   * Idempotent: if activity on date already recorded, does nothing
   *
   * Called on every event ingest to track user presence on a day
   *
   * @param projectId - Project identifier
   * @param distinctId - Analytics identity (userId ?? clientId)
   * @param timestamp - Event timestamp (used to compute activity date in UTC)
   */
  async upsertUserDailyActivity(
    projectId: string,
    distinctId: string,
    timestamp: Date
  ): Promise<void> {
    return withErrorHandling(
      "UserRepository.upsertUserDailyActivity",
      async () => {
        // Extract date in UTC from timestamp
        // Format: YYYY-MM-DD
        await db.execute(sql`
          INSERT INTO user_daily_activity (project_id, distinct_id, activity_date, last_activity_at)
          VALUES (
            ${projectId},
            ${distinctId},
            DATE(${timestamp} AT TIME ZONE 'UTC'),
            ${timestamp}
          )
          ON CONFLICT ON CONSTRAINT user_daily_activity_pk DO UPDATE
          SET last_activity_at = GREATEST(user_daily_activity.last_activity_at, EXCLUDED.last_activity_at)
        `);
      }
    );
  }

  /**
   * Batch upsert user first-seen records (for bulk imports)
   * More efficient than individual inserts
   *
   * @param records - Array of { projectId, distinctId, firstSeenAt }
   */
  async batchUpsertUserFirstSeen(
    records: Array<{ projectId: string; distinctId: string; firstSeenAt: Date }>
  ): Promise<void> {
    return withErrorHandling(
      "UserRepository.batchUpsertUserFirstSeen",
      async () => {
        if (records.length === 0) return;

        // Build VALUES clause dynamically
        const valuesClauses = records
          .map(
            (r) =>
              sql`(${r.projectId}, ${r.distinctId}, ${r.firstSeenAt}, NOW())`
          )
          .reduce((acc, clause, idx) => {
            if (idx === 0) return clause;
            return sql`${acc}, ${clause}`;
          });

        await db.execute(sql`
          INSERT INTO users (project_id, distinct_id, first_seen_at, created_at)
          VALUES ${valuesClauses}
          ON CONFLICT ON CONSTRAINT users_project_distinct_id_key DO NOTHING
        `);
      }
    );
  }

  /**
   * Batch upsert user daily activity records (for bulk imports)
   * More efficient than individual inserts
   *
   * @param records - Array of { projectId, distinctId, timestamp }
   */
  async batchUpsertUserDailyActivity(
    records: Array<{ projectId: string; distinctId: string; timestamp: Date }>
  ): Promise<void> {
    return withErrorHandling(
      "UserRepository.batchUpsertUserDailyActivity",
      async () => {
        if (records.length === 0) return;

        const valuesClauses = records
          .map(
            (r) =>
              sql`(
                ${r.projectId},
                ${r.distinctId},
                DATE(${r.timestamp} AT TIME ZONE 'UTC'),
                ${r.timestamp}
              )`
          )
          .reduce((acc, clause, idx) => {
            if (idx === 0) return clause;
            return sql`${acc}, ${clause}`;
          });

        await db.execute(sql`
          INSERT INTO user_daily_activity (project_id, distinct_id, activity_date, last_activity_at)
          VALUES ${valuesClauses}
          ON CONFLICT ON CONSTRAINT user_daily_activity_pk DO UPDATE
          SET last_activity_at = GREATEST(user_daily_activity.last_activity_at, EXCLUDED.last_activity_at)
        `);
      }
    );
  }
}

export const userRepository = new UserRepository();
