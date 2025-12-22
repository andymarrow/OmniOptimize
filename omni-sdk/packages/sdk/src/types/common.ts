/**
 * Common types used throughout the SDK
 */

/**
 * Dimensions object for page or viewport measurements
 */
export interface Dimensions {
  w: number;
  h: number;
}

/**
 * Coordinates for pointer events (click, hover, etc.)
 */
export interface Coordinates {
  x: number;
  y: number;
}

/**
 * Base event structure that all events extend
 */
export interface BaseEvent {
  eventId: string; // UUID
  projectId: string;
  clientId: string; // anon-or-user-id
  sessionId: string;
  userId: string | null;
  type: EventType;
  timestamp: number; // milliseconds since epoch
  url: string;
  referrer: string;
  pageDimensions: Dimensions;
  viewport: Dimensions;
  properties?: Record<string, any>; // custom properties
}

/**
 * All supported event types
 */
export type EventType =
  | "pageview"
  | "click"
  | "input"
  | "route"
  | "custom"
  | "session_snapshot"
  | "rrweb";

/**
 * Union type for all possible events
 */
export type Event = BaseEvent & Record<string, any>;

/**
 * Batch of events sent to server
 */
export interface Batch {
  events: Event[];
  batchId: string;
  timestamp: number;
}
