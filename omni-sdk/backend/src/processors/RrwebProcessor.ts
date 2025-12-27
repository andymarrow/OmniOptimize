import { rrwebRepository } from "../repositories";
import { processBaseEvent, executeProcessor } from "./BaseEventProcessor";
import type { RrwebEventData } from "../types";

/**
 * Process rrweb replay events
 * - Base session/event tracking (centralized)
 * - Store raw rrweb payload verbatim
 * - Preserve ordering by timestamp
 */
export async function processRrwebEvent(
  event: RrwebEventData,
  location?: string,
  device?: string
) {
  await executeProcessor("RrwebProcessor", event.eventId, async () => {
    // Base event processing (session upsert + event tracking)
    await processBaseEvent({
      event,
      eventType: "rrweb",
      location,
      device,
      screenClass: undefined,
    });

    // Insert rrweb event with detailed data
    await rrwebRepository.insertRrwebEvent({
      eventId: event.eventId,
      projectId: event.projectId,
      sessionId: event.sessionId,
      replayId: event.replayId,
      clientId: event.clientId,
      userId: event.userId || null,
      timestamp: new Date(event.timestamp),
      url: event.url,
      referrer: event.referrer,
      rrwebPayload: event.rrwebPayload,
      schemaVersion: event.schemaVersion,
      pageWidth: event.pageDimensions?.w,
      pageHeight: event.pageDimensions?.h,
      viewportWidth: event.viewport?.w,
      viewportHeight: event.viewport?.h,
    });
  });
}
