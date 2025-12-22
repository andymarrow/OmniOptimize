import { sessionRepository } from "../repositories";
import { heatmapRepository } from "../repositories";
import type { ClickEventData } from "../types";

/**
 * Process click events
 * - Upsert session
 * - Aggregate clicks into heatmap grid
 * - Increment bucket counter
 */
export async function processClickEvent(event: ClickEventData) {
  try {
    // Ensure session exists
    await sessionRepository.upsertSession({
      sessionId: event.sessionId,
      projectId: event.projectId,
      clientId: event.clientId,
      userId: event.userId || null,
    });

    // Record click in heatmap
    await heatmapRepository.recordClick({
      projectId: event.projectId,
      sessionId: event.sessionId,
      url: event.url,
      xNorm: event.xNorm,
      yNorm: event.yNorm,
      pageX: event.pageX,
      pageY: event.pageY,
      selector: event.selector,
      tagName: event.tagName,
      elementTextHash: event.elementTextHash,
      screenClass: event.screenClass,
      layoutHash: event.layoutHash,
      pageWidth: event.pageDimensions?.w,
      pageHeight: event.pageDimensions?.h,
      viewportWidth: event.viewport?.w,
      viewportHeight: event.viewport?.h,
    });

    console.log(`[ClickProcessor] Processed event ${event.eventId}`);
  } catch (error) {
    console.error(
      `[ClickProcessor] Error processing event ${event.eventId}:`,
      error
    );
    throw error;
  }
}
