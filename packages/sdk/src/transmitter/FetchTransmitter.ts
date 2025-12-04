/**
 * Fetch Transmitter
 * Sends events via the Fetch API
 * Preferred for modern browsers
 */

import type { Batch } from "../types";
import { ITransmitter } from "./ITransmitter";

export class FetchTransmitter implements ITransmitter {
  private readonly endpoint: string;
  private readonly timeout: number;
  private readonly retries: number;

  constructor(endpoint: string, timeout: number = 30000, retries: number = 3) {
    this.endpoint = endpoint;
    this.timeout = timeout;
    this.retries = retries;
  }

  isAvailable(): boolean {
    return typeof fetch !== "undefined";
  }

  getPriority(): number {
    return 10; // Higher priority than beacon
  }

  async send(batch: Batch): Promise<void> {
    if (!this.isAvailable()) {
      throw new Error("Fetch API not available");
    }

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const response = await fetch(this.endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(batch),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          return;
        }

        lastError = new Error(
          `HTTP ${response.status}: ${response.statusText}`
        );
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Don't retry on abort or network errors immediately
        if (attempt < this.retries - 1) {
          // Exponential backoff
          await this.delay(Math.pow(2, attempt) * 1000);
        }
      }
    }

    throw lastError || new Error("Failed to send batch after all retries");
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
