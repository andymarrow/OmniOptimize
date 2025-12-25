import { Hono } from "hono";
import { z } from "zod";
import { trafficAnalyticsRepository } from "../repositories";
import {
  trafficAnalyticsQuerySchema,
  trafficAnalyticsResponseSchema,
} from "../schemas/traffic";

const app = new Hono();

/**
 * GET /traffic-analytics
 *
 * Dashboard metrics for traffic analytics
 * - Active user counts (current vs previous period)
 * - Average session time (current vs previous period)
 * - Total clicks (current vs previous period)
 * - Visitor growth chart (daily unique users)
 * - User demographics by country
 *
 * Query params:
 * - projectId: string (required)
 * - startDate: ISO date YYYY-MM-DD (required)
 * - endDate: ISO date YYYY-MM-DD (required)
 * - timezone: string (optional, defaults to UTC)
 */
app.get("/", async (c) => {
  try {
    // Validate query parameters
    const query = trafficAnalyticsQuerySchema.parse({
      projectId: c.req.query("projectId"),
      startDate: c.req.query("startDate"),
      endDate: c.req.query("endDate"),
      timezone: c.req.query("timezone") || "UTC",
    });

    // Fetch raw metrics from repository
    const metrics = await trafficAnalyticsRepository.getTrafficAnalytics(
      query.projectId,
      query.startDate,
      query.endDate
    );

    // Transform to response format with comparison percentages
    const response = trafficAnalyticsResponseSchema.parse({
      range: metrics.range,
      comparison: metrics.comparison,
      timezone: query.timezone,
      cards: {
        activeUsers: {
          current: metrics.activeUsersCurrent,
          previous: metrics.activeUsersPrevious,
          changePct:
            metrics.activeUsersPrevious > 0
              ? parseFloat(
                  (
                    ((metrics.activeUsersCurrent -
                      metrics.activeUsersPrevious) /
                      metrics.activeUsersPrevious) *
                    100
                  ).toFixed(2)
                )
              : metrics.activeUsersCurrent > 0
                ? 100
                : 0,
        },
        avgSessionTime: {
          current: parseFloat(metrics.avgSessionTimeCurrent.toFixed(2)),
          previous: parseFloat(metrics.avgSessionTimePrevious.toFixed(2)),
          changePct:
            metrics.avgSessionTimePrevious > 0
              ? parseFloat(
                  (
                    ((metrics.avgSessionTimeCurrent -
                      metrics.avgSessionTimePrevious) /
                      metrics.avgSessionTimePrevious) *
                    100
                  ).toFixed(2)
                )
              : metrics.avgSessionTimeCurrent > 0
                ? 100
                : 0,
        },
        totalClicks: {
          current: metrics.totalClicksCurrent,
          previous: metrics.totalClicksPrevious,
          changePct:
            metrics.totalClicksPrevious > 0
              ? parseFloat(
                  (
                    ((metrics.totalClicksCurrent -
                      metrics.totalClicksPrevious) /
                      metrics.totalClicksPrevious) *
                    100
                  ).toFixed(2)
                )
              : metrics.totalClicksCurrent > 0
                ? 100
                : 0,
        },
      },
      charts: {
        visitorGrowth: metrics.visitorGrowth,
      },
      demographics: {
        countries: metrics.countries,
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

    console.error("[traffic-analytics] Error:", error);
    return c.json(
      {
        error: "Internal server error",
      },
      500
    );
  }
});

export default app;
