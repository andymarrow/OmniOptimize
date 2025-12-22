/**
 * Page View Tracking Plugin
 * Automatically tracks initial page load and SPA navigation
 * Intercepts history.pushState and history.replaceState
 */

import type { IPlugin, PluginContext } from "../../types";

export class PageViewPlugin implements IPlugin {
  name = "PageViewPlugin";
  version = "1.0.0";
  private context: PluginContext | null = null;
  private isInitialLoad = true;

  async init(context: PluginContext): Promise<void> {
    this.context = context;

    // Track initial page load
    this.trackPageView(true);

    // Setup SPA navigation tracking
    this.setupHistoryInterception();

    // Track when page becomes visible again
    this.setupVisibilityTracking();
  }

  /**
   * Track a page view event
   */
  private trackPageView(isInitialLoad: boolean): void {
    if (!this.context) return;

    this.context.tracker.trackPageView({
      isInitialLoad,
      title: document.title,
      route: window.location.pathname,
    });
  }

  /**
   * Intercept history.pushState and history.replaceState
   * to track SPA navigation
   */
  private setupHistoryInterception(): void {
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    const self = this;

    // Override pushState
    history.pushState = function (...args) {
      const result = originalPushState.apply(this, args);

      // Use setTimeout to allow DOM to update
      setTimeout(() => {
        self.trackPageView(false);
      }, 0);

      return result;
    };

    // Override replaceState
    history.replaceState = function (...args) {
      const result = originalReplaceState.apply(this, args);

      // Use setTimeout to allow DOM to update
      setTimeout(() => {
        self.trackPageView(false);
      }, 0);

      return result;
    };

    // Track back/forward navigation
    window.addEventListener("popstate", () => {
      setTimeout(() => {
        self.trackPageView(false);
      }, 0);
    });
  }

  /**
   * Track when page becomes visible again (tab switch)
   * Useful for tracking re-engagement
   */
  private setupVisibilityTracking(): void {
    let lastVisibleTime = Date.now();

    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) {
        const timeSinceLastVisible = Date.now() - lastVisibleTime;

        // Only track if more than 5 minutes have passed
        if (timeSinceLastVisible > 5 * 60 * 1000) {
          this.trackPageView(false);
        }
      } else {
        lastVisibleTime = Date.now();
      }
    });
  }

  async destroy(): Promise<void> {
    // Cleanup if needed
    this.context = null;
  }
}
