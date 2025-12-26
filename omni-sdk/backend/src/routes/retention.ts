import { Hono } from "hono";
import { describeRoute, resolver, validator } from "hono-openapi";
import { getRetentionHandler } from "../handlers";
import {
  retentionQuerySchema,
  retentionResponseSchema,
} from "../schemas/retention";
import { z } from "zod";

/**
 * Create retention router
 */
export function createRetentionRouter() {
  const router = new Hono();

  /**
   * GET /retention
   * Provides cohort-based user retention analysis
   */
  router.get(
    "/",
    describeRoute({
      description:
        "Get user retention cohort analysis for a project over a date range",
      responses: {
        200: {
          description: "Retention cohort data retrieved",
          content: {
            "application/json": {
              schema: resolver(retentionResponseSchema),
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
    validator("query", retentionQuerySchema),
    async (c) => {
      const queryRaw = {
        projectId: c.req.query("projectId"),
        startDate: c.req.query("startDate"),
        endDate: c.req.query("endDate"),
        intervals: c.req.query("intervals"),
      };
      const result = await getRetentionHandler(queryRaw);

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
