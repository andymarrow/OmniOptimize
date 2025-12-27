import { overviewAnalyticsRepository } from "../repositories";
import { overviewQuerySchema } from "../schemas/overview";

/**
 * Overview analytics handler - executive summary dashboard
 * No Hono/OpenAPI code, just business logic
 */
export async function getOverviewAnalyticsHandler(queryParams: {
  projectId?: string;
  startDate?: string;
  endDate?: string;
}) {
  // Default to last 30 days if not specified
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const formatDate = (d: Date) => d.toISOString().split("T")[0];
  const defaultEndDate = formatDate(today);
  const defaultStartDate = formatDate(thirtyDaysAgo);

  // Validate query parameters
  const params = {
    projectId: queryParams.projectId,
    startDate: queryParams.startDate || defaultStartDate,
    endDate: queryParams.endDate || defaultEndDate,
  };

  const query = overviewQuerySchema.safeParse(params);

  if (!query.success) {
    return {
      error: "Validation failed",
      details: query.error.errors,
      statusCode: 400,
    };
  }

  // Fetch raw metrics from repository
  const metrics = await overviewAnalyticsRepository.getOverviewAnalytics(
    query.data.projectId,
    params.startDate,
    params.endDate
  );

  // Calculate percentage changes
  const calculateChangePct = (current: number, previous: number): number => {
    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }
    return parseFloat((((current - previous) / previous) * 100).toFixed(2));
  };

  // Transform to response format
  const response = {
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
  };

  return {
    data: response,
    statusCode: 200,
  };
}
