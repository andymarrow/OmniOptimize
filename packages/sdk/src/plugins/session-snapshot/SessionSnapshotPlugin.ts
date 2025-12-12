import type { IPlugin, PluginContext } from "../../types/plugin";
import type {
  SessionSnapshotEvent,
  SnapshotType,
} from "../../types/events/snapshot";
import type { SnapshotConfig, PrivacyConfig } from "../../types/config";
import {
  getScreenClass,
  computeLayoutHash,
  serializeDOM,
  compressDOM,
  maskDefaultSensitiveFields,
  truncateDOM,
} from "../../utils/domSerializer";

/**
 * SessionSnapshotPlugin captures DOM snapshots for session replay, heatmaps, and diagnostics.
 *
 * Supports three snapshot capture modes:
 * - initial: Captured after page load and SPA route changes
 * - mutation: Captured when significant layout changes are detected (requires config)
 * - periodic: Captured at regular intervals (requires config)
 *
 * All snapshots include:
 * - Serialized DOM (sanitized and compressed)
 * - Layout hash for grouping similar layouts
 * - Screen class (mobile/tablet/desktop) for responsive design handling
 * - Mask metadata showing which selectors were masked
 *
 * Privacy-first design:
 * - Sensitive fields (passwords, tokens, CC numbers, SSN) masked by default
 * - Scripts and inline handlers removed automatically
 * - Cross-origin iframe content stripped
 * - Configurable blocking selectors to exclude elements entirely
 * - Respects data-analytics-snapshot="off" on elements
 */
export class SessionSnapshotPlugin implements IPlugin {
  public readonly name = "session-snapshot";
  public readonly version = "1.0.0";
  private initialized = false;
  private tracker: any = null;
  private mutationObserver: MutationObserver | null = null;
  private periodicTimer: ReturnType<typeof setInterval> | null = null;
  private lastLayoutHash: string | null = null;
  private snapshotConfig: SnapshotConfig;
  private privacyConfig: PrivacyConfig;

  constructor() {
    this.snapshotConfig = this.getDefaultSnapshotConfig();
    this.privacyConfig = this.getDefaultPrivacyConfig();
  }

  /**
   * Initialize the snapshot plugin with configuration.
   * Implements IPlugin.init() interface.
   */
  public async init(context: PluginContext): Promise<void> {
    if (this.initialized) return;

    this.tracker = context.tracker;

    // Get snapshot and privacy config from SDK config
    const config = context.config || {};
    this.snapshotConfig = config.snapshot || this.getDefaultSnapshotConfig();
    this.privacyConfig = config.privacy || this.getDefaultPrivacyConfig();

    // Validate snapshot is enabled
    if (!this.snapshotConfig.enabled) {
      this.initialized = true;
      return;
    }

    this.initialized = true;

    // Capture initial snapshot after page load
    if (this.snapshotConfig.captureInitial) {
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () =>
          this.captureSnapshot("initial")
        );
        window.addEventListener("load", () => this.captureSnapshot("initial"));
      } else {
        // Page already loaded, capture in next frame
        requestAnimationFrame(() => this.captureSnapshot("initial"));
      }
    }

    // Listen for page view events to capture snapshots after navigation
    if (this.tracker && "on" in this.tracker) {
      (this.tracker as any).on?.("pageview", () => {
        if (this.snapshotConfig.captureInitial) {
          requestAnimationFrame(() => this.captureSnapshot("initial"));
        }
      });
    }

    // Set up mutation-based snapshots if enabled
    if (this.snapshotConfig.captureMutations) {
      this.setupMutationMonitoring();
    }

    // Set up periodic snapshots if enabled
    if (this.snapshotConfig.capturePeriodic) {
      this.setupPeriodicSnapshots();
    }
  }

  /**
   * Capture a DOM snapshot and emit it as a session_snapshot event.
   * @param snapshotType Type of snapshot: 'initial', 'mutation', or 'periodic'
   */
  private captureSnapshot(snapshotType: SnapshotType): void {
    if (!this.tracker) {
      return;
    }

    try {
      // Use requestIdleCallback for non-blocking capture
      if ("requestIdleCallback" in window) {
        requestIdleCallback(
          () => {
            void this.performCapture(snapshotType);
          },
          { timeout: 1000 }
        );
      } else {
        requestAnimationFrame(() => {
          void this.performCapture(snapshotType);
        });
      }
    } catch (error) {
      console.error(
        "[SessionSnapshotPlugin] Failed to capture snapshot:",
        error
      );
    }
  }

  /**
   * Perform the actual snapshot capture, serialization, and event emission.
   */
  private async performCapture(snapshotType: SnapshotType): Promise<void> {
    if (!this.tracker || !document.body) return;

    try {
      const screenClass = getScreenClass(window.innerWidth);
      let domString = serializeDOM(document.body, {
        maxNodeTextLength: this.privacyConfig.maxNodeTextLength,
        blockSelectors: this.privacyConfig.blockSelectors,
        maskSelectors: this.privacyConfig.maskSelectors,
      }).dom;

      // Apply default sensitive field masking
      maskDefaultSensitiveFields(
        document.body,
        this.privacyConfig.maxNodeTextLength || 200
      );

      // Compute layout hash before truncation
      const layoutHash = computeLayoutHash(document.body);

      // Truncate if necessary
      const { dom: truncatedDom, truncated } = truncateDOM(
        domString,
        this.snapshotConfig.maxSnapshotSizeBytes
      );

      // Compress DOM (await the promise)
      const compressed = await compressDOM(truncatedDom);

      // Only emit if layout has changed (for mutation/periodic snapshots)
      if (snapshotType !== "initial" && layoutHash === this.lastLayoutHash) {
        return;
      }

      this.lastLayoutHash = layoutHash;

      // Create and emit snapshot event
      const snapshot: SessionSnapshotEvent = {
        type: "session_snapshot",
        timestamp: Date.now(),
        sessionId: (this.tracker as any).getSessionId?.() || "",
        userId: (this.tracker as any).config?.getUserId?.() || undefined,
        clientId: (this.tracker as any).config?.getClientId?.() || "",
        url: window.location.href,
        snapshotType,
        screenClass,
        layoutHash,
        dom: compressed.data,
        domCompression: compressed.compression,
        domSize: {
          original: compressed.originalSize,
          compressed: compressed.compressedSize,
          truncated,
        },
        maskMetadata: {
          maskedSelectors: this.privacyConfig.maskSelectors || [],
          truncated,
          domSize: compressed.compressedSize,
          compressionType: compressed.compression,
        },
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
        schemaVersion: "1.0",
      };

      // Emit the snapshot event to the tracker
      (this.tracker as any).trackCustom?.("session_snapshot", snapshot);
    } catch (error) {
      console.error(
        "[SessionSnapshotPlugin] Error during snapshot capture:",
        error
      );
    }
  }

  /**
   * Set up MutationObserver to detect significant layout changes.
   */
  private setupMutationMonitoring(): void {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }

    let mutationTimeout: ReturnType<typeof setTimeout> | null = null;
    const throttleMs = this.snapshotConfig.mutationThrottleMs || 3000;

    this.mutationObserver = new MutationObserver(() => {
      if (mutationTimeout) {
        clearTimeout(mutationTimeout);
      }

      mutationTimeout = setTimeout(() => {
        this.captureSnapshot("mutation");
      }, throttleMs);
    });

    this.mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "style", "data-*"],
      characterData: false, // Don't track text node changes for performance
      attributeOldValue: false,
      characterDataOldValue: false,
    });
  }

  /**
   * Set up periodic snapshot capture at fixed intervals.
   */
  private setupPeriodicSnapshots(): void {
    if (this.periodicTimer) {
      clearInterval(this.periodicTimer);
    }

    const intervalMs = this.snapshotConfig.periodicIntervalMs || 60000; // Default 1 minute

    this.periodicTimer = setInterval(() => {
      this.captureSnapshot("periodic");
    }, intervalMs);
  }

  /**
   * Destroy the plugin and clean up resources.
   */
  public async destroy(): Promise<void> {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = null;
    }

    if (this.periodicTimer) {
      clearInterval(this.periodicTimer);
      this.periodicTimer = null;
    }

    this.tracker = null;
    this.initialized = false;
  }

  /**
   * Get plugin status information.
   */
  public getStatus(): {
    name: string;
    version: string;
    initialized: boolean;
    config: { snapshotConfig: SnapshotConfig; privacyConfig: PrivacyConfig };
  } {
    return {
      name: this.name,
      version: this.version,
      initialized: this.initialized,
      config: {
        snapshotConfig: this.snapshotConfig,
        privacyConfig: this.privacyConfig,
      },
    };
  }

  /**
   * Get default snapshot configuration.
   */
  private getDefaultSnapshotConfig(): SnapshotConfig {
    return {
      enabled: false,
      captureInitial: true,
      captureMutations: false,
      mutationThrottleMs: 3000,
      capturePeriodic: false,
      periodicIntervalMs: 60000,
      maxSnapshotSizeBytes: 512 * 1024, // 512KB default
    };
  }

  /**
   * Get default privacy configuration.
   */
  private getDefaultPrivacyConfig(): PrivacyConfig {
    return {
      blockSelectors: [],
      maskSelectors: [],
      disableSnapshots: false,
      maxNodeTextLength: 200,
    };
  }
}
