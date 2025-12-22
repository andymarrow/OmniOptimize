/**
 * Event Queue
 * Batches events and transmits them using the injected ITransmitter
 * High-level module responsible for batching strategy
 * Single Responsibility: Event batching and transmission orchestration
 */

import type { Event, Batch } from "../types";
import type { ITransmitter } from "../transmitter/ITransmitter";
import { generateUUID } from "../utils";

export class EventQueue {
  private events: Event[] = [];
  private batchId: string = "";
  private flushTimer: NodeJS.Timeout | null = null;
  private readonly batchSize: number;
  private readonly batchTimeout: number;
  private readonly transmitters: ITransmitter[];
  private readonly onFlush?: (batch: Batch) => Promise<void>;
  private isProcessing = false;

  constructor(
    transmitters: ITransmitter[],
    batchSize: number = 50,
    batchTimeout: number = 10000,
    onFlush?: (batch: Batch) => Promise<void>
  ) {
    this.transmitters = transmitters.sort(
      (a, b) => (b.getPriority?.() ?? 0) - (a.getPriority?.() ?? 0)
    );
    this.batchSize = batchSize;
    this.batchTimeout = batchTimeout;
    this.onFlush = onFlush;
    this.batchId = this.generateBatchId();
  }

  /**
   * Add an event to the queue
   */
  add(event: Event): void {
    this.events.push(event);

    // Flush if batch size reached
    if (this.events.length >= this.batchSize) {
      this.flush();
    } else if (!this.flushTimer) {
      // Start timer if not already running
      this.flushTimer = setTimeout(() => this.flush(), this.batchTimeout);
    }
  }

  /**
   * Flush all queued events
   */
  async flush(): Promise<void> {
    if (this.events.length === 0 || this.isProcessing) {
      return;
    }

    this.isProcessing = true;

    try {
      // Clear timer
      if (this.flushTimer) {
        clearTimeout(this.flushTimer);
        this.flushTimer = null;
      }

      // Create batch
      const batch: Batch = {
        events: [...this.events],
        batchId: this.batchId,
        timestamp: Date.now(),
      };

      // Clear events
      this.events = [];

      // Generate new batch ID
      this.batchId = this.generateBatchId();

      // Call custom flush handler if provided
      if (this.onFlush) {
        await this.onFlush(batch);
      } else {
        // Transmit batch using available transmitter
        await this.transmit(batch);
      }
    } catch (error) {
      console.error("[EventQueue] Error flushing batch:", error);
      // Re-add events to queue for retry? Or drop?
      // For now, just log the error
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Transmit batch using best available transmitter
   */
  private async transmit(batch: Batch): Promise<void> {
    for (const transmitter of this.transmitters) {
      if (transmitter.isAvailable()) {
        try {
          await transmitter.send(batch);
          return;
        } catch (error) {
          // Try next transmitter
          console.warn("[EventQueue] Transmitter failed, trying next:", error);
        }
      }
    }

    throw new Error("No available transmitters");
  }

  /**
   * Get current queue size
   */
  getQueueSize(): number {
    return this.events.length;
  }

  /**
   * Clear the queue without sending
   */
  clear(): void {
    this.events = [];
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
  }

  /**
   * Destroy the queue
   */
  destroy(): void {
    this.flush().catch(() => {
      // Silently fail on destroy
    });
    this.clear();
  }

  /**
   * Generate unique batch ID
   */
  private generateBatchId(): string {
    return `batch-${Date.now()}-${generateUUID().substring(0, 8)}`;
  }
}
