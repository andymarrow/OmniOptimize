import { Hono } from "hono";
import { z } from "zod";
import { topPagesRepository } from "../repositories";
import {
  topPagesQuerySchema,
  topPagesResponseSchema,
} from "../schemas/topPages";

const app = new Hono();

/**
 * GET /analytics/top-pages
 *
 * Returns top visited pages with session-based time-on-page metrics
 *
 * Query params:
 * - projectId: string (required)
 * - startDate: ISO date YYYY-MM-DD (required)
 * - endDate: ISO date YYYY-MM-DD (required)
 * - limit: number (optional, defaults to 10, max 100)
 *
 * URL normalization (in SQL):
 * - Strips protocol and domain
 * - Removes query parameters
 * - Groups by path only
 *
 * Time-on-page calculation:
 * - Session-based using LEAD() window function
 * - Time = interval until next pageview in same session
 * - Excludes last pageview in session
 */
app.get("/", async (c) => {
  try {
    // Validate query parameters
    const query = topPagesQuerySchema.parse({
      projectId: c.req.query("projectId"),
      startDate: c.req.query("startDate"),
      endDate: c.req.query("endDate"),
      limit: c.req.query("limit"),
    });

    // Fetch top pages from repository
    const pages = await topPagesRepository.getTopPages(
      query.projectId,
      query.startDate,
      query.endDate,
      query.limit
    );

    // Transform to response format
    const response = topPagesResponseSchema.parse({
      range: {
        startDate: query.startDate,
        endDate: query.endDate,
      },
      pages,
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

    console.error("[top-pages] Error:", error);
    return c.json(
      {
        error: "Internal server error",
      },
      500
    );
  }
});

export default app;
