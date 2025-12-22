import type { Event } from "../types";

/**
 * Process page view events
 * Currently no-op - may store in future
 */
export async function processPageViewEvent(event: Event) {
  try {
    console.log(`[PageViewProcessor] Received pageview event ${event.eventId}`);
    // TODO: Store page view analytics if needed
  } catch (error) {
    console.error(
      `[PageViewProcessor] Error processing event ${event.eventId}:`,
      error
    );
    throw error;
  }
}
