/**
 * Tracker
 * Public API for tracking events
 * High-level interface that uses Config, SessionManager, and EventQueue
 * Single Responsibility: Providing public tracking interface
 */

import type { Event, BaseEvent, PageViewEvent, ClickEvent } from "../types";
import type {
  ScreenClass,
  SessionSnapshotEvent,
  RrwebEvent,
} from "../types/events/snapshot";
import { Config } from "../config/Config";
import { SessionManager } from "../session/SessionManager";
import { EventQueue } from "../queue/EventQueue";
import { getScreenClass, computeLayoutHash } from "../utils/domSerializer";
import {
  generateUUID,
  generateCSSSelector,
  generateXPath,
  getPageContext,
  getPageDimensions,
  getPageTitle,
  getPageRoute,
} from "../utils";

export class Tracker {
  private config: Config;
  private sessionManager: SessionManager;
  private eventQueue: EventQueue;

  constructor(
    config: Config,
    sessionManager: SessionManager,
    eventQueue: EventQueue
  ) {
    this.config = config;
    this.sessionManager = sessionManager;
    this.eventQueue = eventQueue;
  }

  /**
   * Track a page view event
   */
  trackPageView(payload?: {
    title?: string;
    route?: string;
    isInitialLoad?: boolean;
  }): void {
    const pageContext = getPageContext();
    const { pageDimensions, viewport } = getPageDimensions();

    const event: PageViewEvent = {
      eventId: generateUUID(),
      projectId: this.config.getProjectId(),
      clientId: this.config.getClientId(),
      sessionId: this.sessionManager.getSessionId(),
      userId: this.config.getUserId(),
      type: "pageview",
      timestamp: Date.now(),
      url: pageContext.url,
      referrer: pageContext.referrer,
      pageDimensions,
      viewport,
      properties: {},
      title: payload?.title ?? getPageTitle(),
      route: payload?.route ?? getPageRoute(),
      isInitialLoad: payload?.isInitialLoad ?? false,
    };

    this.track(event);
  }

  /**
   * Track a click event with optional heatmap data (normalized coordinates, screen class, layout hash)
   */
  trackClick(
    element: Element,
    coordinates?: { pageX?: number; pageY?: number }
  ): void {
    const pageContext = getPageContext();
    const { pageDimensions, viewport } = getPageDimensions();

    // Get element metadata
    const selector = generateCSSSelector(element);
    const xpath = generateXPath(element);
    const tagName = element.tagName.toLowerCase();
    const elementText = (element as HTMLElement).innerText?.substring(0, 100);

    // Compute heatmap fields: normalized coordinates
    const pageX = coordinates?.pageX ?? 0;
    const pageY = coordinates?.pageY ?? 0;
    const xNorm =
      pageDimensions.w > 0 ? (pageX + window.scrollX) / pageDimensions.w : 0;
    const yNorm =
      pageDimensions.h > 0 ? (pageY + window.scrollY) / pageDimensions.h : 0;

    // Get screen classification for responsive heatmap grouping
    const screenClass: ScreenClass = getScreenClass(window.innerWidth);

    // Compute layout hash for grouping similar DOM structures
    const layoutHash = computeLayoutHash(document.body);

    const event: ClickEvent = {
      eventId: generateUUID(),
      projectId: this.config.getProjectId(),
      clientId: this.config.getClientId(),
      sessionId: this.sessionManager.getSessionId(),
      userId: this.config.getUserId(),
      type: "click",
      timestamp: Date.now(),
      url: pageContext.url,
      referrer: pageContext.referrer,
      pageDimensions,
      viewport,
      properties: {},
      pageX,
      pageY,
      selector,
      xpath,
      tagName,
      elementTextHash: elementText ? this.hashText(elementText) : undefined,
      // Heatmap fields
      xNorm,
      yNorm,
      screenClass,
      layoutHash,
    };

    this.track(event);
  }

  /**
   * Track a custom event
   */
  trackCustom(eventName: string, properties?: Record<string, any>): void {
    const pageContext = getPageContext();
    const { pageDimensions, viewport } = getPageDimensions();

    const event: Event = {
      eventId: generateUUID(),
      projectId: this.config.getProjectId(),
      clientId: this.config.getClientId(),
      sessionId: this.sessionManager.getSessionId(),
      userId: this.config.getUserId(),
      type: "custom",
      timestamp: Date.now(),
      url: pageContext.url,
      referrer: pageContext.referrer,
      pageDimensions,
      viewport,
      properties,
      eventName,
    };

    this.track(event);
  }

  /**
   * Core track method - adds event to queue
   */
  track(event: BaseEvent | Event): void {
    if (this.config.isDebugEnabled()) {
      console.log("[Tracker] Tracking event:", event);
    }

    this.eventQueue.add(event as Event);
  }

  /**
   * Flush all queued events
   */
  async flush(): Promise<void> {
    return this.eventQueue.flush();
  }

  /**
   * Set user ID (after login)
   */
  setUserId(userId: string | null): void {
    this.config.setUserId(userId);
    if (userId) {
      // Optionally start new session on login
      // this.sessionManager.startNewSession();
    }
  }

  /**
   * Set client ID
   */
  setClientId(clientId: string): void {
    this.config.setClientId(clientId);
  }

  /**
   * Get session ID
   */
  getSessionId(): string {
    return this.sessionManager.getSessionId();
  }

  /**
   * Start new session
   */
  newSession(): string {
    return this.sessionManager.startNewSession();
  }

  /**
   * Get config instance
   */
  getConfig(): Config {
    return this.config;
  }

  /**
   * Get session manager instance
   */
  getSessionManager(): SessionManager {
    return this.sessionManager;
  }

  /**
   * Hash text using SHA256 (simple fallback to base64 hash)
   * In production, consider using a proper crypto library
   */
  //TODO: use crypto hash
  private hashText(text: string): string {
    // Simple hash using btoa (not cryptographic, just for demo)
    // In production, use crypto.subtle.digest or a library like tweetnacl
    try {
      return btoa(text).substring(0, 64);
    } catch {
      return "hash-failed";
    }
  }

  /**
   * Track a DOM snapshot event for session replay and heatmaps
   */
  trackSnapshot(snapshot: SessionSnapshotEvent): void {
    if (this.config.isDebugEnabled()) {
      console.log("[Tracker] Tracking snapshot:", snapshot);
    }

    // Convert viewport from {width, height} to {w, h} if needed
    const viewport: { w: number; h: number } =
      "w" in snapshot.viewport
        ? (snapshot.viewport as any)
        : {
            w: (snapshot.viewport as any).width || window.innerWidth,
            h: (snapshot.viewport as any).height || window.innerHeight,
          };

    const event: Event = {
      ...snapshot,
      eventId: generateUUID(),
      projectId: this.config.getProjectId(),
      clientId: this.config.getClientId(),
      sessionId: snapshot.sessionId || this.sessionManager.getSessionId(),
      userId: snapshot.userId ?? this.config.getUserId(),
      type: "session_snapshot",
      timestamp: snapshot.timestamp || Date.now(),
      pageDimensions: snapshot.pageDimensions || {
        w: document.documentElement.scrollWidth,
        h: document.documentElement.scrollHeight,
      },
      viewport,
      url: snapshot.url || window.location.href,
      referrer: snapshot.referrer || document.referrer,
      properties: {},
    };

    this.eventQueue.add(event as Event);
  }

  /**
   * Track a rrweb event for session replay
   */
  trackRrweb(rrwebEvent: RrwebEvent): void {
    if (this.config.isDebugEnabled()) {
      console.log("[Tracker] Tracking rrweb event:", rrwebEvent);
    }

    const event: Event = {
      ...rrwebEvent,
      eventId: generateUUID(),
      projectId: this.config.getProjectId(),
      clientId: this.config.getClientId(),
      sessionId: rrwebEvent.sessionId || this.sessionManager.getSessionId(),
      userId: rrwebEvent.userId ?? this.config.getUserId(),
      type: "rrweb",
      timestamp: rrwebEvent.timestamp || Date.now(),
      pageDimensions: {
        w: document.documentElement.scrollWidth,
        h: document.documentElement.scrollHeight,
      },
      viewport: {
        w: window.innerWidth,
        h: window.innerHeight,
      },
      url: rrwebEvent.url || window.location.href,
      referrer: rrwebEvent.referrer || document.referrer,
      properties: {},
    };

    this.eventQueue.add(event as Event);
  }

  /**
   * Generate a unique event ID
   */
  private generateEventId(): string {
    return generateUUID();
  }
}
