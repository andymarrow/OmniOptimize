import type { Context } from "hono";
import type { Queue } from "bullmq";
import type { IncomingBatch } from "../types";
import { checkDbConnection } from "../db/client";

/**
 * GET /health handler
 * Returns system health status
 */
export async function healthHandler(c: Context, queue: Queue<IncomingBatch>) {
  try {
    const dbOk = await checkDbConnection();

    // Get queue health from existing queue instance
    let queueHealth = null;
    try {
      const counts = await queue.getJobCounts();
      queueHealth = {
        active: counts.active,
        waiting: counts.waiting,
        completed: counts.completed,
        failed: counts.failed,
        delayed: counts.delayed,
      };
    } catch (error) {
      console.error("[Health] Error getting queue counts:", error);
    }

    const isHealthy = dbOk && queueHealth !== null;

    return c.json(
      {
        status: isHealthy ? "ok" : "degraded",
        database: dbOk ? "connected" : "disconnected",
        queue: queueHealth
          ? {
              active: queueHealth.active,
              waiting: queueHealth.waiting,
              completed: queueHealth.completed,
              failed: queueHealth.failed,
            }
          : null,
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
