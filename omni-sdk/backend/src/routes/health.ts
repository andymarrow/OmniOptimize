import { Hono } from "hono";
import { describeRoute, resolver } from "hono-openapi";
import { z } from "zod";
import type { Queue } from "bullmq";
import type { IncomingBatch } from "../types";
import { checkDbConnection } from "../db/client";

/**
 * Define schemas for health endpoint
 */
const HealthResponseSchema = z.object({
  status: z.enum(["ok", "degraded", "error"]),
  database: z.enum(["connected", "disconnected"]),
  queue: z
    .object({
      active: z.number(),
      waiting: z.number(),
      completed: z.number(),
      failed: z.number(),
    })
    .nullable(),
});

const ErrorResponseSchema = z.object({
  status: z.string(),
  error: z.string(),
});

export function createHealthRouter(queue: Queue<IncomingBatch>) {
  const healthRouter = new Hono();

  /**
   * GET /health
   * System health check endpoint
   */
  healthRouter.get(
    "/",
    describeRoute({
      description: "System health status including database and queue metrics",
      responses: {
        200: {
          description: "System is healthy",
          content: {
            "application/json": {
              schema: resolver(HealthResponseSchema),
            },
          },
        },
        503: {
          description: "System degraded",
          content: {
            "application/json": {
              schema: resolver(HealthResponseSchema),
            },
          },
        },
        500: {
          description: "Server error",
          content: {
            "application/json": {
              schema: resolver(ErrorResponseSchema),
            },
          },
        },
      },
    }),
    async (c) => {
      try {
        const dbOk = await checkDbConnection();

        // Get queue health
        let queueHealth = null;
        try {
          const counts = await queue.getJobCounts();
          queueHealth = {
            active: counts.active,
            waiting: counts.waiting,
            completed: counts.completed,
            failed: counts.failed,
          };
        } catch (error) {
          console.error("[Health] Error getting queue counts:", error);
        }

        const isHealthy = dbOk && queueHealth !== null;

        return c.json(
          {
            status: isHealthy ? "ok" : "degraded",
            database: dbOk ? "connected" : "disconnected",
            queue: queueHealth,
          },
          isHealthy ? 200 : 503
        );
      } catch (error) {
        console.error("[Health] Error:", error);
        return c.json(
          {
            status: "error",
            error: error instanceof Error ? error.message : "Unknown error",
          },
          500
        );
      }
    }
  );

  return healthRouter;
}

// Export a default instance (will be overridden in index.ts)
export default new Hono();
