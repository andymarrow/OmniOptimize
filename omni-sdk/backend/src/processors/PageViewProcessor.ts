import { sessionRepository, eventRepository } from "../repositories";
import type { Event } from "../types";

/**
 * Process page view events
 * - Upsert session with location and device
 * - Track event in events table
 */
export async function processPageViewEvent(
  event: Event,
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
      type: "pageview",
      timestamp: new Date(event.timestamp),
      url: event.url,
      referrer: event.referrer,
    });

    console.log(
      `[PageViewProcessor] Processed pageview event ${event.eventId}`
    );
  } catch (error) {
    console.error(
      `[PageViewProcessor] Error processing event ${event.eventId}:`,
      error
    );
    throw error;
  }
}
