/**
 * Transmitter types and interfaces
 */

import { Batch } from "./common";

/**
 * Transmitter strategy interface - allows pluggable transmission methods
 */
export interface ITransmitter {
  /**
   * Send a batch of events
   * @param batch The batch to send
   * @returns Promise that resolves when sent successfully
   */
  send(batch: Batch): Promise<void>;

  /**
   * Check if this transmitter is available in the current environment
   * @returns true if available (e.g., fetch/beacon API supported)
   */
  isAvailable(): boolean;

  /**
   * Optional: Get transmitter priority (higher = preferred)
   * Used by EventQueue to select best available transmitter
   */
  getPriority?(): number;
}

/**
 * Configuration for transmitters
 */
export interface TransmitterConfig {
  endpoint: string;
  timeout?: number;
  retries?: number;
  method?: "fetch" | "beacon";
}
