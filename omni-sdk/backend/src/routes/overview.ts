import { Hono } from "hono";
import { z } from "zod";
import { overviewAnalyticsRepository } from "../repositories";
import {
  overviewQuerySchema,
  overviewResponseSchema,
} from "../schemas/overview";

const app = new Hono();

/**
 * GET /analytics/overview
 *
 * Executive summary dashboard with key metrics
 * - Total visits (session count)
 * - Avg session duration (seconds)
 * - Bounce rate (%)
 * - Daily traffic overview (visitors + bounce rate)
 *
 * Query params:
 * - projectId: string (required)
 * - startDate: ISO date YYYY-MM-DD (optional, defaults to last 30 days)
 * - endDate: ISO date YYYY-MM-DD (optional, defaults to today)
 *
 * All periods auto-calculated with previous period comparison
 */
app.get("/", async (c) => {
  try {
    // Default to last 30 days if not specified
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const formatDate = (d: Date) => d.toISOString().split("T")[0];
    const defaultEndDate = formatDate(today);
    const defaultStartDate = formatDate(thirtyDaysAgo);

    // Validate query parameters
    const queryParams = {
      projectId: c.req.query("projectId"),
      startDate: c.req.query("startDate") || defaultStartDate,
      endDate: c.req.query("endDate") || defaultEndDate,
    };

    const query = overviewQuerySchema.parse(queryParams);

    // Fetch raw metrics from repository
    const metrics = await overviewAnalyticsRepository.getOverviewAnalytics(
      query.projectId,
      queryParams.startDate,
      queryParams.endDate
    );

    // Calculate percentage changes
    const calculateChangePct = (current: number, previous: number): number => {
      if (previous === 0) {
        return current > 0 ? 100 : 0;
      }
      return parseFloat((((current - previous) / previous) * 100).toFixed(2));
    };

    // Transform to response format
    const response = overviewResponseSchema.parse({
      range: metrics.range,
      comparison: metrics.comparison,
      cards: {
        totalVisits: {
          current: metrics.totalVisitsCurrent,
          previous: metrics.totalVisitsPrevious,
          changePct: calculateChangePct(
            metrics.totalVisitsCurrent,
            metrics.totalVisitsPrevious
          ),
        },
        avgSession: {
          current: parseFloat(metrics.avgSessionCurrent.toFixed(2)),
          previous: parseFloat(metrics.avgSessionPrevious.toFixed(2)),
          changePct: calculateChangePct(
            metrics.avgSessionCurrent,
            metrics.avgSessionPrevious
          ),
        },
        bounceRate: {
          current: metrics.bounceRateCurrent,
          previous: metrics.bounceRatePrevious,
          changePct: calculateChangePct(
            metrics.bounceRateCurrent,
            metrics.bounceRatePrevious
          ),
        },
      },
      chart: {
        trafficOverview: metrics.dailyTraffic,
      },
    });

    return c.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json(
        {
          error: "Validation failed",
          details: error.errors,
        },
        400
      );
    }

    console.error("[overview] Error:", error);
    return c.json(
      {
        error: "Internal server error",
      },
      500
    );
  }
});

export default app;
