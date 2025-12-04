/**
 * Click event types
 */

import { BaseEvent, Coordinates } from "../common";

/**
 * Metadata about the clicked element
 */
export interface ElementMetadata {
  tagName: string;
  selector: string; // CSS selector (e.g., "body > main > article:nth-child(3) > button.cta")
  xpath?: string; // Optional XPath for more specific targeting
  elementTextHash?: string; // SHA256 hash of element text (optional, for privacy)
}

/**
 * Click event payload
 */
export interface ClickPayload extends Coordinates {
  x: number; // pageX
  y: number; // pageY
  selector: string;
  xpath?: string;
  elementTextHash?: string;
  tagName: string;
}

/**
 * Click event - tracks user clicks with coordinates and element selectors for heatmaps
 */
export interface ClickEvent extends BaseEvent {
  type: "click";
  pageX: number;
  pageY: number;
  selector: string;
  xpath?: string;
  elementTextHash?: string;
  tagName: string;
}

/**
 * Input event - tracks form input interactions
 */
export interface InputEvent extends BaseEvent {
  type: "input";
  selector: string;
  inputType: string; // text, checkbox, radio, etc.
  value?: string; // only for text inputs
}

/**
 * Route change event - tracks SPA route changes
 */
export interface RouteEvent extends BaseEvent {
  type: "route";
  route: string;
  previousRoute?: string;
}

/**
 * Custom event - for user-defined tracking
 */
export interface CustomEvent extends BaseEvent {
  type: "custom";
  eventName: string;
}
