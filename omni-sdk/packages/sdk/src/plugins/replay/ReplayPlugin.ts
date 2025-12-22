import type { IPlugin, PluginContext } from "../../types/plugin";
import type { Tracker } from "../../tracker/Tracker";
import type { RrwebEvent } from "../../types/events/snapshot";
import {
  RrwebManager,
  type RrwebManagerConfig,
  transformRrwebEvent,
} from "../../utils/rrwebIntegration";

/**
 * ReplayPlugin manages rrweb recording for session replay
 *
 * Responsibilities:
 * - Initialize and manage rrweb recording lifecycle
 * - Start recording on page load
 * - Stop and restart recording on session expiration (inactivity timeout)
 * - Track user activity to keep session alive
 * - Transform rrweb events to SDK format and emit to tracker
 *
 * Session Expiration Handling:
 * When session expires due to inactivity:
 * 1. Stop current rrweb recording
 * 2. SessionManager rotates sessionId
 * 3. ReplayPlugin restarts rrweb recording with new sessionId
 * 4. First event is a full snapshot
 *
 * Activity Tracking:
 * - Tracks clicks, key presses, scroll events to update session activity
 * - Prevents session from expiring during user interaction
 */
export class ReplayPlugin implements IPlugin {
  public readonly name = "replay";
  public readonly version = "1.0.0";
  private initialized = false;
  private tracker: Tracker | null = null;
  private rrwebManager: RrwebManager | null = null;
  private enabled = false;
  private activityListeners: Map<string, EventListener> = new Map();

  constructor(private rrwebInstance: any) {
    if (!rrwebInstance) {
      throw new Error("[ReplayPlugin] rrweb instance is required");
    }
  }

  /**
   * Initialize the replay plugin
   */
  public async init(context: PluginContext): Promise<void> {
    if (this.initialized) return;

    this.tracker = context.tracker;
    const config = context.config;
    const replayConfig = config?.getReplayConfig?.() || {};

    // Check if replay is enabled
    this.enabled = replayConfig.enabled === true;

    if (!this.enabled) {
      this.initialized = true;
      if (config?.isDebugEnabled?.()) {
        console.log("[ReplayPlugin] Replay recording is disabled");
      }
      return;
    }

    // Initialize RrwebManager
    const rrwebManagerConfig: RrwebManagerConfig = {
      enabled: true,
      onRecord: (event: any) => this.handleRrwebEvent(event),
      debug: replayConfig.debug || false,
      sampleRate: replayConfig.sampleRate ?? 1.0,
      blockSelectors: replayConfig.blockSelectors,
      maskSelectors: replayConfig.maskSelectors,
      maskInputOptions: replayConfig.maskInputOptions,
    };

    try {
      this.rrwebManager = new RrwebManager(this.rrwebInstance);
      this.rrwebManager.init(rrwebManagerConfig);
      this.initialized = true;

      // Start recording on initialization
      this.startRecording();

      // Set up activity tracking to keep session alive
      this.setupActivityTracking();

      // Hook into session expiration
      if (this.tracker && "getSessionManager" in this.tracker) {
        const sm = (this.tracker as any).getSessionManager?.();
        if (sm && typeof sm.setExpirationCallback === "function") {
          sm.setExpirationCallback((newSessionId: string) => {
            this.onSessionExpired(newSessionId);
          });
        }
      }

      if (replayConfig.debug) {
        console.log("[ReplayPlugin] Initialized with rrweb recording");
      }
    } catch (error) {
      console.error("[ReplayPlugin] Failed to initialize:", error);
    }
  }

  /**
   * Start rrweb recording
   */
  private startRecording(): void {
    if (!this.rrwebManager) return;

    try {
      const success = this.rrwebManager.startRecording();
      if (success) {
        console.log("[ReplayPlugin] Recording started");
      }
    } catch (error) {
      console.error("[ReplayPlugin] Failed to start recording:", error);
    }
  }

  /**
   * Stop rrweb recording
   */
  private stopRecording(): void {
    if (!this.rrwebManager) return;

    try {
      this.rrwebManager.stopRecording();
      console.log("[ReplayPlugin] Recording stopped");
    } catch (error) {
      console.error("[ReplayPlugin] Failed to stop recording:", error);
    }
  }

  /**
   * Handle rrweb event: transform and track
   */
  private handleRrwebEvent(rrwebEvent: any): void {
    if (!this.tracker) return;

    try {
      // Get tracker methods safely
      const getSessionId = (this.tracker as any).getSessionId?.bind(
        this.tracker
      );
      const getConfig = (this.tracker as any).getConfig?.bind(this.tracker);
      const trackRrweb = (this.tracker as any).trackRrweb?.bind(this.tracker);

      const config = getConfig?.();
      const clientId = config?.getClientId?.() || "";
      const replayId = config?.getReplayId?.() || "";
      const userId = config?.getUserId?.() || null;

      // Transform rrweb event to SDK format
      const sdkRrwebEvent: RrwebEvent = transformRrwebEvent(
        rrwebEvent,
        getSessionId?.() || "",
        replayId,
        clientId,
        userId,
        window.location.href,
        document.referrer
      );

      // Track the event
      trackRrweb?.(sdkRrwebEvent);
    } catch (error) {
      console.error("[ReplayPlugin] Error handling rrweb event:", error);
    }
  }

  /**
   * Set up activity tracking to keep session alive
   * Listens for user interactions and updates session activity
   */
  private setupActivityTracking(): void {
    if (!this.tracker) return;

    const updateActivity = () => {
      try {
        const sm = (this.tracker as any).getSessionManager?.();
        sm?.updateActivity?.();
      } catch (e) {
        // Silently fail if session manager not available
      }
    };

    // Track clicks
    const handleClick = (e: Event) => {
      updateActivity();
    };

    // Track key presses
    const handleKeypress = (e: Event) => {
      updateActivity();
    };

    // Track scroll
    const handleScroll = (e: Event) => {
      updateActivity();
    };

    // Track mouse move (throttled to avoid excessive updates)
    let lastMoveTime = 0;
    const handleMousemove = (e: Event) => {
      const now = Date.now();
      if (now - lastMoveTime > 30000) {
        // Update every 30 seconds max
        updateActivity();
        lastMoveTime = now;
      }
    };

    try {
      document.addEventListener("click", handleClick, true);
      document.addEventListener("keypress", handleKeypress, true);
      window.addEventListener("scroll", handleScroll, true);
      document.addEventListener("mousemove", handleMousemove, true);

      this.activityListeners.set("click", handleClick);
      this.activityListeners.set("keypress", handleKeypress);
      this.activityListeners.set("scroll", handleScroll);
      this.activityListeners.set("mousemove", handleMousemove);
    } catch (error) {
      console.error(
        "[ReplayPlugin] Error setting up activity tracking:",
        error
      );
    }
  }

  /**
   * Clean up activity listeners
   */
  private cleanupActivityTracking(): void {
    try {
      this.activityListeners.forEach((listener, event) => {
        if (event === "scroll") {
          window.removeEventListener(event, listener, true);
        } else {
          document.removeEventListener(event, listener, true);
        }
      });
      this.activityListeners.clear();
    } catch (error) {
      console.error(
        "[ReplayPlugin] Error cleaning up activity tracking:",
        error
      );
    }
  }

  /**
   * Handle session expiration
   * Stop current recording and restart with new sessionId
   */
  private onSessionExpired(newSessionId: string): void {
    if (!this.enabled || !this.rrwebManager) return;

    console.log(
      "[ReplayPlugin] Session expired, restarting recording with new sessionId"
    );

    try {
      // Stop current recording
      this.stopRecording();

      // Small delay to ensure recording has stopped
      requestIdleCallback(() => {
        // Start new recording (will capture full snapshot on first event)
        this.startRecording();
      });
    } catch (error) {
      console.error("[ReplayPlugin] Error handling session expiration:", error);
    }
  }

  /**
   * Destroy the plugin and clean up resources
   */
  public async destroy(): Promise<void> {
    this.stopRecording();
    this.cleanupActivityTracking();

    if (this.rrwebManager) {
      this.rrwebManager.destroy();
      this.rrwebManager = null;
    }

    this.tracker = null;
    this.initialized = false;
  }

  /**
   * Get plugin status
   */
  public getStatus(): {
    name: string;
    version: string;
    initialized: boolean;
    enabled: boolean;
    recording: boolean;
  } {
    return {
      name: this.name,
      version: this.version,
      initialized: this.initialized,
      enabled: this.enabled,
      recording: this.rrwebManager?.isRecording() ?? false,
    };
  }
}
