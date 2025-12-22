/**
 * Session Snapshot Plugin
 * Captures DOM snapshots for session replay using rrweb exclusively
 *
 * REQUIRES rrweb - this plugin has no fallback to manual snapshots
 * Install: npm install @omni-analytics/sdk (rrweb is included)
 *
 * Features:
 * - Automatic DOM and interaction capture via rrweb
 * - Captures all user interactions (clicks, inputs, scrolls, etc.)
 * - Privacy-first: masks sensitive inputs, removes scripts
 * - Heatmap-ready normalized coordinates
 * - Optional periodic and mutation snapshots
 */

import type { IPlugin, PluginContext } from "../../types/plugin";
import type { SnapshotConfig, PrivacyConfig } from "../../types/config";
import {
  RrwebManager,
  transformRrwebEvent,
  type RrwebManagerConfig,
} from "../../utils/rrwebIntegration";

/**
 * Configuration options for SessionSnapshotPlugin
 */
export interface SessionSnapshotPluginOptions {
  /**
   * RrWeb instance (from: import * as rrweb from 'rrweb')
   * REQUIRED - rrweb is a required dependency, no fallback available
   */
  rrwebInstance: any;

  /**
   * Enable debug logging
   */
  debug?: boolean;
}

export class SessionSnapshotPlugin implements IPlugin {
  public readonly name = "session-snapshot";
  public readonly version = "1.0.0";

  private initialized = false;
  private tracker: any = null;
  private config: any = null;
  private rrwebManager: RrwebManager;
  private options: SessionSnapshotPluginOptions;

  // Configuration
  private snapshotConfig: SnapshotConfig;
  private privacyConfig: PrivacyConfig;

  constructor(options: SessionSnapshotPluginOptions) {
    if (!options.rrwebInstance) {
      throw new Error(
        "[SessionSnapshotPlugin] rrwebInstance is REQUIRED. Install and import: import * as rrweb from 'rrweb'"
      );
    }

    this.options = {
      debug: false,
      ...options,
    };

    // Initialize RrwebManager with the provided rrweb instance
    this.rrwebManager = new RrwebManager(this.options.rrwebInstance);

    this.snapshotConfig = this.getDefaultSnapshotConfig();
    this.privacyConfig = this.getDefaultPrivacyConfig();
  }

  /**
   * Initialize the plugin
   * REQUIRES rrweb to be available
   */
  public async init(context: PluginContext): Promise<void> {
    if (this.initialized) return;

    this.tracker = context.tracker;
    this.config = context.config || {};

    // Load config from SDK config
    this.snapshotConfig =
      this.config.snapshot || this.getDefaultSnapshotConfig();
    this.privacyConfig = this.config.privacy || this.getDefaultPrivacyConfig();

    if (!this.snapshotConfig.enabled) {
      this.initialized = true;
      if (this.options.debug) {
        console.log("[SessionSnapshotPlugin] Snapshot capture disabled");
      }
      return;
    }

    this.initialized = true;

    // Setup rrweb (required, no fallback)
    try {
      this.setupRrweb();
      if (this.options.debug) {
        console.log("[SessionSnapshotPlugin] RrWeb initialized successfully");
      }
    } catch (error) {
      console.error(
        "[SessionSnapshotPlugin] Failed to initialize RrWeb:",
        error
      );
      throw error;
    }

    if (this.options.debug) {
      console.log("[SessionSnapshotPlugin] Initialized with rrweb");
    }
  }

  /**
   * Setup rrweb integration for automatic capture
   * Throws if rrweb initialization fails
   */
  private setupRrweb(): void {
    try {
      // Build rrweb config
      const rrwebConfig: RrwebManagerConfig = {
        enabled: true,
        debug: this.options.debug,
        onRecord: (rrwebEvent: any) => {
          this.handleRrwebEvent(rrwebEvent);
        },
        blockSelectors: this.privacyConfig.blockSelectors,
        maskSelectors: this.privacyConfig.maskSelectors,
        sampleRate: 1.0, // Capture all events
      };

      if (!this.rrwebManager.init(rrwebConfig)) {
        throw new Error("Failed to initialize RrwebManager");
      }

      // Start recording
      if (!this.rrwebManager.startRecording()) {
        throw new Error("Failed to start rrweb recording");
      }
    } catch (error) {
      console.error("[SessionSnapshotPlugin] RrWeb setup failed:", error);
      throw error;
    }
  }

  /**
   * Handle rrweb events
   */
  private handleRrwebEvent(rrwebEvent: any): void {
    if (!this.tracker) return;

    try {
      // Transform and track rrweb event
      const transformedEvent = transformRrwebEvent(
        rrwebEvent,
        this.tracker.getSessionId?.() || "",
        this.tracker.config?.getClientId?.() || "",
        this.tracker.config?.getUserId?.() || null,
        window.location.href,
        document.referrer
      );

      this.tracker.trackRrweb?.(transformedEvent);
    } catch (error) {
      console.error(
        "[SessionSnapshotPlugin] Failed to handle rrweb event:",
        error
      );
    }
  }

  /**
   * Destroy the plugin and cleanup
   */
  public async destroy(): Promise<void> {
    if (this.rrwebManager) {
      this.rrwebManager.destroy();
    }

    this.tracker = null;
    this.config = null;
    this.initialized = false;
  }

  /**
   * Get plugin status
   */
  public getStatus(): {
    name: string;
    version: string;
    initialized: boolean;
    rrwebRecording: boolean;
  } {
    return {
      name: this.name,
      version: this.version,
      initialized: this.initialized,
      rrwebRecording: this.rrwebManager?.isRecording() ?? false,
    };
  }

  /**
   * Get default snapshot config
   */
  private getDefaultSnapshotConfig(): SnapshotConfig {
    return {
      enabled: true,
      captureInitial: true,
      captureMutations: false,
      mutationThrottleMs: 3000,
      capturePeriodic: false,
      periodicIntervalMs: 60000,
      maxSnapshotSizeBytes: 512 * 1024,
    };
  }

  /**
   * Get default privacy config
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
