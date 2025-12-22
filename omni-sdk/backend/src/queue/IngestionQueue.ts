import { Queue, Worker } from "bullmq";
import { createClient } from "redis";
import type { RedisClientType } from "redis";
import type { IncomingBatch } from "../types";

// Create Redis client for regular operations
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

const redisClient: RedisClientType = createClient({
  url: redisUrl,
  socket: {
    reconnectStrategy: (retries) => Math.min(retries * 50, 500),
  },
});

redisClient.on("error", (err: any) => console.error("Redis Client Error", err));
redisClient.on("connect", () => console.log("✓ Redis client connected"));

// Connect on first use
let isConnected = false;
let queueInstance: Queue<IncomingBatch> | null = null;

async function ensureConnected() {
  if (!isConnected) {
    try {
      // Check if already connected
      if (redisClient.isOpen) {
        isConnected = true;
        return;
      }
      await redisClient.connect();
      isConnected = true;
    } catch (error: any) {
      if (error.message !== "Socket already opened") {
        throw error;
      }
      isConnected = true;
    }
  }
}

/**
 * IngestionQueue - accepts event batches from SDK
 * Singleton instance - reused across requests
 *
 * BullMQ automatically creates its own Redis connection internally
 * We just need to pass the connection options
 */
export const createIngestionQueue = async () => {
  if (queueInstance) {
    return queueInstance;
  }

  await ensureConnected();

  queueInstance = new Queue<IncomingBatch>("ingest", {
    connection: {
      url: redisUrl,
      maxRetriesPerRequest: null,
    },
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    },
  });

  queueInstance.on("error", (error: any) => {
    console.error("Queue error:", error);
  });

  console.log("✓ Ingestion queue created");

  return queueInstance;
};

export { redisClient };
