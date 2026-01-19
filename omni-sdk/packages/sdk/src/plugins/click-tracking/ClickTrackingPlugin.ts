/**
 * Click Tracking Plugin
 * Automatically captures all user clicks with coordinates and element metadata
 * Useful for heatmap generation
 */

import type { IPlugin, PluginContext } from "../../types";
import { CAPTURE_CONSTANTS } from "../../constants/CaptureConstants";

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
  private clickListener: EventListener | null = null;

  constructor(options: ClickTrackingOptions = {}) {
    this.options = {
      throttleMs: 100,
      maxTextLength: 100,
      debug: false,
      // Add default no-capture class to exclude selectors
      excludeSelectors: [
        `.${CAPTURE_CONSTANTS.NO_CAPTURE_CLASS}`,
        ...(options.excludeSelectors || []),
      ],
      ...options,
    };
  }

  async init(context: PluginContext): Promise<void> {
    this.context = context;
    this.setupClickTracking();

    if (this.options.debug) {
      console.log("[ClickTrackingPlugin] Initialized");
    }
  }

  /**
   * Setup click tracking listener
   */
  private setupClickTracking(): void {
    this.clickListener = (e) => this.handleClick(e as MouseEvent);
    document.addEventListener("click", this.clickListener, true);
  }

  /**
   * Remove click tracking listener
   */
  private removeClickTracking(): void {
    if (this.clickListener) {
      document.removeEventListener("click", this.clickListener, true);
      this.clickListener = null;
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

  /**
   * Pause click tracking
   */
  public async pause(): Promise<void> {
    this.removeClickTracking();
  }

  /**
   * Resume click tracking
   */
  public async resume(): Promise<void> {
    this.setupClickTracking();
  }

  async destroy(): Promise<void> {
    this.removeClickTracking();
    this.context = null;
  }
}
