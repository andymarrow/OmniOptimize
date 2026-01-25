import { heatmapRepository } from "../repositories";

/**
 * Heatmap handler - fetch aggregated heatmap data for a specific URL
 * This function only contains business logic, no Hono/OpenAPI framework code
 */
export async function getHeatmapHandler(projectId: string, url: string) {
  // Validate that both projectId and url are provided
  if (!projectId || !url) {
    return {
      error: "projectId and url are required", // Return error if missing
      statusCode: 400, // HTTP 400 Bad Request
    };
  }

  // Decode URL if it has been URL-encoded (e.g., spaces become %20)
  const decodedUrl = decodeURIComponent(url);

  // Fetch heatmap click data for this project and URL from the repository
  const clicks = await heatmapRepository.getHeatmapForUrl(
    projectId,
    decodedUrl
  );

  // If no clicks exist for this URL, return a default response
  if (clicks.length === 0) {
    return {
      data: {
        projectId,
        url: decodedUrl,
        clickCount: 0, // No clicks
        grid: [], // Empty grid
      },
      statusCode: 200, // HTTP 200 OK
    };
  }

  // Calculate total clicks by summing the 'count' of each click entry
  // If 'count' is missing, assume 1 click
  const totalClicks = clicks.reduce((sum, c) => sum + (c.count || 1), 0);

  // Extract all unique screen classes from the clicks for different device/screen sizes
  const screenClasses = [
    ...new Set(clicks.map((c) => c.screenClass).filter(Boolean)), // Remove null/undefined
  ];

  // Map raw click data into a grid structure optimized for heatmap rendering
  const gridData = clicks.map((click) => ({
    gridX: click.gridX, // Grid X coordinate
    gridY: click.gridY, // Grid Y coordinate
    count: click.count || 1, // Click count for this cell
    xNorm: parseFloat(click.xNorm.toString()), // Normalized X position (0-1)
    yNorm: parseFloat(click.yNorm.toString()), // Normalized Y position (0-1)
    selector: click.selector, // CSS selector of clicked element
    tagName: click.tagName, // HTML tag name
    elementTextHash: click.elementTextHash, // Hash of element text
    screenClass: click.screenClass, // Screen class (desktop, mobile, etc.)
  }));

  // Return the aggregated heatmap data
  return {
    data: {
      projectId,
      url: decodedUrl,
      clickCount: totalClicks, // Total clicks on this URL
      gridSize: 50, // Size of the grid for rendering
      screenClasses, // All detected screen classes
      pageWidth: clicks[0]?.pageWidth, // Width of the page (from first click entry)
      pageHeight: clicks[0]?.pageHeight, // Height of the page (from first click entry)
      grid: gridData, // Heatmap grid data
    },
    statusCode: 200,
  };
}

/**
 * List heatmaps handler - list all URLs that have heatmap data for a project
 */
export async function listHeatmapsHandler(projectId: string) {
  // Validate projectId
  if (!projectId) {
    return {
      error: "projectId is required", // Return error if missing
      statusCode: 400, // HTTP 400 Bad Request
    };
  }

  // Return a placeholder response listing URLs should be fetched individually
  return {
    data: {
      projectId,
      message: "Use GET /heatmaps/:projectId/:url to fetch specific heatmaps", // Guidance
    },
    statusCode: 200,
  };
}
