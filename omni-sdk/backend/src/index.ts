import "dotenv/config";
import { Hono } from "hono";
import { logger as honoLogger } from "hono/logger";
import { cors } from "hono/cors";
import {
  ingestHandler,
  healthHandler,
  getSessionHandler,
  getReplayHandler,
  getHeatmapHandler,
  listHeatmapsHandler,
} from "./routes";
import { createIngestionQueue } from "./queue";
import { checkDbConnection } from "./db/client";
import { startWorker } from "./worker";

// Initialize app
const app = new Hono();

// Middleware
app.use("*", honoLogger());
app.use(
  "*",
  cors({
    origin: (
      process.env.ALLOWED_ORIGINS ||
      "http://localhost:3000,http://localhost:5173,http://localhost:5174"
    ).split(","),
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    maxAge: 86400,
  })
);

// Global state for queue
let queue: Awaited<ReturnType<typeof createIngestionQueue>> | null = null;

/**
 * Initialize app dependencies
 */
async function initialize() {
  console.log("🚀 Initializing backend...");

  // Check database connection
  const dbConnected = await checkDbConnection();
  if (!dbConnected) {
    throw new Error("Failed to connect to database");
  }

  // Initialize queue
  queue = await createIngestionQueue();
  console.log("✓ Queue initialized");

  // Start worker in background
  try {
    await startWorker();
  } catch (error) {
    console.error("Warning: Could not start worker:", error);
    // Don't fail if worker doesn't start, it can be run separately
  }

  console.log("✓ Backend initialized");
}

// Routes
app.get("/health", (c) => {
  if (!queue) {
    return c.json({ error: "Queue not initialized" }, 503);
  }
  return healthHandler(c, queue);
});

app.post("/ingest", async (c) => {
  if (!queue) {
    return c.json({ error: "Queue not initialized" }, 503);
  }
  return ingestHandler(c, queue);
});

app.get("/", (c) => {
  return c.json({
    service: "analytics-backend",
    version: "1.0.0",
    status: "running",
    endpoints: {
      health: "GET /health",
      ingest: "POST /ingest",
      sessions: "GET /sessions/:sessionId",
      replays: "GET /replays/:replayId",
      heatmaps: "GET /heatmaps/:projectId/:url",
    },
  });
});

// Session Replay Routes
app.get("/sessions/:sessionId", getSessionHandler);
app.get("/replays/:replayId", getReplayHandler);

// Heatmap Routes
app.get("/heatmaps/:projectId/:url", getHeatmapHandler);
app.get("/heatmaps/:projectId", listHeatmapsHandler);

// Start server
const port = parseInt(process.env.PORT || "3000", 10);

initialize()
  .then(() => {
    console.log(`\n✓ Server listening on http://localhost:${port}`);
  })
  .catch((error) => {
    console.error("Failed to initialize:", error);
    process.exit(1);
  });

export default app;
