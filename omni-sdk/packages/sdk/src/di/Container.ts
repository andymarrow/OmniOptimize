/**
 * Dependency Injection Container
 * Manages instantiation and lifecycle of SDK components
 * Implements Service Locator pattern for testability
 * Single Responsibility: Dependency management and wiring
 */

import type { SDKConfig } from "../types/config";
import { Config } from "../config/Config";
import { SessionManager } from "../session/SessionManager";
import { Tracker } from "../tracker/Tracker";
import { EventQueue } from "../queue/EventQueue";
import { FetchTransmitter, BeaconTransmitter } from "../transmitter";
import { PluginRegistry } from "../plugins/PluginRegistry";
import { PageViewPlugin } from "../plugins/page-view/PageViewPlugin";
import { ClickTrackingPlugin } from "../plugins/click-tracking/ClickTrackingPlugin";
import { ReplayPlugin } from "../plugins/replay/ReplayPlugin";
import type { ITransmitter } from "../transmitter/ITransmitter";
import type { IPlugin } from "../types";
import * as rrweb from "rrweb";

/**
 * Container options for customization
 */
export interface ContainerOptions {
  /**
   * Optional: Custom RrWeb instance (auto-imported by default)
   * If you need a specific rrweb version or configuration, pass it here
   */
  rrwebInstance?: any;

  /**
   * Custom transmitters (if not provided, will use Fetch + Beacon)
   */
  transmitters?: ITransmitter[];

  /**
   * Custom EventQueue implementation
   */
  eventQueue?: EventQueue;

  /**
   * Custom Tracker implementation
   */
  tracker?: Tracker;

  /**
   * Plugins to register (in addition to default auto-tracking plugins)
   */
  plugins?: IPlugin[];

  /**
   * Enable default auto-tracking plugins (PageView + Click tracking)
   * Default: true
   */
  enableAutoTracking?: boolean;
}

/**
 * DI Container for Omni SDK
 */
export class Container {
  private config: Config;
  private sessionManager: SessionManager;
  private transmitters: ITransmitter[];
  private eventQueue: EventQueue;
  private tracker: Tracker;
  private pluginRegistry: PluginRegistry;
  private rrwebInstance: any;
  private initialized = false;

  constructor(sdkConfig: SDKConfig, options?: ContainerOptions) {
    // Use provided rrweb instance or auto-import (rrweb is now required)
    this.rrwebInstance = options?.rrwebInstance || rrweb;

    // Initialize Config
    this.config = new Config(sdkConfig);

    // Initialize SessionManager with inactivity timeout from config
    this.sessionManager = new SessionManager(
      this.config.getSessionStorageKey(),
      this.config.getInactivityTimeoutMs()
    );

    // Setup Transmitters
    if (options?.transmitters) {
      this.transmitters = options.transmitters;
    } else {
      this.transmitters = [
        new FetchTransmitter(this.config.getEndpoint()),
        new BeaconTransmitter(this.config.getEndpoint()),
      ];
    }

    // Initialize EventQueue
    this.eventQueue =
      options?.eventQueue ??
      new EventQueue(
        this.transmitters,
        this.config.getBatchSize(),
        this.config.getBatchTimeout()
      );

    // Initialize Tracker
    this.tracker =
      options?.tracker ??
      new Tracker(this.config, this.sessionManager, this.eventQueue);

    // Initialize Plugin Registry
    this.pluginRegistry = new PluginRegistry();

    // Register default auto-tracking plugins
    const enableAutoTracking = options?.enableAutoTracking !== false;
    if (enableAutoTracking) {
      this.pluginRegistry.register(new PageViewPlugin());
      this.pluginRegistry.register(new ClickTrackingPlugin());

      // ReplayPlugin requires rrweb instance
      console.log("RRWEB INSTANCE IN CONTAINER", this.rrwebInstance);
      if (this.rrwebInstance) {
        this.pluginRegistry.register(new ReplayPlugin(this.rrwebInstance));
      } else if (this.config.isDebugEnabled()) {
        console.warn(
          "[Container] ReplayPlugin skipped: rrwebInstance not provided in options"
        );
      }
    }

    // Register custom plugins
    if (options?.plugins) {
      for (const plugin of options.plugins) {
        this.pluginRegistry.register(plugin);
      }
    }

    if (this.config.isDebugEnabled()) {
      console.log("[Container] SDK initialized with all dependencies");
    }
  }

  /**
   * Initialize the container and all plugins
   * Must be called after construction
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    await this.pluginRegistry.initialize({
      tracker: this.tracker,
      config: this.config,
      logger: this.config.isDebugEnabled()
        ? {
            debug: (msg, data) => console.log(`[OmniSDK] ${msg}`, data),
            info: (msg, data) => console.info(`[OmniSDK] ${msg}`, data),
            warn: (msg, data) => console.warn(`[OmniSDK] ${msg}`, data),
            error: (msg, err) => console.error(`[OmniSDK] ${msg}`, err),
          }
        : undefined,
    });

    this.initialized = true;

    if (this.config.isDebugEnabled()) {
      console.log("[Container] All plugins initialized");
    }
  }

  /**
   * Get Config instance
   */
  getConfig(): Config {
    return this.config;
  }

  /**
   * Get SessionManager instance
   */
  getSessionManager(): SessionManager {
    return this.sessionManager;
  }

  /**
   * Get Tracker instance (public API)
   */
  getTracker(): Tracker {
    return this.tracker;
  }

  /**
   * Get EventQueue instance
   */
  getEventQueue(): EventQueue {
    return this.eventQueue;
  }

  /**
   * Get transmitters
   */
  getTransmitters(): ITransmitter[] {
    return this.transmitters;
  }

  /**
   * Get plugin registry
   */
  getPluginRegistry(): PluginRegistry {
    return this.pluginRegistry;
  }

  /**
   * Check if initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Destroy container and cleanup resources
   */
  async destroy(): Promise<void> {
    await this.pluginRegistry.destroy();
    this.eventQueue.destroy();
    this.sessionManager.clearSession();
    this.initialized = false;

    if (this.config.isDebugEnabled()) {
      console.log("[Container] SDK destroyed");
    }
  }
}
