import { processBaseEvent, executeProcessor } from "./BaseEventProcessor";
import type { PageViewEventData } from "../types";

/**
 * Process page view events
 * - Base session/event tracking (centralized)
 */
export async function processPageViewEvent(
  event: PageViewEventData,
  location?: string,
  device?: string
) {
  await executeProcessor("PageViewProcessor", event.eventId, async () => {
    // Base event processing (session upsert + event tracking)
    await processBaseEvent({
      event,
      eventType: "pageview",
      location,
      device,
      screenClass: event.screenClass,
    });
  });
}
