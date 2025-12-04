/**
 * Beacon Transmitter
 * Sends events via the Navigator Beacon API
 * Ensures delivery even when page is being unloaded
 * Lower reliability but guaranteed attempt on page close
 */

import type { Batch } from "../types";
import { ITransmitter } from "./ITransmitter";

export class BeaconTransmitter implements ITransmitter {
  private readonly endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  isAvailable(): boolean {
    return (
      typeof navigator !== "undefined" &&
      typeof navigator.sendBeacon === "function"
    );
  }

  getPriority(): number {
    return 5; // Lower priority, used as fallback
  }

  async send(batch: Batch): Promise<void> {
    if (!this.isAvailable()) {
      throw new Error("Navigator.sendBeacon not available");
    }

    try {
      const sent = navigator.sendBeacon(this.endpoint, JSON.stringify(batch));

      if (!sent) {
        throw new Error("sendBeacon returned false - queue may be full");
      }
    } catch (error) {
      throw error instanceof Error
        ? error
        : new Error(`Failed to send beacon: ${String(error)}`);
    }
  }
}
