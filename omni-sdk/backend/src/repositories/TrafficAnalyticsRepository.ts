import { db } from "../db/client";
import { sql } from "drizzle-orm";
import { withErrorHandling } from "./BaseRepository";

/**
 * Traffic Analytics Repository
 * Handles all dashboard metrics queries using raw SQL for performance
 *
 * Metrics:
 * - Visitor growth (daily unique users)
 * - Active users (unique distinct_id in range)
 * - Avg session time (duration in seconds)
 * - Total clicks (events where type = 'click')
 * - User demographics (country distribution)
 */
export class TrafficAnalyticsRepository {
  /**
   * Get daily unique user counts for visitor growth chart
   * One row per day with count of distinct users
   *
   * @param projectId - Project identifier
   * @param startDate - ISO date (YYYY-MM-DD)
   * @param endDate - ISO date (YYYY-MM-DD)
   */
  async getVisitorGrowth(
    projectId: string,
    startDate: string,
    endDate: string
  ): Promise<Array<{ date: string; value: number }>> {
    return withErrorHandling(
      "TrafficAnalyticsRepository.getVisitorGrowth",
      async () => {
        const result = await db.execute(sql`
        SELECT 
          activity_date::text as date,
          COUNT(DISTINCT distinct_id) as value
        FROM user_daily_activity
        WHERE project_id = ${projectId}
        AND activity_date >= ${startDate}::date
        AND activity_date <= ${endDate}::date
        GROUP BY activity_date
        ORDER BY activity_date ASC
      `);

        return (result.rows || []).map((row: any) => ({
          date: row.date,
          value: Number(row.value),
        }));
      }
    );
  }

  /**
   * Get count of unique active users in a date range
   *
   * @param projectId - Project identifier
   * @param startDate - ISO date (YYYY-MM-DD)
   * @param endDate - ISO date (YYYY-MM-DD)
   */
  async getActiveUserCount(
    projectId: string,
    startDate: string,
    endDate: string
  ): Promise<number> {
    return withErrorHandling(
      "TrafficAnalyticsRepository.getActiveUserCount",
      async () => {
        const result = await db.execute(sql`
        SELECT COUNT(DISTINCT distinct_id) as count
        FROM user_daily_activity
        WHERE project_id = ${projectId}
        AND activity_date >= ${startDate}::date
        AND activity_date <= ${endDate}::date
      `);

        return Number(result.rows[0]?.count || 0);
      }
    );
  }

  /**
   * Get average session duration in seconds for a date range
   * Calculates (updatedAt - createdAt) for all sessions in range
   *
   * @param projectId - Project identifier
   * @param startDate - ISO date (YYYY-MM-DD)
   * @param endDate - ISO date (YYYY-MM-DD)
   */
  async getAvgSessionTime(
    projectId: string,
    startDate: string,
    endDate: string
  ): Promise<number> {
    return withErrorHandling(
      "TrafficAnalyticsRepository.getAvgSessionTime",
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
   * Get total count of click events in a date range
   *
   * @param projectId - Project identifier
   * @param startDate - ISO date (YYYY-MM-DD)
   * @param endDate - ISO date (YYYY-MM-DD)
   */
  async getTotalClickCount(
    projectId: string,
    startDate: string,
    endDate: string
  ): Promise<number> {
    return withErrorHandling(
      "TrafficAnalyticsRepository.getTotalClickCount",
      async () => {
        const result = await db.execute(sql`
        SELECT COUNT(*) as count
        FROM events
        WHERE project_id = ${projectId}
        AND type = 'click'
        AND DATE(timestamp AT TIME ZONE 'UTC') >= ${startDate}::date
        AND DATE(timestamp AT TIME ZONE 'UTC') <= ${endDate}::date
      `);

        return Number(result.rows[0]?.count || 0);
      }
    );
  }

  /**
   * Get user distribution by country (first-seen country only)
   * Returns percentages for top countries
   *
   * @param projectId - Project identifier
   * @param startDate - ISO date. Users with first_seen_at on or after this date.
   * @param endDate - ISO date. Users with first_seen_at on or before this date.
   */
  async getUserDemographicsByCountry(
    projectId: string,
    startDate: string,
    endDate: string
  ): Promise<Array<{ country: string; percentage: number }>> {
    return withErrorHandling(
      "TrafficAnalyticsRepository.getUserDemographicsByCountry",
      async () => {
        const result = await db.execute(sql`
          WITH country_counts AS (
            SELECT 
              COALESCE(country, 'ET') as country,
              COUNT(*) as count
            FROM users
            WHERE project_id = ${projectId}
            AND DATE(first_seen_at AT TIME ZONE 'UTC') >= ${startDate}::date
            AND DATE(first_seen_at AT TIME ZONE 'UTC') <= ${endDate}::date
            GROUP BY country
          ),
          total AS (
            SELECT SUM(count) as total_users
            FROM country_counts
          )
          SELECT 
            country_counts.country,
            ROUND(
              (country_counts.count::numeric / total.total_users * 100)::numeric,
              2
            )::float as percentage
          FROM country_counts
          CROSS JOIN total
          WHERE total.total_users > 0
          ORDER BY country_counts.count DESC
        `);

        return (result.rows || []).map((row: any) => ({
          country: String(row.country),
          percentage: Number(row.percentage),
        }));
      }
    );
  }

  /**
   * Get device distribution by session count
   * Groups sessions by device type (desktop, mobile, tablet)
   * Ignores sessions with NULL device
   *
   * @param projectId - Project identifier
   * @param startDate - ISO date (YYYY-MM-DD)
   * @param endDate - ISO date (YYYY-MM-DD)
   */
  async getDeviceDistribution(
    projectId: string,
    startDate: string,
    endDate: string
  ): Promise<
    Array<{
      device: string;
      sessions: number;
      percentage: number;
    }>
  > {
    return withErrorHandling(
      "TrafficAnalyticsRepository.getDeviceDistribution",
      async () => {
        const result = await db.execute(sql`
          WITH device_counts AS (
            SELECT 
              device,
              COUNT(*) as session_count
            FROM sessions
            WHERE project_id = ${projectId}
            AND DATE(created_at AT TIME ZONE 'UTC') >= ${startDate}::date
            AND DATE(created_at AT TIME ZONE 'UTC') <= ${endDate}::date
            AND device IS NOT NULL
            GROUP BY device
          ),
          total AS (
            SELECT SUM(session_count) as total_sessions
            FROM device_counts
          )
          SELECT 
            device_counts.device,
            device_counts.session_count,
            ROUND(
              (device_counts.session_count::numeric / total.total_sessions * 100)::numeric,
              0
            )::integer as percentage
          FROM device_counts
          CROSS JOIN total
          WHERE total.total_sessions > 0
          ORDER BY device_counts.session_count DESC
        `);

        return (result.rows || []).map((row: any) => ({
          device: String(row.device),
          sessions: Number(row.session_count),
          percentage: Number(row.percentage),
        }));
      }
    );
  }

  /**
   * Calculate percentage change between two values
   * Handles division by zero and edge cases
   *
   * @param current - Current period value
   * @param previous - Previous period value
   * @returns Percentage change (e.g., 15.5 for +15.5%)
   */
  private calculateChangePct(current: number, previous: number): number {
    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }
    return parseFloat((((current - previous) / previous) * 100).toFixed(2));
  }

  /**
   * Get previous period date range (same length as current range)
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
   * Get complete traffic analytics dashboard data
   * Aggregates all metrics for the dashboard
   *
   * @param projectId - Project identifier
   * @param startDate - Current period start (ISO date)
   * @param endDate - Current period end (ISO date)
   */
  async getTrafficAnalytics(
    projectId: string,
    startDate: string,
    endDate: string
  ): Promise<{
    range: { start: string; end: string };
    comparison: { start: string; end: string };
    activeUsersCurrent: number;
    activeUsersPrevious: number;
    avgSessionTimeCurrent: number;
    avgSessionTimePrevious: number;
    totalClicksCurrent: number;
    totalClicksPrevious: number;
    visitorGrowth: Array<{ date: string; value: number }>;
    countries: Array<{ country: string; percentage: number }>;
  }> {
    return withErrorHandling(
      "TrafficAnalyticsRepository.getTrafficAnalytics",
      async () => {
        const prevPeriod = this.getPreviousPeriodDates(startDate, endDate);

        // Fetch all metrics in parallel
        const [
          activeUsersCurrent,
          activeUsersPrevious,
          avgSessionTimeCurrent,
          avgSessionTimePrevious,
          totalClicksCurrent,
          totalClicksPrevious,
          visitorGrowth,
          countries,
        ] = await Promise.all([
          this.getActiveUserCount(projectId, startDate, endDate),
          this.getActiveUserCount(projectId, prevPeriod.start, prevPeriod.end),
          this.getAvgSessionTime(projectId, startDate, endDate),
          this.getAvgSessionTime(projectId, prevPeriod.start, prevPeriod.end),
          this.getTotalClickCount(projectId, startDate, endDate),
          this.getTotalClickCount(projectId, prevPeriod.start, prevPeriod.end),
          this.getVisitorGrowth(projectId, startDate, endDate),
          this.getUserDemographicsByCountry(projectId, startDate, endDate),
        ]);

        return {
          range: { start: startDate, end: endDate },
          comparison: { start: prevPeriod.start, end: prevPeriod.end },
          activeUsersCurrent,
          activeUsersPrevious,
          avgSessionTimeCurrent,
          avgSessionTimePrevious,
          totalClicksCurrent,
          totalClicksPrevious,
          visitorGrowth,
          countries,
        };
      }
    );
  }
}

export const trafficAnalyticsRepository = new TrafficAnalyticsRepository();
