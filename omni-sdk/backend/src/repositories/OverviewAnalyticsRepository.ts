import { db } from "../db/client";
import { sql } from "drizzle-orm";
import { withErrorHandling } from "./BaseRepository";

/**
 * Overview Analytics Repository
 * Executive summary dashboard metrics using raw SQL
 *
 * Metrics:
 * - Total visits (count of sessions)
 * - Avg session duration (seconds)
 * - Bounce rate (sessions with 1 pageview + 0 meaningful interactions)
 * - Daily traffic overview (visitors + bounce rate per day)
 */
export class OverviewAnalyticsRepository {
  /**
   * Count total sessions in date range
   * Unit: session (not user)
   *
   * @param projectId - Project identifier
   * @param startDate - ISO date (YYYY-MM-DD)
   * @param endDate - ISO date (YYYY-MM-DD)
   */
  async getTotalVisits(
    projectId: string,
    startDate: string,
    endDate: string
  ): Promise<number> {
    return withErrorHandling(
      "OverviewAnalyticsRepository.getTotalVisits",
      async () => {
        const result = await db.execute(sql`
        SELECT COUNT(*) as count
        FROM sessions
        WHERE project_id = ${projectId}
        AND DATE(created_at AT TIME ZONE 'UTC') >= ${startDate}::date
        AND DATE(created_at AT TIME ZONE 'UTC') <= ${endDate}::date
      `);

        return Number(result.rows[0]?.count || 0);
      }
    );
  }

  /**
   * Calculate average session duration in seconds
   * Duration = updatedAt - createdAt
   *
   * @param projectId - Project identifier
   * @param startDate - ISO date (YYYY-MM-DD)
   * @param endDate - ISO date (YYYY-MM-DD)
   */
  async getAvgSessionDuration(
    projectId: string,
    startDate: string,
    endDate: string
  ): Promise<number> {
    return withErrorHandling(
      "OverviewAnalyticsRepository.getAvgSessionDuration",
      async () => {
        const result = await db.execute(sql`
        SELECT AVG(
          EXTRACT(EPOCH FROM (updated_at - created_at))
        ) as avg_duration_seconds
        FROM sessions
        WHERE project_id = ${projectId}
        AND DATE(created_at AT TIME ZONE 'UTC') >= ${startDate}::date
        AND DATE(created_at AT TIME ZONE 'UTC') <= ${endDate}::date
      `);

        return Number(result.rows[0]?.avg_duration_seconds || 0);
      }
    );
  }

  /**
   * Calculate bounce rate for date range
   *
   * Bounce session = exactly 1 pageview + 0 meaningful interactions
   * Meaningful interactions: 'click', 'input', 'custom', 'route'
   * Ignored events: 'rrweb', 'session_snapshot'
   *
   * @param projectId - Project identifier
   * @param startDate - ISO date (YYYY-MM-DD)
   * @param endDate - ISO date (YYYY-MM-DD)
   */
  async getBounceRate(
    projectId: string,
    startDate: string,
    endDate: string
  ): Promise<number> {
    return withErrorHandling(
      "OverviewAnalyticsRepository.getBounceRate",
      async () => {
        const result = await db.execute(sql`
        WITH session_events AS (
          SELECT 
            session_id,
            COUNT(*) FILTER (WHERE type = 'pageview') as pageview_count,
            COUNT(*) FILTER (WHERE type IN ('click', 'input', 'custom', 'route')) as interaction_count
          FROM events
          WHERE project_id = ${projectId}
          AND DATE(timestamp AT TIME ZONE 'UTC') >= ${startDate}::date
          AND DATE(timestamp AT TIME ZONE 'UTC') <= ${endDate}::date
          GROUP BY session_id
        ),
        bounced_sessions AS (
          SELECT COUNT(*) as count
          FROM session_events
          WHERE pageview_count = 1
          AND interaction_count = 0
        ),
        total_sessions AS (
          SELECT COUNT(*) as count
          FROM sessions
          WHERE project_id = ${projectId}
          AND DATE(created_at AT TIME ZONE 'UTC') >= ${startDate}::date
          AND DATE(created_at AT TIME ZONE 'UTC') <= ${endDate}::date
        )
        SELECT 
          CASE 
            WHEN total_sessions.count = 0 THEN 0
            ELSE ROUND(
              (bounced_sessions.count::numeric / total_sessions.count * 100)::numeric,
              2
            )::float
          END as bounce_rate
        FROM bounced_sessions, total_sessions
      `);

        return Number(result.rows[0]?.bounce_rate || 0);
      }
    );
  }

  /**
   * Get daily traffic overview with visitors and bounce rate
   * Grouped by DATE(sessions.createdAt)
   *
   * Each day is independent:
   * - Visitors = distinct users (distinct_id) that started sessions that day
   * - BounceRate = bounced sessions / total sessions on that day
   *
   * @param projectId - Project identifier
   * @param startDate - ISO date (YYYY-MM-DD)
   * @param endDate - ISO date (YYYY-MM-DD)
   */
  async getDailyTrafficOverview(
    projectId: string,
    startDate: string,
    endDate: string
  ): Promise<
    Array<{
      date: string;
      visitors: number;
      bounceRate: number;
    }>
  > {
    return withErrorHandling(
      "OverviewAnalyticsRepository.getDailyTrafficOverview",
      async () => {
        const result = await db.execute(sql`
          WITH daily_sessions AS (
            SELECT 
              DATE(created_at AT TIME ZONE 'UTC') as session_date,
              id as session_id,
              client_id
            FROM sessions
            WHERE project_id = ${projectId}
            AND DATE(created_at AT TIME ZONE 'UTC') >= ${startDate}::date
            AND DATE(created_at AT TIME ZONE 'UTC') <= ${endDate}::date
          ),
          daily_stats AS (
            SELECT 
              session_date,
              COUNT(DISTINCT client_id) as visitors,
              COUNT(DISTINCT session_id) as total_sessions
            FROM daily_sessions
            GROUP BY session_date
          ),
          event_daily_stats AS (
            SELECT 
              DATE(timestamp AT TIME ZONE 'UTC') as event_date,
              session_id,
              COUNT(*) FILTER (WHERE type = 'pageview') as pageview_count,
              COUNT(*) FILTER (WHERE type IN ('click', 'input', 'custom', 'route')) as interaction_count
            FROM events
            WHERE project_id = ${projectId}
            AND DATE(timestamp AT TIME ZONE 'UTC') >= ${startDate}::date
            AND DATE(timestamp AT TIME ZONE 'UTC') <= ${endDate}::date
            GROUP BY event_date, session_id
          ),
          daily_bounces AS (
            SELECT 
              event_date,
              COUNT(*) as bounced_count
            FROM event_daily_stats
            WHERE pageview_count = 1
            AND interaction_count = 0
            GROUP BY event_date
          )
          SELECT 
            ds.session_date::text as date,
            ds.visitors,
            COALESCE(
              ROUND(
                (db.bounced_count::numeric / ds.total_sessions * 100)::numeric,
                2
              )::float,
              0
            ) as bounce_rate
          FROM daily_stats ds
          LEFT JOIN daily_bounces db ON ds.session_date = db.event_date
          ORDER BY ds.session_date ASC
        `);

        return (result.rows || []).map((row: any) => ({
          date: String(row.date),
          visitors: Number(row.visitors),
          bounceRate: Number(row.bounce_rate),
        }));
      }
    );
  }

  /**
   * Calculate previous period date range (same length as current)
   *
   * @param startDate - Current period start (YYYY-MM-DD)
   * @param endDate - Current period end (YYYY-MM-DD)
   * @returns { start, end } for previous period
   */
  private getPreviousPeriodDates(
    startDate: string,
    endDate: string
  ): { start: string; end: string } {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const rangeLength =
      Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const prevEnd = new Date(start);
    prevEnd.setDate(prevEnd.getDate() - 1);

    const prevStart = new Date(prevEnd);
    prevStart.setDate(prevStart.getDate() - (rangeLength - 1));

    const formatDate = (d: Date) => d.toISOString().split("T")[0];

    return {
      start: formatDate(prevStart),
      end: formatDate(prevEnd),
    };
  }

  /**
   * Get complete overview analytics dashboard
   * Aggregates all metrics with previous period comparison
   *
   * @param projectId - Project identifier
   * @param startDate - Current period start (ISO date)
   * @param endDate - Current period end (ISO date)
   */
  async getOverviewAnalytics(
    projectId: string,
    startDate: string,
    endDate: string
  ): Promise<{
    range: { start: string; end: string };
    comparison: { start: string; end: string };
    totalVisitsCurrent: number;
    totalVisitsPrevious: number;
    avgSessionCurrent: number;
    avgSessionPrevious: number;
    bounceRateCurrent: number;
    bounceRatePrevious: number;
    dailyTraffic: Array<{
      date: string;
      visitors: number;
      bounceRate: number;
    }>;
  }> {
    return withErrorHandling(
      "OverviewAnalyticsRepository.getOverviewAnalytics",
      async () => {
        const prevPeriod = this.getPreviousPeriodDates(startDate, endDate);

        // Fetch all metrics in parallel
        const [
          totalVisitsCurrent,
          totalVisitsPrevious,
          avgSessionCurrent,
          avgSessionPrevious,
          bounceRateCurrent,
          bounceRatePrevious,
          dailyTraffic,
        ] = await Promise.all([
          this.getTotalVisits(projectId, startDate, endDate),
          this.getTotalVisits(projectId, prevPeriod.start, prevPeriod.end),
          this.getAvgSessionDuration(projectId, startDate, endDate),
          this.getAvgSessionDuration(
            projectId,
            prevPeriod.start,
            prevPeriod.end
          ),
          this.getBounceRate(projectId, startDate, endDate),
          this.getBounceRate(projectId, prevPeriod.start, prevPeriod.end),
          this.getDailyTrafficOverview(projectId, startDate, endDate),
        ]);

        return {
          range: { start: startDate, end: endDate },
          comparison: { start: prevPeriod.start, end: prevPeriod.end },
          totalVisitsCurrent,
          totalVisitsPrevious,
          avgSessionCurrent,
          avgSessionPrevious,
          bounceRateCurrent,
          bounceRatePrevious,
          dailyTraffic,
        };
      }
    );
  }
}

export const overviewAnalyticsRepository = new OverviewAnalyticsRepository();
