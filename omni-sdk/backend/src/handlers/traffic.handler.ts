import { trafficAnalyticsRepository } from "../repositories";
import { trafficAnalyticsQuerySchema } from "../schemas/traffic";

/**
 * Traffic analytics handler - dashboard metrics for traffic analytics
 * No Hono/OpenAPI code, just business logic
 */
export async function getTrafficAnalyticsHandler(queryParams: {
  projectId?: string;
  startDate?: string;
  endDate?: string;
  timezone?: string;
}) {
  // Validate query parameters
  const query = trafficAnalyticsQuerySchema.safeParse({
    projectId: queryParams.projectId,
    startDate: queryParams.startDate,
    endDate: queryParams.endDate,
    timezone: queryParams.timezone || "UTC",
  });

  if (!query.success) {
    return {
      error: "Validation failed",
      details: query.error.errors,
      statusCode: 400,
    };
  }

  const params = query.data;

  // Fetch raw metrics from repository
  const metrics = await trafficAnalyticsRepository.getTrafficAnalytics(
    params.projectId,
    params.startDate,
    params.endDate
  );

  // Fetch device distribution
  const deviceDistribution =
    await trafficAnalyticsRepository.getDeviceDistribution(
      params.projectId,
      params.startDate,
      params.endDate
    );

  // Transform to response format with comparison percentages
  const response = {
    range: metrics.range,
    comparison: metrics.comparison,
    timezone: params.timezone,
    cards: {
      activeUsers: {
        current: metrics.activeUsersCurrent,
        previous: metrics.activeUsersPrevious,
        changePct:
          metrics.activeUsersPrevious > 0
            ? parseFloat(
                (
                  ((metrics.activeUsersCurrent - metrics.activeUsersPrevious) /
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
                  ((metrics.totalClicksCurrent - metrics.totalClicksPrevious) /
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
    devices: {
      distribution: deviceDistribution,
    },
  };

  return {
    data: response,
    statusCode: 200,
  };
}
