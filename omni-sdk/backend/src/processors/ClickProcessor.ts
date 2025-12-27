import { heatmapRepository } from "../repositories";
import { processBaseEvent, executeProcessor } from "./BaseEventProcessor";
import type { ClickEventData } from "../types";

/**
 * Process click events
 * - Base session/event tracking (centralized)
 * - Aggregate clicks into heatmap grid
 * - Increment bucket counter
 */
export async function processClickEvent(
  event: ClickEventData,
  location?: string,
  device?: string
) {
  await executeProcessor("ClickProcessor", event.eventId, async () => {
    // Base event processing (session upsert + event tracking)
    await processBaseEvent({
      event,
      eventType: "click",
      location,
      device,
      screenClass: event.screenClass,
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
  });
}
