/**
 * Omni Analytics SDK - Main Entry Point
 *
 * Usage:
 * import { initializeSDK } from '@omni-analytics/sdk';
 *
 * const { tracker } = initializeSDK({
 *   projectId: 'my-project',
 *   endpoint: 'https://api.example.com/events',
 * });
 *
 * tracker.trackPageView();
 * tracker.trackClick(element);
 */

import { Container } from "./di/Container";
import type { SDKConfig } from "./types";

// Global singleton instance
let globalContainer: Container | null = null;

/**
 * Initialize the Omni SDK with configuration
 * This automatically sets up and initializes all plugins
 */
export async function initializeSDK(config: SDKConfig) {
  if (globalContainer) {
    console.warn(
      "[OmniSDK] SDK already initialized, returning existing instance"
    );
    return {
      tracker: globalContainer.getTracker(),
      container: globalContainer,
    };
  }

  globalContainer = new Container(config);

  // Initialize plugins (this is where auto-tracking gets set up)
  await globalContainer.initialize();

  return {
    tracker: globalContainer.getTracker(),
    container: globalContainer,
  };
}

/**
 * Get the global SDK instance
 */
export function getSDK() {
  if (!globalContainer) {
    throw new Error("SDK not initialized. Call initializeSDK first.");
  }

  return globalContainer;
}

/**
 * Destroy the global SDK instance
 */
export async function destroySDK() {
  if (globalContainer) {
    await globalContainer.destroy();
    globalContainer = null;
  }
}

// Export all public types and classes
export * from "./types";
export { Container } from "./di/Container";
export type { ContainerOptions } from "./di/Container";
export { Tracker } from "./tracker/Tracker";
export { Config } from "./config/Config";
export { SessionManager } from "./session/SessionManager";
export { EventQueue } from "./queue/EventQueue";
export {
  ITransmitter,
  FetchTransmitter,
  BeaconTransmitter,
} from "./transmitter";
export { PluginRegistry } from "./plugins/PluginRegistry";
export { PageViewPlugin } from "./plugins/page-view/PageViewPlugin";
export {
  ClickTrackingPlugin,
  type ClickTrackingOptions,
} from "./plugins/click-tracking/ClickTrackingPlugin";
export { SessionSnapshotPlugin } from "./plugins/session-snapshot/SessionSnapshotPlugin";
export type { SessionSnapshotPluginOptions } from "./plugins/session-snapshot/SessionSnapshotPlugin";
export { RrwebManager, transformRrwebEvent } from "./utils/rrwebIntegration";
export type {
  RrwebManagerConfig,
  RrwebLibrary,
} from "./utils/rrwebIntegration";
export type { IPlugin, PluginContext, Logger } from "./types";
