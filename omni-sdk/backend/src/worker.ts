import { Worker } from "bullmq";
import { createIngestionQueue } from "./queue";
import {
  processRrwebEvent,
  processClickEvent,
  processPageViewEvent,
} from "./processors";
import type {
  IncomingBatch,
  Event,
  RrwebEventData,
  ClickEventData,
} from "./types";

/**
 * Start the worker process
 * Consumes ingestion queue and routes events by type
 */
export async function startWorker() {
  const queue = await createIngestionQueue();

  const worker = new Worker<IncomingBatch>(
    "ingest",
    async (job) => {
      console.log(
        `[Worker] Processing batch ${job.data.batchId} with ${job.data.events.length} events`
      );

      const results = {
        succeeded: 0,
        failed: 0,
        errors: [] as Array<{ eventId: string; error: string }>,
      };

      // Process each event independently (don't fail batch on single event error)
      for (const event of job.data.events) {
        try {
          await routeEvent(event);
          results.succeeded++;
        } catch (error) {
          results.failed++;
          results.errors.push({
            eventId: event.eventId,
            error: error instanceof Error ? error.message : String(error),
          });

          // Log error but continue processing batch
          console.error(
            `[Worker] Error processing event ${event.eventId} in batch ${job.data.batchId}:`,
            error
          );
        }
      }

      console.log(
        `[Worker] Batch ${job.data.batchId} complete: ${results.succeeded} succeeded, ${results.failed} failed`
      );

      // If all events failed, throw to trigger retry
      if (results.failed === job.data.events.length) {
        throw new Error(`All events in batch ${job.data.batchId} failed`);
      }

      return results;
    },
    {
      connection: {
        url: process.env.REDIS_URL || "redis://localhost:6379",
        maxRetriesPerRequest: null,
      },
      concurrency: 1, // Process one batch at a time
    }
  );

  worker.on("completed", (job) => {
    console.log(`[Worker] Job ${job.id} completed`);
  });

  worker.on("failed", async (job, err) => {
    console.error(
      `[Worker] Job ${job?.id} failed (attempt ${job?.attemptsMade || 1}/${
        job?.opts.attempts || 3
      }): ${err.message}`
    );
    // BullMQ keeps failed jobs available for inspection via queue.getFailed()
  });

  worker.on("error", (error) => {
    console.error("[Worker] Worker error:", error);
  });

  console.log("✓ Worker started");

  return { worker, queue };
}

/**
 * Route event to appropriate processor based on type
 */
async function routeEvent(event: Event) {
  const eventType = event.type;

  switch (eventType) {
    case "rrweb":
      return await processRrwebEvent(event as RrwebEventData);
    case "click":
      return await processClickEvent(event as ClickEventData);
    case "pageview":
      return await processPageViewEvent(event);
    case "input":
    case "route":
    case "custom":
    case "session_snapshot":
      // Not implemented yet
      console.log(
        `[Worker] Event type '${eventType}' not yet implemented, skipping`
      );
      return;
    default:
      console.warn(`[Worker] Unknown event type: ${eventType}`);
      return;
  }
}

// Run worker if executed directly
if (import.meta.main) {
  startWorker().catch((error) => {
    console.error("Failed to start worker:", error);
    process.exit(1);
  });
}
