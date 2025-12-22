/**
 * ITransmitter Interface
 * Defines the contract for event transmission strategies
 * Open/Closed Principle: Open for extension (new transmitters), closed for modification
 */

import type { Batch } from "../types";

export interface ITransmitter {
  send(batch: Batch): Promise<void>;
  isAvailable(): boolean;
  getPriority?(): number;
}
