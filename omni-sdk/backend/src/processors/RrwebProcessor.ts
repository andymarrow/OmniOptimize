import { sessionRepository } from "../repositories";
import { rrwebRepository } from "../repositories";
import type { RrwebEventData } from "../types";

/**
 * Process rrweb replay events
 * - Upsert session
 * - Store raw rrweb payload verbatim
 * - Preserve ordering by timestamp
 */
export async function processRrwebEvent(event: RrwebEventData) {
  try {
    // Ensure session exists
    await sessionRepository.upsertSession({
      sessionId: event.sessionId,
      projectId: event.projectId,
      clientId: event.clientId,
      userId: event.userId || null,
    });

    // Insert rrweb event
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

    console.log(`[RrwebProcessor] Processed event ${event.eventId}`);
  } catch (error) {
    console.error(
      `[RrwebProcessor] Error processing event ${event.eventId}:`,
      error
    );
    throw error;
  }
}
