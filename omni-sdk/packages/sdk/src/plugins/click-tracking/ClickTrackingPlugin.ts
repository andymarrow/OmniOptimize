/**
 * Click Tracking Plugin
 * Automatically captures all user clicks with coordinates and element metadata
 * Useful for heatmap generation
 */

import type { IPlugin, PluginContext } from "../../types";

/**
 * Options for click tracking plugin
 */
export interface ClickTrackingOptions {
  /**
   * Selector for elements to ignore (e.g., '.no-track, [data-no-track]')
   */
  excludeSelectors?: string[];

  /**
   * Selector for elements to only track (e.g., '[data-track]')
   * If set, only these elements will be tracked
   */
  includeSelectors?: string[];

  /**
   * Throttle clicks to prevent too many events (ms)
   */
  throttleMs?: number;

  /**
   * Track only on these element types (default: all)
   */
  elementTypes?: string[];

  /**
   * Maximum text length to hash (default: 100)
   */
  maxTextLength?: number;

  /**
   * Enable debug logging
   */
  debug?: boolean;
}

export class ClickTrackingPlugin implements IPlugin {
  name = "ClickTrackingPlugin";
  version = "1.0.0";
  private context: PluginContext | null = null;
  private lastClickTime = 0;
  private options: ClickTrackingOptions;

  constructor(options: ClickTrackingOptions = {}) {
    this.options = {
      throttleMs: 100,
      maxTextLength: 100,
      debug: false,
      ...options,
    };
  }

  async init(context: PluginContext): Promise<void> {
    this.context = context;

    // Setup click tracking
    document.addEventListener("click", (e) => this.handleClick(e), true); // Use capture phase

    if (this.options.debug) {
      console.log("[ClickTrackingPlugin] Initialized");
    }
  }

  /**
   * Handle click events
   */
  private handleClick(event: MouseEvent): void {
    if (!this.context) return;

    // Throttle clicks
    const now = Date.now();
    if (now - this.lastClickTime < (this.options.throttleMs ?? 100)) {
      return;
    }
    this.lastClickTime = now;

    const target = event.target as HTMLElement;

    // Check if should track this element
    if (!this.shouldTrackElement(target)) {
      return;
    }

    if (this.options.debug) {
      console.log("[ClickTrackingPlugin] Tracking click:", {
        x: event.pageX,
        y: event.pageY,
        target: target.tagName,
      });
    }

    // Track the click
    this.context.tracker.trackClick(target, {
      pageX: event.pageX,
      pageY: event.pageY,
    });
  }

  /**
   * Determine if an element should be tracked
   */
  private shouldTrackElement(element: HTMLElement): boolean {
    // Check exclude selectors
    if (this.options.excludeSelectors) {
      for (const selector of this.options.excludeSelectors) {
        if (element.matches(selector) || element.closest(selector)) {
          return false;
        }
      }
    }

    // Check include selectors (if set, only these are tracked)
    if (this.options.includeSelectors) {
      let matches = false;
      for (const selector of this.options.includeSelectors) {
        if (element.matches(selector) || element.closest(selector)) {
          matches = true;
          break;
        }
      }
      if (!matches) {
        return false;
      }
    }

    // Check element types
    if (this.options.elementTypes) {
      const tagName = element.tagName.toLowerCase();
      if (!this.options.elementTypes.includes(tagName)) {
        return false;
      }
    }

    return true;
  }

  async destroy(): Promise<void> {
    this.context = null;
  }
}
