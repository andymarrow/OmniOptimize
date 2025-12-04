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
 */
export function initializeSDK(config: SDKConfig) {
  globalContainer = new Container(config);

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
export function destroySDK() {
  if (globalContainer) {
    globalContainer.destroy();
    globalContainer = null;
  }
}

// Export all public types and classes
export * from "./types";
export { Container } from "./di/Container";
export { Tracker } from "./tracker/Tracker";
export { Config } from "./config/Config";
export { SessionManager } from "./session/SessionManager";
export { EventQueue } from "./queue/EventQueue";
export {
  ITransmitter,
  FetchTransmitter,
  BeaconTransmitter,
} from "./transmitter";
