import { z } from "zod";
import type { Context } from "hono";
import type { Queue, Job } from "bullmq";
import type { IncomingBatch } from "../types";

/**
 * Zod schemas for incoming batch validation
 */

const DimensionsSchema = z.object({
  w: z.number().int().positive(),
  h: z.number().int().positive(),
});

const RrwebPayloadSchema = z.object({
  type: z.number(),
  data: z.record(z.any()),
  timestamp: z.number().optional(),
});

const BaseEventSchema = z.object({
  eventId: z.string().uuid(),
  projectId: z.string().min(1),
  clientId: z.string().min(1),
  sessionId: z.string().min(1),
  userId: z.string().nullable(),
  type: z.enum([
    "pageview",
    "click",
    "input",
    "route",
    "custom",
    "session_snapshot",
    "rrweb",
  ]),
  timestamp: z.number(),
  url: z.string().url(),
  referrer: z.string(),
  pageDimensions: DimensionsSchema,
  viewport: DimensionsSchema,
  properties: z.record(z.any()).optional(),
});

const RrwebEventSchema = BaseEventSchema.extend({
  type: z.literal("rrweb"),
  replayId: z.string().min(1),
  rrwebPayload: RrwebPayloadSchema,
  schemaVersion: z.string(),
});

const ClickEventSchema = BaseEventSchema.extend({
  type: z.literal("click"),
  pageX: z.number(),
  pageY: z.number(),
  xNorm: z.number().min(0).max(1),
  yNorm: z.number().min(0).max(1),
  selector: z.string().min(1),
  tagName: z.string().min(1),
  elementTextHash: z.string().optional(),
  xpath: z.string().optional(),
  screenClass: z.enum(["mobile", "tablet", "desktop"]).optional(),
  layoutHash: z.string().optional(),
});

const EventSchema = z.union([
  RrwebEventSchema,
  ClickEventSchema,
  BaseEventSchema,
]);

const BatchSchema = z.object({
  batchId: z.string().min(1),
  timestamp: z.number(),
  events: z.array(EventSchema).min(1),
});

export type ValidatedBatch = z.infer<typeof BatchSchema>;

/**
 * Validate incoming batch
 */
export function validateBatch(
  data: unknown
): { valid: true; data: ValidatedBatch } | { valid: false; error: string } {
  try {
    const validated = BatchSchema.parse(data);
    return { valid: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        error: `Validation error: ${error.errors
          .map((e) => `${e.path.join(".")}: ${e.message}`)
          .join(", ")}`,
      };
    }
    return {
      valid: false,
      error: "Unknown validation error",
    };
  }
}

/**
 * POST /ingest handler
 * Accept batch, validate, enqueue, respond 202
 */
export async function ingestHandler(c: Context, queue: Queue<IncomingBatch>) {
  try {
    const body = await c.req.json();

    // Validate batch
    const validation = validateBatch(body);
    if (!validation.valid) {
      return c.json(
        {
          error: validation.error,
        },
        400
      );
    }

    const batch = validation.data;

    // Enqueue batch with timeout
    console.log("[Ingest] Enqueuing batch:", batch.batchId);
    console.log("[Ingest] Queue instance:", queue ? "✓ exists" : "✗ null");

    try {
      const job = (await Promise.race([
        queue.add("ingest", batch, {
          jobId: batch.batchId,
        }),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("Queue.add() timeout after 5 seconds")),
            5000
          )
        ),
      ])) as Job<IncomingBatch>;

      console.log(
        `[Ingest] ✓ Enqueued batch ${batch.batchId} with ${batch.events.length} events (Job ID: ${job.id})`
      );

      // Respond immediately with 202 Accepted
      return c.json(
        {
          success: true,
          message: "Batch accepted for processing",
          batchId: batch.batchId,
          jobId: job.id,
        },
        202
      );
    } catch (queueError) {
      console.error("[Ingest] Queue error:", queueError);
      throw queueError;
    }
  } catch (error) {
    console.error("[Ingest] Error:", error);
    return c.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      500
    );
  }
}
