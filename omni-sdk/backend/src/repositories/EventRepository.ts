import { db } from "../db/client";
import { events } from "../db/schema";
import { eq, count, inArray, sql } from "drizzle-orm";
import { withErrorHandling, withIdempotency } from "./BaseRepository";

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
    return withIdempotency(
      "EventRepository.insertEvent",
      eventId,
      () =>
        db.select().from(events).where(eq(events.eventId, eventId)).limit(1),
      () =>
        db
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
          .returning()
    );
  }

  /**
   * Get event count for a session
   */
  async getEventCountBySession(sessionId: string): Promise<number> {
    return withErrorHandling(
      "EventRepository.getEventCountBySession",
      async () => {
        const result = await db
          .select({ count: count() })
          .from(events)
          .where(eq(events.sessionId, sessionId));

        return result[0]?.count || 0;
      }
    );
  }

  /**
   * Get event counts for multiple sessions
   */
  async getEventCountsBySessionIds(
    sessionIds: string[]
  ): Promise<Map<string, number>> {
    return withErrorHandling(
      "EventRepository.getEventCountsBySessionIds",
      async () => {
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
      }
    );
  }

  /**
   * Detect rage clicks per session
   * A rage click sequence = ≥5 clicks by same user (clientId) on same URL within 500ms windows
   * Returns count of distinct rage-click sequences per session
   *
   * @param sessionId - Session to analyze
   * @param minClicks - Minimum clicks in sequence to count as rage (default: 5)
   * @param thresholdMs - Time window for consecutive clicks (default: 500ms)
   */
  async getRageClickCountBySession(
    sessionId: string,
    minClicks: number = 5,
    thresholdMs: number = 500
  ): Promise<number> {
    return withErrorHandling(
      "EventRepository.getRageClickCountBySession",
      async () => {
        const result = await db.execute(sql`
        WITH ordered_clicks AS (
          SELECT
            id,
            client_id,
            session_id,
            url,
            timestamp,
            EXTRACT(EPOCH FROM (
              timestamp - LAG(timestamp) OVER (
                PARTITION BY client_id, session_id, url
                ORDER BY timestamp
              )
            )) * 1000 AS diff_ms
          FROM events
          WHERE type = 'click' AND session_id = ${sessionId}
        ),
        click_groups AS (
          SELECT
            *,
            SUM(
              CASE
                WHEN diff_ms IS NULL OR diff_ms > ${thresholdMs}
                THEN 1 ELSE 0
              END
            ) OVER (
              PARTITION BY client_id, session_id, url
              ORDER BY timestamp
            ) AS sequence_id
          FROM ordered_clicks
        ),
        rage_sequences AS (
          SELECT
            client_id,
            session_id,
            url,
            sequence_id,
            COUNT(*) AS click_count
          FROM click_groups
          GROUP BY client_id, session_id, url, sequence_id
          HAVING COUNT(*) >= ${minClicks}
        )
        SELECT COUNT(*) as rage_click_count FROM rage_sequences
      `);

        const rageCount = result.rows[0]?.rage_click_count || 0;
        return Number(rageCount);
      }
    );
  }

  /**
   * Get rage click sequences for a session (detailed info)
   * Returns each rage-click sequence with user, URL, click count, timing
   */
  async getRageClickSequencesBySession(
    sessionId: string,
    minClicks: number = 5,
    thresholdMs: number = 500
  ): Promise<
    Array<{
      clientId: string;
      url: string;
      clickCount: number;
      startedAt: Date;
      endedAt: Date;
    }>
  > {
    return withErrorHandling(
      "EventRepository.getRageClickSequencesBySession",
      async () => {
        const result = await db.execute(sql`
        WITH ordered_clicks AS (
          SELECT
            id,
            client_id,
            session_id,
            url,
            timestamp,
            EXTRACT(EPOCH FROM (
              timestamp - LAG(timestamp) OVER (
                PARTITION BY client_id, session_id, url
                ORDER BY timestamp
              )
            )) * 1000 AS diff_ms
          FROM events
          WHERE type = 'click' AND session_id = ${sessionId}
        ),
        click_groups AS (
          SELECT
            *,
            SUM(
              CASE
                WHEN diff_ms IS NULL OR diff_ms > ${thresholdMs}
                THEN 1 ELSE 0
              END
            ) OVER (
              PARTITION BY client_id, session_id, url
              ORDER BY timestamp
            ) AS sequence_id
          FROM ordered_clicks
        ),
        rage_sequences AS (
          SELECT
            client_id,
            session_id,
            url,
            sequence_id,
            COUNT(*) AS click_count,
            MIN(timestamp) AS started_at,
            MAX(timestamp) AS ended_at
          FROM click_groups
          GROUP BY client_id, session_id, url, sequence_id
          HAVING COUNT(*) >= ${minClicks}
        )
        SELECT client_id, url, click_count, started_at, ended_at
        FROM rage_sequences
        ORDER BY started_at
      `);

        return (result.rows || []).map((row: any) => ({
          clientId: row.client_id,
          url: row.url,
          clickCount: row.click_count,
          startedAt: new Date(row.started_at),
          endedAt: new Date(row.ended_at),
        }));
      }
    );
  }
}

export const eventRepository = new EventRepository();
