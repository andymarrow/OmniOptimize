import { Hono } from "hono";
import { describeRoute, resolver } from "hono-openapi";
import { getHeatmapHandler, listHeatmapsHandler } from "../handlers";
import { z } from "zod";

/**
 * Create heatmaps router
 */
export function createHeatmapsRouter() {
  const router = new Hono();

  /**
   * GET /heatmaps/:projectId/:url
   * Fetch aggregated heatmap data for a URL
   */
  router.get(
    "/:projectId/:url",
    describeRoute({
      description: "Fetch aggregated heatmap data for a specific URL",
      responses: {
        200: {
          description: "Heatmap data retrieved",
          content: {
            "application/json": {
              schema: resolver(
                z.object({
                  data: z.object({
                    projectId: z.string(),
                    url: z.string(),
                    clickCount: z.number(),
                    gridSize: z.number().optional(),
                    screenClasses: z.array(z.string()).optional(),
                    pageWidth: z.number().optional(),
                    pageHeight: z.number().optional(),
                    grid: z.array(z.record(z.any())),
                  }),
                })
              ),
            },
          },
        },
        400: {
          description: "Missing projectId or url",
          content: {
            "application/json": {
              schema: resolver(z.object({ error: z.string() })),
            },
          },
        },
      },
    }),
    async (c) => {
      const projectId = c.req.param("projectId");
      const url = c.req.param("url");
      const result = await getHeatmapHandler(projectId, url);

      if ("error" in result) {
        return c.json(
          { error: result.error },
          (result.statusCode || 400) as 400
        );
      }

      return c.json(result.data, 200);
    }
  );

  /**
   * GET /heatmaps/:projectId
   * List all URLs with heatmap data available
   */
  router.get(
    "/:projectId",
    describeRoute({
      description: "List information about available heatmaps for a project",
      responses: {
        200: {
          description: "Heatmaps information retrieved",
          content: {
            "application/json": {
              schema: resolver(
                z.object({
                  data: z.object({
                    projectId: z.string(),
                    message: z.string(),
                  }),
                })
              ),
            },
          },
        },
        400: {
          description: "Missing projectId",
          content: {
            "application/json": {
              schema: resolver(z.object({ error: z.string() })),
            },
          },
        },
      },
    }),
    async (c) => {
      const projectId = c.req.param("projectId");
      const result = await listHeatmapsHandler(projectId);

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
