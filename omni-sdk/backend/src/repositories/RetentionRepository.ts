import { db } from "../db/client";
import { sql } from "drizzle-orm";
import { withErrorHandling } from "./BaseRepository";

/**
 * Retention Analytics Repository
 * Handles all retention cohort queries using raw SQL for performance
 *
 * Definition:
 * - Cohort: users who first appeared on a specific date (cohortDate)
 * - Day-N retention: percentage of cohort with any activity on cohortDate + N days
 * - Identity: distinctId (userId ?? clientId)
 * - All dates in UTC
 */
export class RetentionRepository {
  /**
   * Get cohort size for a specific date
   * Returns count of unique users (distinctIds) who first appeared on cohortDate
   *
   * @param projectId - Project identifier
   * @param cohortDate - ISO date string (YYYY-MM-DD) in UTC
   */
  async getCohortSize(projectId: string, cohortDate: string): Promise<number> {
    return withErrorHandling("RetentionRepository.getCohortSize", async () => {
      const result = await db.execute(sql`
        SELECT COUNT(DISTINCT distinct_id) as count
        FROM users
        WHERE project_id = ${projectId}
        AND DATE(first_seen_at AT TIME ZONE 'UTC') = ${cohortDate}::date
      `);

      return Number(result.rows[0]?.count || 0);
    });
  }

  /**
   * Get day-N retention count for a cohort
   * Returns count of users from cohort who had activity on cohortDate + N days
   *
   * @param projectId - Project identifier
   * @param cohortDate - ISO date string (YYYY-MM-DD) in UTC (cohort start date)
   * @param daysAfter - Number of days after cohort start (0 = same day, 1 = next day, etc.)
   */
  async getRetentionCount(
    projectId: string,
    cohortDate: string,
    daysAfter: number
  ): Promise<number> {
    return withErrorHandling(
      "RetentionRepository.getRetentionCount",
      async () => {
        const result = await db.execute(sql`
          SELECT COUNT(DISTINCT u.distinct_id) as count
          FROM users u
          INNER JOIN user_daily_activity a
            ON a.project_id = u.project_id
            AND a.distinct_id = u.distinct_id
          WHERE u.project_id = ${projectId}
          AND DATE(u.first_seen_at AT TIME ZONE 'UTC') = ${cohortDate}::date
          AND a.activity_date = (${cohortDate}::date + (${daysAfter} || ' days')::interval)
        `);

        return Number(result.rows[0]?.count || 0);
      }
    );
  }

  /**
   * Get full retention matrix for a cohort across multiple intervals
   * Optimized to fetch all intervals in a single query for performance
   *
   * @param projectId - Project identifier
   * @param cohortDate - ISO date string (YYYY-MM-DD) in UTC
   * @param intervals - Array of day offsets (e.g., [0, 1, 3, 7, 14, 30])
   * @returns Map of { dayOffset => retentionCount }
   */
  async getRetentionMatrix(
    projectId: string,
    cohortDate: string,
    intervals: number[]
  ): Promise<Map<number, number>> {
    return withErrorHandling(
      "RetentionRepository.getRetentionMatrix",
      async () => {
        if (intervals.length === 0) {
          return new Map();
        }

        // Build UNION query for all intervals
        // Each interval checks if user had activity on cohortDate + N days
        const unionClauses = intervals
          .map(
            (dayOffset) =>
              sql`
                SELECT 
                  ${dayOffset}::int as day_offset,
                  COUNT(DISTINCT u.distinct_id) as count
                FROM users u
                INNER JOIN user_daily_activity a
                  ON a.project_id = u.project_id
                  AND a.distinct_id = u.distinct_id
                WHERE u.project_id = ${projectId}
                AND DATE(u.first_seen_at AT TIME ZONE 'UTC') = ${cohortDate}::date
                AND a.activity_date = (${cohortDate}::date + (${dayOffset} || ' days')::interval)
              `
          )
          .reduce((acc, clause, idx) => {
            if (idx === 0) return clause;
            return sql`${acc} UNION ALL ${clause}`;
          });

        const result = await db.execute(unionClauses);

        // Convert to map
        const retentionMap = new Map<number, number>();
        for (const row of result.rows) {
          retentionMap.set(Number(String(row.day_offset)), Number(row.count));
        }

        return retentionMap;
      }
    );
  }

  /**
   * Get retention data for multiple cohorts in a date range
   * Returns structured data ready for API response
   *
   * @param projectId - Project identifier
   * @param startDate - ISO date string (YYYY-MM-DD), first cohort date
   * @param endDate - ISO date string (YYYY-MM-DD), last cohort date
   * @param intervals - Array of day offsets to calculate retention for
   */
  async getRetentionCohorts(
    projectId: string,
    startDate: string,
    endDate: string,
    intervals: number[]
  ): Promise<
    Array<{
      date: string;
      size: number;
      retention: Record<number, number>; // dayOffset => count
    }>
  > {
    return withErrorHandling(
      "RetentionRepository.getRetentionCohorts",
      async () => {
        // Get all unique cohort dates that have at least one user
        const cohortDatesResult = await db.execute(sql`
          SELECT DISTINCT DATE(first_seen_at AT TIME ZONE 'UTC') as cohort_date
          FROM users
          WHERE project_id = ${projectId}
          AND DATE(first_seen_at AT TIME ZONE 'UTC') >= ${startDate}::date
          AND DATE(first_seen_at AT TIME ZONE 'UTC') <= ${endDate}::date
          ORDER BY cohort_date ASC
        `);

        const cohorts = [];

        for (const row of cohortDatesResult.rows) {
          const cohortDate = String(row.cohort_date);

          // Get cohort size
          const sizeResult = await db.execute(sql`
            SELECT COUNT(DISTINCT distinct_id) as count
            FROM users
            WHERE project_id = ${projectId}
            AND DATE(first_seen_at AT TIME ZONE 'UTC') = ${cohortDate}::date
          `);
          const size = Number(sizeResult.rows[0]?.count || 0);

          // Get retention matrix for all intervals
          const retentionMap = await this.getRetentionMatrix(
            projectId,
            cohortDate,
            intervals
          );

          // Build retention record: dayOffset => count
          const retention: Record<number, number> = {};
          for (const interval of intervals) {
            retention[interval] = retentionMap.get(interval) || 0;
          }

          cohorts.push({
            date: cohortDate,
            size,
            retention,
          });
        }

        return cohorts;
      }
    );
  }
}

export const retentionRepository = new RetentionRepository();
