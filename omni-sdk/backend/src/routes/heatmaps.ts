import { heatmapRepository } from "../repositories";
import type { Context } from "hono";

/**
 * GET /heatmaps/:projectId/:url
 * Fetch aggregated heatmap data for a URL
 * Returns grid buckets with click counts
 */
export async function getHeatmapHandler(c: Context) {
  try {
    const projectId = c.req.param("projectId");
    const url = c.req.param("url");

    if (!projectId || !url) {
      return c.json({ error: "projectId and url are required" }, 400);
    }

    // Decode URL if it's encoded
    const decodedUrl = decodeURIComponent(url);

    const clicks = await heatmapRepository.getHeatmapForUrl(
      projectId,
      decodedUrl
    );

    if (clicks.length === 0) {
      return c.json(
        {
          projectId,
          url: decodedUrl,
          clickCount: 0,
          grid: [],
        },
        200
      );
    }

    // Calculate aggregate stats
    const totalClicks = clicks.reduce((sum, c) => sum + (c.count || 1), 0);
    const screenClasses = [
      ...new Set(clicks.map((c) => c.screenClass).filter(Boolean)),
    ];

    // Return grid data optimized for heatmap rendering
    const gridData = clicks.map((click) => ({
      gridX: click.gridX,
      gridY: click.gridY,
      count: click.count || 1,
      xNorm: parseFloat(click.xNorm.toString()),
      yNorm: parseFloat(click.yNorm.toString()),
      // Optional: element info for tooltips
      selector: click.selector,
      tagName: click.tagName,
      elementTextHash: click.elementTextHash,
      screenClass: click.screenClass,
    }));

    return c.json({
      projectId,
      url: decodedUrl,
      clickCount: totalClicks,
      gridSize: 50, // 50x50 grid
      screenClasses,
      pageWidth: clicks[0]?.pageWidth,
      pageHeight: clicks[0]?.pageHeight,
      grid: gridData,
    });
  } catch (error) {
    console.error("[GetHeatmap] Error:", error);
    return c.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      500
    );
  }
}

/**
 * GET /heatmaps/:projectId
 * List all URLs with heatmap data for a project
 */
export async function listHeatmapsHandler(c: Context) {
  try {
    const projectId = c.req.param("projectId");

    if (!projectId) {
      return c.json({ error: "projectId is required" }, 400);
    }

    // For now, we'd need to query all unique URLs with clicks
    // This would require a different query or caching layer
    // TODO: Add a summary table or cached view
    return c.json({
      projectId,
      message: "Use GET /heatmaps/:projectId/:url to fetch specific heatmaps",
    });
  } catch (error) {
    console.error("[ListHeatmaps] Error:", error);
    return c.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      500
    );
  }
}
