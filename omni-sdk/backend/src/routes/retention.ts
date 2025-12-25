import { Hono } from "hono";
import { retentionRepository } from "../repositories";

/**
 * Retention Analytics Route
 * Provides cohort-based user retention analysis
 *
 * API contract:
 * - Input: projectId, date range, retention intervals
 * - Output: cohorts with size and day-N retention percentages
 */

export const retentionRouter = new Hono();

/**
 * GET /analytics/retention
 *
 * Query parameters:
 * - projectId (required): Project identifier
 * - startDate (required): ISO date (YYYY-MM-DD), first cohort date in UTC
 * - endDate (required): ISO date (YYYY-MM-DD), last cohort date in UTC
 * - intervals (optional): Comma-separated day offsets (default: 0,1,3,7,14,30)
 *
 * Response shape:
 * {
 *   "cohorts": [
 *     {
 *       "date": "2025-01-01",
 *       "size": 120,
 *       "retention": {
 *         "0": 1.0,
 *         "1": 0.42,
 *         "3": 0.31,
 *         "7": 0.18,
 *         "14": 0.12,
 *         "30": 0.06
 *       }
 *     }
 *   ]
 * }
 *
 * Notes:
 * - Retention values are percentages (0-1)
 * - Day 0 retention = 100% (all cohort members by definition)
 * - Empty cohorts (size = 0) included in results
 * - All date calculations in UTC
 */
retentionRouter.get("/retention", async (c) => {
  try {
    // Parse query parameters
    const projectId = c.req.query("projectId");
    const startDate = c.req.query("startDate");
    const endDate = c.req.query("endDate");
    const intervalsParam = c.req.query("intervals") || "0,1,3,7,14,30";

    // Validate required parameters
    if (!projectId || !startDate || !endDate) {
      return c.json(
        {
          error: "Missing required parameters: projectId, startDate, endDate",
        },
        400
      );
    }

    // Validate date format (ISO 8601)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      return c.json(
        {
          error: "Invalid date format. Use ISO 8601 (YYYY-MM-DD)",
        },
        400
      );
    }

    // Validate date range
    if (startDate > endDate) {
      return c.json(
        {
          error: "startDate must be <= endDate",
        },
        400
      );
    }

    // Parse intervals
    const intervals = intervalsParam
      .split(",")
      .map((i) => parseInt(i.trim(), 10))
      .filter((i) => !isNaN(i) && i >= 0);

    if (intervals.length === 0) {
      return c.json(
        {
          error:
            "Invalid intervals: must be comma-separated non-negative integers",
        },
        400
      );
    }

    // Fetch retention data
    const cohortData = await retentionRepository.getRetentionCohorts(
      projectId,
      startDate,
      endDate,
      intervals
    );

    // Transform counts to percentages
    const cohorts = cohortData.map((cohort) => {
      const retentionPercentages: Record<number, number> = {};

      // Day 0 always 100% if cohort has members
      const day0Pct = cohort.size > 0 ? 1.0 : 0;
      retentionPercentages[0] = day0Pct;

      // Other days: count / cohort size
      for (const interval of intervals) {
        if (interval === 0) continue; // Skip day 0, already handled
        const retainedCount = cohort.retention[interval] || 0;
        const pct =
          cohort.size > 0
            ? parseFloat((retainedCount / cohort.size).toFixed(4))
            : 0;
        retentionPercentages[interval] = pct;
      }

      return {
        date: cohort.date,
        size: cohort.size,
        retention: retentionPercentages,
      };
    });

    return c.json(
      {
        cohorts,
      },
      200
    );
  } catch (error) {
    console.error("[RetentionRoute] Error fetching retention data:", error);
    return c.json(
      {
        error: "Failed to fetch retention data",
      },
      500
    );
  }
});

export default retentionRouter;
