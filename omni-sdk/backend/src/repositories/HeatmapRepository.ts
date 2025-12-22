import { db } from "../db/client";
import { heatmapClicks } from "../db/schema";
import { eq, and } from "drizzle-orm";

export class HeatmapRepository {
  /**
   * Calculate grid bucket from normalized coordinates
   * Divides 0-1 range into a 50x50 grid (0-49)
   */
  private calculateGridBucket(norm: number): number {
    const gridSize = 50;
    const bucket = Math.floor(norm * gridSize);
    return Math.min(Math.max(bucket, 0), gridSize - 1);
  }

  /**
   * Increment click count for a grid bucket (upsert)
   * Idempotent: same click coordinates increment the same bucket
   */
  async recordClick({
    projectId,
    sessionId,
    url,
    xNorm,
    yNorm,
    pageX,
    pageY,
    selector,
    tagName,
    elementTextHash,
    screenClass,
    layoutHash,
    pageWidth,
    pageHeight,
    viewportWidth,
    viewportHeight,
  }: {
    projectId: string;
    sessionId: string;
    url: string;
    xNorm: number;
    yNorm: number;
    pageX?: number;
    pageY?: number;
    selector?: string;
    tagName?: string;
    elementTextHash?: string;
    screenClass?: string;
    layoutHash?: string;
    pageWidth?: number;
    pageHeight?: number;
    viewportWidth?: number;
    viewportHeight?: number;
  }) {
    try {
      const gridX = this.calculateGridBucket(xNorm);
      const gridY = this.calculateGridBucket(yNorm);

      // Try to find existing bucket for this URL + grid position + project
      const existing = await db
        .select()
        .from(heatmapClicks)
        .where(
          and(
            eq(heatmapClicks.projectId, projectId),
            eq(heatmapClicks.url, url),
            eq(heatmapClicks.gridX, gridX),
            eq(heatmapClicks.gridY, gridY)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        // Increment count
        const updated = await db
          .update(heatmapClicks)
          .set({
            count: existing[0].count + 1,
            lastClickAt: new Date(),
          })
          .where(eq(heatmapClicks.id, existing[0].id))
          .returning();

        return updated[0];
      } else {
        // Insert new bucket
        const result = await db
          .insert(heatmapClicks)
          .values({
            projectId,
            sessionId,
            url,
            gridX,
            gridY,
            xNorm: xNorm.toString(),
            yNorm: yNorm.toString(),
            pageX: pageX || null,
            pageY: pageY || null,
            selector: selector || null,
            tagName: tagName || null,
            elementTextHash: elementTextHash || null,
            screenClass: screenClass || null,
            layoutHash: layoutHash || null,
            pageWidth: pageWidth || null,
            pageHeight: pageHeight || null,
            viewportWidth: viewportWidth || null,
            viewportHeight: viewportHeight || null,
            count: 1,
          })
          .returning();

        return result[0];
      }
    } catch (error) {
      console.error("Error recording click:", error);
      throw error;
    }
  }

  /**
   * Get heatmap data for a URL
   */
  async getHeatmapForUrl(projectId: string, url: string) {
    try {
      return await db
        .select()
        .from(heatmapClicks)
        .where(
          and(
            eq(heatmapClicks.projectId, projectId),
            eq(heatmapClicks.url, url)
          )
        )
        .orderBy(heatmapClicks.gridX, heatmapClicks.gridY);
    } catch (error) {
      console.error("Error getting heatmap:", error);
      throw error;
    }
  }

  /**
   * Get heatmap data for a session
   */
  async getHeatmapForSession(sessionId: string) {
    try {
      return await db
        .select()
        .from(heatmapClicks)
        .where(eq(heatmapClicks.sessionId, sessionId));
    } catch (error) {
      console.error("Error getting session heatmap:", error);
      throw error;
    }
  }
}

export const heatmapRepository = new HeatmapRepository();
