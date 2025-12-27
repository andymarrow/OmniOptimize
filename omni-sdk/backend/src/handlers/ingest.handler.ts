import type { Queue, Job } from "bullmq";
import type { IncomingBatch } from "../types";
import { getCountryFromHeader } from "../utils/geolocation";
import { BatchSchema } from "../schemas/ingest";

/**
 * Ingest handler - accepts batch, validates, enqueues
 * No Hono/OpenAPI code here, just business logic
 */
export async function ingestHandler(
  batch: unknown,
  xForwardedFor: string | undefined,
  queue: Queue<IncomingBatch>
) {
  // Validate batch
  const validation = BatchSchema.safeParse(batch);
  if (!validation.success) {
    return {
      error: `Validation error: ${validation.error.errors
        .map((e) => `${e.path.join(".")}: ${e.message}`)
        .join(", ")}`,
      statusCode: 400,
    };
  }

  const batchData = validation.data;

  // Get location from x-forwarded-for header (Render proxy)
  const location = await getCountryFromHeader(xForwardedFor);

  // Enqueue batch with location metadata
  console.log("[Ingest] Enqueuing batch:", batchData.batchId);
  console.log("[Ingest] Location:", location);

  try {
    const jobData = {
      ...batchData,
      location,
    };

    const job = (await Promise.race([
      queue.add("ingest", jobData, {
        jobId: batchData.batchId,
      }),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Queue.add() timeout after 5 seconds")),
          5000
        )
      ),
    ])) as Job<any>;

    console.log(
      `[Ingest] ✓ Enqueued batch ${batchData.batchId} with ${batchData.events.length} events (Job ID: ${job.id})`
    );

    return {
      success: true,
      message: "Batch accepted for processing",
      batchId: batchData.batchId,
      jobId: job.id,
      statusCode: 202,
    };
  } catch (error) {
    console.error("[Ingest] Queue error:", error);
    return {
      error: error instanceof Error ? error.message : "Internal server error",
      statusCode: 500,
    };
  }
}
