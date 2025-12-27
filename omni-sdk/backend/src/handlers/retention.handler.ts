import { retentionRepository } from "../repositories";
import { retentionQuerySchema } from "../schemas/retention";

/**
 * Retention handler - provides cohort-based user retention analysis
 * No Hono/OpenAPI code, just business logic
 */
export async function getRetentionHandler(queryParams: {
  projectId?: string;
  startDate?: string;
  endDate?: string;
  intervals?: string;
}) {
  // Parse and validate with Zod
  const parsedQuery = retentionQuerySchema.safeParse(queryParams);

  if (!parsedQuery.success) {
    return {
      error: "Validation failed",
      details: parsedQuery.error.errors.map((e) => ({
        path: e.path.join("."),
        message: e.message,
      })),
      statusCode: 400,
    };
  }

  const { projectId, startDate, endDate, intervals } = parsedQuery.data;

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

    const day0Pct = cohort.size > 0 ? 1.0 : 0;
    retentionPercentages[0] = day0Pct;

    for (const interval of intervals) {
      if (interval === 0) continue;
      const retainedCount = cohort.retention[interval] || 0;
      const pct =
        cohort.size > 0
          ? parseFloat((retainedCount / cohort.size).toFixed(2))
          : 0;
      retentionPercentages[interval] = pct;
    }

    return {
      date: cohort.date,
      size: cohort.size,
      retention: retentionPercentages,
    };
  });

  return {
    data: { cohorts },
    statusCode: 200,
  };
}
