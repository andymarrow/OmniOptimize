/**
 * Page View event types
 */

import { BaseEvent } from "../common";

/**
 * Page view event payload
 */
export interface PageViewPayload {
  title: string;
  route: string;
  isInitialLoad: boolean; // true for first page load, false for SPA navigation
}

/**
 * Page view event - tracks initial page loads and SPA navigation
 */
export interface PageViewEvent extends BaseEvent {
  type: "pageview";
  title: string;
  route: string;
  isInitialLoad: boolean;
}
