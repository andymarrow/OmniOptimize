import {
  sessionRepository,
  eventRepository,
  userRepository,
} from "../repositories";
import type { Event } from "../types";

/**
 * Base event processor - handles common session/event tracking logic
 * Eliminates repetition across all event processors
 *
 * On every event, this:
 * 1. Upserts session metadata
 * 2. Inserts event into generic events table
 * 3. Tracks user (analytics identity) for retention analytics
 * 4. Records daily activity for retention cohort calculations
 */

export interface ProcessEventParams {
  event: Event;
  eventType: string;
  location?: string;
  device?: string;
  screenClass?: string;
}

/**
 * Process base event operations (session upsert + event tracking + retention tracking)
 * Centralized logic to avoid repetition across processors
 */
export async function processBaseEvent({
  event,
  eventType,
  location,
  device,
  screenClass,
}: ProcessEventParams): Promise<void> {
  // Normalize location (default to ET)
  const normalizedLocation = location || "ET";

  // Determine device: explicit device > screenClass > null
  const normalizedDevice = device || screenClass || null;

  // Resolve analytics identity for retention
  const distinctId = event.userId || event.clientId;
  const eventTimestamp = new Date(event.timestamp);

  // Upsert session once with all metadata
  await sessionRepository.upsertSession({
    sessionId: event.sessionId,
    projectId: event.projectId,
    clientId: event.clientId,
    userId: event.userId || null,
    location: normalizedLocation,
    device: normalizedDevice,
  });

  // Track event in generic events table
  await eventRepository.insertEvent({
    eventId: event.eventId,
    projectId: event.projectId,
    sessionId: event.sessionId,
    clientId: event.clientId,
    userId: event.userId || null,
    type: eventType,
    timestamp: eventTimestamp,
    url: event.url,
    referrer: event.referrer,
  });

  // Track retention analytics: record user first-seen and daily activity
  // Idempotent on both tables - safe to call on every event
  // Country is set ONLY on first user creation, never updated
  await userRepository.upsertUserFirstSeen(
    event.projectId,
    distinctId,
    eventTimestamp,
    normalizedLocation // Pass country/location code
  );

  await userRepository.upsertUserDailyActivity(
    event.projectId,
    distinctId,
    eventTimestamp
  );
}

/**
 * Helper to safely execute processor with consistent error handling
 */
export async function executeProcessor(
  processorName: string,
  eventId: string,
  fn: () => Promise<void>
): Promise<void> {
  try {
    await fn();
    console.log(`[${processorName}] Processed event ${eventId}`);
  } catch (error) {
    console.error(
      `[${processorName}] Error processing event ${eventId}:`,
      error
    );
    throw error;
  }
}
