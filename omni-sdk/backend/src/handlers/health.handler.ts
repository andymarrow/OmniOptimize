import type { Queue } from "bullmq";
import type { IncomingBatch } from "../types";
import { checkDbConnection } from "../db/client";

/**
 * Health handler - returns system health status
 * No Hono/OpenAPI code here, just business logic
 */
export async function healthHandler(queue: Queue<IncomingBatch>) {
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

  return {
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
    statusCode: isHealthy ? 200 : 503,
  };
}
