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
import type { ITransmitter } from "../transmitter/ITransmitter";

/**
 * Container options for customization
 */
export interface ContainerOptions {
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

  constructor(sdkConfig: SDKConfig, options?: ContainerOptions) {
    // Initialize Config
    this.config = new Config(sdkConfig);

    // Initialize SessionManager
    this.sessionManager = new SessionManager(
      this.config.getSessionStorageKey()
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

    if (this.config.isDebugEnabled()) {
      console.log("[Container] SDK initialized with all dependencies");
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
   * Destroy container and cleanup resources
   */
  destroy(): void {
    this.eventQueue.destroy();
    this.sessionManager.clearSession();

    if (this.config.isDebugEnabled()) {
      console.log("[Container] SDK destroyed");
    }
  }
}
