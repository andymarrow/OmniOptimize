import { topPagesRepository } from "../repositories";
import { topPagesQuerySchema } from "../schemas/topPages";

/**
 * Top pages handler - returns top visited pages with metrics
 * No Hono/OpenAPI code, just business logic
 */
export async function getTopPagesHandler(queryParams: {
  projectId?: string;
  startDate?: string;
  endDate?: string;
  limit?: string;
}) {
  // Validate query parameters
  const query = topPagesQuerySchema.safeParse({
    projectId: queryParams.projectId,
    startDate: queryParams.startDate,
    endDate: queryParams.endDate,
    limit: queryParams.limit,
  });

  if (!query.success) {
    return {
      error: "Validation failed",
      details: query.error.errors,
      statusCode: 400,
    };
  }

  // Fetch top pages from repository
  const pages = await topPagesRepository.getTopPages(
    query.data.projectId,
    query.data.startDate,
    query.data.endDate,
    query.data.limit
  );

  // Return response
  const response = {
    range: {
      startDate: query.data.startDate,
      endDate: query.data.endDate,
    },
    pages,
  };

  return {
    data: response,
    statusCode: 200,
  };
}
