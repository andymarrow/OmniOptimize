import { db } from "../db/client";
import { sql } from "drizzle-orm";
import { withErrorHandling } from "./BaseRepository";

/**
 * Top Pages Analytics Repository
 * Session-based page view analytics with time-on-page calculations
 */
export class TopPagesRepository {
  /**
   * Get top visited pages with average time-on-page
   *
   * URL normalization:
   * - Strips protocol + host
   * - Removes query parameters
   * - Groups by normalized path
   *
   * Time-on-page:
   * - Calculated using LEAD() window function per session
   * - Time = interval until next pageview in same session
   * - Excludes last pageview in session (no next timestamp)
   *
   * @param projectId - Project identifier
   * @param startDate - ISO date (YYYY-MM-DD)
   * @param endDate - ISO date (YYYY-MM-DD)
   * @param limit - Max pages to return (default 10)
   */
  async getTopPages(
    projectId: string,
    startDate: string,
    endDate: string,
    limit: number = 10
  ): Promise<
    Array<{
      path: string;
      views: number;
      avgTimeSeconds: number;
    }>
  > {
    return withErrorHandling("TopPagesRepository.getTopPages", async () => {
      const result = await db.execute(sql`
        WITH pageviews AS (
          SELECT
            split_part(
              regexp_replace(url, '^https?://[^/]+', ''),
              '?',
              1
            ) AS path,
            session_id,
            timestamp,
            LEAD(timestamp) OVER (
              PARTITION BY session_id
              ORDER BY timestamp
            ) AS next_timestamp
          FROM events
          WHERE project_id = ${projectId}
            AND type = 'pageview'
            AND DATE(timestamp AT TIME ZONE 'UTC') >= ${startDate}::date
            AND DATE(timestamp AT TIME ZONE 'UTC') <= ${endDate}::date
        ),
        page_stats AS (
          SELECT
            path,
            COUNT(*) as views,
            AVG(EXTRACT(EPOCH FROM (next_timestamp - timestamp))) as avg_seconds
          FROM pageviews
          WHERE next_timestamp IS NOT NULL
          GROUP BY path
        )
        SELECT
          path,
          views,
          ROUND(avg_seconds::numeric)::integer AS avg_time_seconds
        FROM page_stats
        ORDER BY views DESC
        LIMIT ${limit}
      `);

      return (result.rows || []).map((row: any) => ({
        path: String(row.path),
        views: Number(row.views),
        avgTimeSeconds: Number(row.avg_time_seconds),
      }));
    });
  }
}

export const topPagesRepository = new TopPagesRepository();
