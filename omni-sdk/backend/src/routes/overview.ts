import { Hono } from "hono";
import { describeRoute, resolver, validator } from "hono-openapi";
import { getOverviewAnalyticsHandler } from "../handlers";
import {
  overviewQuerySchema,
  overviewResponseSchema,
} from "../schemas/overview";
import { z } from "zod";

/**
 * Create overview router
 */
export function createOverviewRouter() {
  const router = new Hono();

  /**
   * GET /overview
   * Executive summary dashboard with key metrics
   */
  router.get(
    "/",
    describeRoute({
      description:
        "Get executive summary dashboard with key metrics (visits, session duration, bounce rate, daily traffic)",
      responses: {
        200: {
          description: "Overview analytics retrieved",
          content: {
            "application/json": {
              schema: resolver(overviewResponseSchema),
            },
          },
        },
        400: {
          description: "Validation error in query parameters",
          content: {
            "application/json": {
              schema: resolver(z.object({ error: z.string() })),
            },
          },
        },
      },
    }),
    validator("query", overviewQuerySchema),
    async (c) => {
      const queryRaw = {
        projectId: c.req.query("projectId"),
        startDate: c.req.query("startDate"),
        endDate: c.req.query("endDate"),
      };
      const result = await getOverviewAnalyticsHandler(queryRaw);

      if ("error" in result) {
        return c.json(
          { error: result.error },
          (result.statusCode || 400) as 400
        );
      }

      return c.json(result.data, 200);
    }
  );

  return router;
}

// Export default instance (overridden in index.ts)
export default new Hono();
