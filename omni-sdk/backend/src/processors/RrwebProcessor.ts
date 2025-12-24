import {
  sessionRepository,
  rrwebRepository,
  eventRepository,
} from "../repositories";
import type { RrwebEventData } from "../types";

/**
 * Process rrweb replay events
 * - Upsert session with location and device
 * - Store raw rrweb payload verbatim
 * - Track event in events table
 * - Preserve ordering by timestamp
 */
export async function processRrwebEvent(
  event: RrwebEventData,
  location?: string,
  device?: string
) {
  try {
    // Ensure session exists with location and device
    await sessionRepository.upsertSession({
      sessionId: event.sessionId,
      projectId: event.projectId,
      clientId: event.clientId,
      userId: event.userId || null,
      location: location || "ET",
      device: device || null,
    });

    // Track event in generic events table
    await eventRepository.insertEvent({
      eventId: event.eventId,
      projectId: event.projectId,
      sessionId: event.sessionId,
      clientId: event.clientId,
      userId: event.userId || null,
      type: "rrweb",
      timestamp: new Date(event.timestamp),
      url: event.url,
      referrer: event.referrer,
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

    console.log(`[RrwebProcessor] Processed event ${event.eventId}`);
  } catch (error) {
    console.error(
      `[RrwebProcessor] Error processing event ${event.eventId}:`,
      error
    );
    throw error;
  }
}
