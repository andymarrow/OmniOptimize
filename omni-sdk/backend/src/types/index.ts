/**
 * Event types for the backend
 * Mirrors SDK types but independent for backend evolution
 */

export type Dimensions = {
  w: number;
  h: number;
};

export type EventType =
  | "pageview"
  | "click"
  | "input"
  | "route"
  | "custom"
  | "session_snapshot"
  | "rrweb";

export type BaseEvent = {
  eventId: string;
  projectId: string;
  clientId: string;
  sessionId: string;
  userId: string | null;
  type: EventType;
  timestamp: number;
  url: string;
  referrer: string;
  pageDimensions: Dimensions;
  viewport: Dimensions;
  properties?: Record<string, any>;
};

export type Event = BaseEvent & Record<string, any>;

export type IncomingBatch = {
  batchId: string;
  timestamp: number;
  events: Event[];
};

export type RrwebEventPayload = {
  type: number;
  data: Record<string, any>;
  timestamp?: number;
};

export type RrwebEventData = {
  type: "rrweb";
  eventId: string;
  projectId: string;
  sessionId: string;
  replayId: string;
  clientId: string;
  userId: string | null;
  timestamp: number;
  url: string;
  referrer?: string;
  rrwebPayload: RrwebEventPayload;
  schemaVersion: string;
  pageDimensions: Dimensions;
  viewport: Dimensions;
  properties?: Record<string, any>;
};

export type ClickEventData = {
  type: "click";
  eventId: string;
  projectId: string;
  sessionId: string;
  clientId: string;
  userId: string | null;
  timestamp: number;
  url: string;
  referrer: string;
  pageDimensions: Dimensions;
  viewport: Dimensions;
  pageX: number;
  pageY: number;
  xNorm: number;
  yNorm: number;
  screenClass?: "mobile" | "tablet" | "desktop";
  selector: string;
  xpath?: string;
  elementTextHash?: string;
  tagName: string;
  layoutHash?: string;
  properties?: Record<string, any>;
};
