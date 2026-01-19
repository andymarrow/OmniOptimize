/**
 * RrWeb Integration Utility
 * Manages rrweb recording for session replay and interaction capture
 * rrweb is a REQUIRED dependency - the SDK uses it exclusively for event capture
 *
 * Installation:
 *   npm install @omni-analytics/sdk
 *   (rrweb is included as a dependency)
 *
 * Usage:
 *   import * as rrweb from 'rrweb';
 *   const rrwebManager = new RrwebManager(rrweb);
 *   rrwebManager.init({ onRecord: (event) => tracker.trackRrweb(event) });
 *   rrwebManager.startRecording();
 */

import { CAPTURE_CONSTANTS } from "../constants/CaptureConstants";

type RrwebEventCallback = (event: any) => void;

/**
 * RrWeb library interface
 */
export interface RrwebLibrary {
  record(options: Record<string, any>): () => void;
  pack(data: any): any;
  unpack(data: any): any;
}

/**
 * Configuration for RrwebManager
 */
export interface RrwebManagerConfig {
  /**
   * Callback when a rrweb event is recorded
   */
  onRecord: RrwebEventCallback;

  /**
   * Enable/disable rrweb recording (default: true)
   */
  enabled?: boolean;

  /**
   * Enable debug logging
   */
  debug?: boolean;

  /**
   * Sample rate for rrweb events (0-1, default: 1.0 = capture all)
   */
  sampleRate?: number;

  /**
   * Whether to mask all input values (default: true)
   */
  maskInputOptions?: Record<string, boolean>;

  /**
   * Selectors to block/exclude from recording (default: empty)
   */
  blockSelectors?: string[];

  /**
   * CSS selectors to mask content (default: sensitive selectors)
   */
  maskSelectors?: string[];
}

/**
 * Manager for rrweb recording
 * REQUIRED: rrweb must be provided and will throw if not available
 */
export class RrwebManager {
  private recording = false;
  private initialized = false;
  private onRecord: RrwebEventCallback | null = null;
  private config: RrwebManagerConfig | null = null;
  private rrwebStopFn: (() => void) | null = null;
  private rrwebLib: RrwebLibrary;

  /**
   * Create a new RrwebManager
   * @param rrwebInstance The rrweb library instance (REQUIRED)
   * @throws Error if rrwebInstance is not provided or invalid
   */
  constructor(rrwebInstance: RrwebLibrary) {
    if (!rrwebInstance) {
      throw new Error(
        "[RrwebManager] rrweb is REQUIRED. Install: npm install @omni-analytics/sdk",
      );
    }

    if (!rrwebInstance.record || typeof rrwebInstance.record !== "function") {
      throw new Error(
        "[RrwebManager] Invalid instance. Ensure rrweb is properly imported.",
      );
    }

    this.rrwebLib = rrwebInstance;
  }

  /**
   * Initialize the RrwebManager with configuration
   */
  public init(config: RrwebManagerConfig): boolean {
    if (this.initialized) {
      return true;
    }

    if (!config.enabled && config.enabled !== undefined) {
      if (config.debug) {
        console.log("[RrwebManager] RrWeb recording is disabled");
      }
      return false;
    }

    this.config = config;
    this.onRecord = config.onRecord;
    this.initialized = true;

    if (config.debug) {
      console.log("[RrwebManager] Initialized with rrweb");
    }

    return true;
  }

  /**
   * Start recording with rrweb
   */
  public startRecording(): boolean {
    if (!this.initialized || !this.config) {
      console.warn("[RrwebManager] Not initialized. Call init() first.");
      return false;
    }

    if (this.recording) {
      return true;
    }

    try {
      // Build rrweb options
      const rrwebOptions = this.buildRrwebOptions();

      // Start recording using the rrweb instance
      // rrweb.record() requires an 'emit' function (not 'onRecord')
      this.rrwebStopFn = this.rrwebLib.record({
        ...rrwebOptions,
        emit: (event: any) => {
          if (this.shouldSampleEvent()) {
            this.handleRrwebEvent(event);
          }
        },
      });

      this.recording = true;

      if (this.config.debug) {
        console.log("[RrwebManager] Recording started");
      }

      return true;
    } catch (error) {
      console.error("[RrwebManager] Failed to start recording:", error);
      return false;
    }
  }

  /**
   * Stop recording
   */
  public stopRecording(): void {
    if (this.rrwebStopFn) {
      this.rrwebStopFn();
      this.rrwebStopFn = null;
    }

    this.recording = false;

    if (this.config?.debug) {
      console.log("[RrwebManager] Recording stopped");
    }
  }

  /**
   * Check if recording is currently active
   */
  public isRecording(): boolean {
    return this.recording;
  }

  /**
   * Pause recording (for SDK disable)
   * Stops capturing but maintains state to resume later
   */
  public pause(): void {
    this.stopRecording();
  }

  /**
   * Resume recording (for SDK enable)
   * Restarts recording from where it left off using the same config
   */
  public resume(): void {
    if (this.initialized && this.config && !this.recording) {
      this.startRecording();
    }
  }

  /**
   * Destroy the manager and cleanup
   */
  public destroy(): void {
    this.stopRecording();
    this.onRecord = null;
    this.config = null;
    this.initialized = false;
  }

  /**
   * Build rrweb options from config
   */
  private buildRrwebOptions(): Record<string, any> {
    const config = this.config!;

    // Default mask input options (mask passwords, tokens, sensitive fields)
    const maskInputOptions: Record<string, boolean> = {
      password: true,
      hidden: true,
      checkbox: true,
      radio: true,
      color: true,
      date: true,
      "datetime-local": true,
      email: true,
      month: true,
      number: true,
      range: true,
      tel: true,
      text: true,
      textarea: true,
      time: true,
      url: true,
      week: true,
      ...config.maskInputOptions,
    };

    const options: Record<string, any> = {
      maskInputOptions,
      maskAllInputs: true,
      recordCanvas: false, // Disable canvas recording for performance
      recordCrossOriginIframes: false,

      // Use global capture constants for blocking, ignoring, and masking
      blockClass: CAPTURE_CONSTANTS.NO_CAPTURE_CLASS,
      ignoreClass: CAPTURE_CONSTANTS.IGNORE_CLASS,
      maskTextClass: CAPTURE_CONSTANTS.MASK_CLASS,

      sampling: {
        // Adaptive sampling for performance
        mousemove: true,
        input: true,
        scroll: true,
        media: false,
      },
    };

    // Add block selectors - always include no-capture class
    const defaultBlockSelectors = [`.${CAPTURE_CONSTANTS.NO_CAPTURE_CLASS}`];
    if (config.blockSelectors && config.blockSelectors.length > 0) {
      options.blockSelectors = [
        ...defaultBlockSelectors,
        ...config.blockSelectors,
      ];
    } else {
      options.blockSelectors = defaultBlockSelectors;
    }

    // Add mask selectors
    if (config.maskSelectors && config.maskSelectors.length > 0) {
      options.maskSelectors = config.maskSelectors;
    }

    return options;
  }

  /**
   * Determine if event should be sampled based on sample rate
   */
  private shouldSampleEvent(): boolean {
    const sampleRate = this.config?.sampleRate ?? 1.0;
    if (sampleRate >= 1.0) return true;
    if (sampleRate <= 0) return false;
    return Math.random() < sampleRate;
  }

  /**
   * Handle a rrweb event and pass to tracker
   */
  private handleRrwebEvent(event: any): void {
    if (!this.onRecord) return;

    try {
      this.onRecord(event);
    } catch (error) {
      console.error("[RrwebManager] Error processing rrweb event:", error);
    }
  }

  /**
   * Get current recording status info
   */
  public getStatus(): {
    recording: boolean;
    initialized: boolean;
    debug: boolean;
  } {
    return {
      recording: this.recording,
      initialized: this.initialized,
      debug: this.config?.debug ?? false,
    };
  }
}

/**
 * Helper to transform rrweb events to SDK RrwebEvent format
 */
export function transformRrwebEvent(
  rrwebEvent: any,
  sessionId: string,
  replayId: string,
  clientId: string,
  userId: string | null | undefined,
  url: string,
  referrer?: string,
): {
  type: "rrweb";
  timestamp: number;
  sessionId: string;
  replayId: string;
  clientId: string;
  userId?: string | null;
  url: string;
  referrer?: string;
  rrwebPayload: any;
  schemaVersion: string;
} {
  return {
    type: "rrweb",
    timestamp: rrwebEvent.timestamp || Date.now(),
    sessionId,
    replayId,
    clientId,
    userId: userId || undefined,
    url,
    referrer,
    rrwebPayload: {
      type: rrwebEvent.type,
      data: rrwebEvent.data,
      timestamp: rrwebEvent.timestamp,
    },
    schemaVersion: "1.0",
  };
}
