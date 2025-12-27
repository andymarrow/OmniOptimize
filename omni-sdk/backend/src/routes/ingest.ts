import { Hono } from "hono";
import { describeRoute, resolver, validator } from "hono-openapi";
import { z } from "zod";
import type { Queue } from "bullmq";
import type { IncomingBatch } from "../types";
import { ingestHandler } from "../handlers";
import {
  BatchSchema,
  IngestSuccessResponseSchema,
  IngestErrorResponseSchema,
} from "../schemas/ingest";

/**
 * Create ingest router
 */
export function createIngestRouter(queue: Queue<IncomingBatch>) {
  const ingestRouter = new Hono();

  /**
   * POST /ingest
   * Accept batch, validate, enqueue for processing
   */
  ingestRouter.post(
    "/",
    describeRoute({
      description:
        "Ingest analytics batch for processing (pageviews, clicks, rrweb, etc)",
      responses: {
        202: {
          description: "Batch accepted for asynchronous processing",
          content: {
            "application/json": {
              schema: resolver(IngestSuccessResponseSchema),
            },
          },
        },
        400: {
          description: "Validation error",
          content: {
            "application/json": {
              schema: resolver(IngestErrorResponseSchema),
            },
          },
        },
        500: {
          description: "Server error",
          content: {
            "application/json": {
              schema: resolver(IngestErrorResponseSchema),
            },
          },
        },
      },
    }),
    validator("json", BatchSchema),
    async (c) => {
      try {
        const body = c.req.valid("json");
        const xForwardedFor = c.req.header("x-forwarded-for");

        const result = await ingestHandler(body, xForwardedFor, queue);

        if ("error" in result) {
          return c.json(result as any, (result.statusCode || 500) as 400 | 500);
        }

        return c.json(result as any, (result.statusCode || 202) as 202);
      } catch (error) {
        console.error("[Ingest Route] Error:", error);
        return c.json(
          {
            error:
              error instanceof Error ? error.message : "Internal server error",
          },
          500
        );
      }
    }
  );

  return ingestRouter;
}

// Export default instance (overridden in index.ts)
export default new Hono();
