import { Hono } from "hono";
import { describeRoute, resolver, validator } from "hono-openapi";
import { getTrafficAnalyticsHandler } from "../handlers";
import {
  trafficAnalyticsQuerySchema,
  trafficAnalyticsResponseSchema,
} from "../schemas/traffic";
import { z } from "zod";

/**
 * Create traffic router
 */
export function createTrafficRouter() {
  const router = new Hono();

  /**
   * GET /traffic
   * Dashboard metrics for traffic analytics
   */
  router.get(
    "/",
    describeRoute({
      description:
        "Get traffic analytics dashboard metrics (active users, session time, clicks, visitor growth, device distribution)",
      responses: {
        200: {
          description: "Traffic analytics retrieved",
          content: {
            "application/json": {
              schema: resolver(trafficAnalyticsResponseSchema),
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
    validator("query", trafficAnalyticsQuerySchema),
    async (c) => {
      const queryRaw = {
        projectId: c.req.query("projectId"),
        startDate: c.req.query("startDate"),
        endDate: c.req.query("endDate"),
        timezone: c.req.query("timezone"),
      };
      const result = await getTrafficAnalyticsHandler(queryRaw);

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
