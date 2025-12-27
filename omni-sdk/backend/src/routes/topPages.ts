import { Hono } from "hono";
import { describeRoute, resolver, validator } from "hono-openapi";
import { getTopPagesHandler } from "../handlers";
import {
  topPagesQuerySchema,
  topPagesResponseSchema,
} from "../schemas/topPages";
import { z } from "zod";

/**
 * Create top pages router
 */
export function createTopPagesRouter() {
  const router = new Hono();

  /**
   * GET /top-pages
   * Returns top visited pages with metrics
   */
  router.get(
    "/",
    describeRoute({
      description:
        "Get top visited pages with session-based metrics (visits, avg time on page)",
      responses: {
        200: {
          description: "Top pages retrieved",
          content: {
            "application/json": {
              schema: resolver(topPagesResponseSchema),
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
    validator("query", topPagesQuerySchema),
    async (c) => {
      const queryRaw = {
        projectId: c.req.query("projectId"),
        startDate: c.req.query("startDate"),
        endDate: c.req.query("endDate"),
        limit: c.req.query("limit"),
      };
      const result = await getTopPagesHandler(queryRaw);

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
