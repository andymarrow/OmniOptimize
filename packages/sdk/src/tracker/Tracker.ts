/**
 * Tracker
 * Public API for tracking events
 * High-level interface that uses Config, SessionManager, and EventQueue
 * Single Responsibility: Providing public tracking interface
 */

import type { Event, BaseEvent, PageViewEvent, ClickEvent } from "../types";
import { Config } from "../config/Config";
import { SessionManager } from "../session/SessionManager";
import { EventQueue } from "../queue/EventQueue";
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
   * Track a click event
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
      pageX: coordinates?.pageX ?? 0,
      pageY: coordinates?.pageY ?? 0,
      selector,
      xpath,
      tagName,
      elementTextHash: elementText ? this.hashText(elementText) : undefined,
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
   * Hash text using SHA256 (simple fallback to base64 hash)
   * In production, consider using a proper crypto library
   */
  private hashText(text: string): string {
    // Simple hash using btoa (not cryptographic, just for demo)
    // In production, use crypto.subtle.digest or a library like tweetnacl
    try {
      return btoa(text).substring(0, 64);
    } catch {
      return "hash-failed";
    }
  }
}
