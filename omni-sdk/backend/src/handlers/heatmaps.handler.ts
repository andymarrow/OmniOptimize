import { heatmapRepository } from "../repositories";

/**
 * Heatmap handler - fetch aggregated heatmap data for a URL
 * No Hono/OpenAPI code, just business logic
 */
export async function getHeatmapHandler(projectId: string, url: string) {
  if (!projectId || !url) {
    return {
      error: "projectId and url are required",
      statusCode: 400,
    };
  }

  // Decode URL if it's encoded
  const decodedUrl = decodeURIComponent(url);

  const clicks = await heatmapRepository.getHeatmapForUrl(
    projectId,
    decodedUrl
  );

  if (clicks.length === 0) {
    return {
      data: {
        projectId,
        url: decodedUrl,
        clickCount: 0,
        grid: [],
      },
      statusCode: 200,
    };
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
    selector: click.selector,
    tagName: click.tagName,
    elementTextHash: click.elementTextHash,
    screenClass: click.screenClass,
  }));

  return {
    data: {
      projectId,
      url: decodedUrl,
      clickCount: totalClicks,
      gridSize: 50,
      screenClasses,
      pageWidth: clicks[0]?.pageWidth,
      pageHeight: clicks[0]?.pageHeight,
      grid: gridData,
    },
    statusCode: 200,
  };
}

/**
 * List heatmaps handler - list all URLs with heatmap data
 */
export async function listHeatmapsHandler(projectId: string) {
  if (!projectId) {
    return {
      error: "projectId is required",
      statusCode: 400,
    };
  }

  return {
    data: {
      projectId,
      message: "Use GET /heatmaps/:projectId/:url to fetch specific heatmaps",
    },
    statusCode: 200,
  };
}
