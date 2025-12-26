import "dotenv/config";
import { Hono } from "hono";
import { logger as honoLogger } from "hono/logger";
import { cors } from "hono/cors";
import { openAPIRouteHandler } from "hono-openapi";
import { swaggerUI } from "@hono/swagger-ui";
import {
  createHealthRouter,
  createIngestRouter,
  createSessionsRouter,
  createHeatmapsRouter,
  createRetentionRouter,
  createTrafficRouter,
  createOverviewRouter,
  createTopPagesRouter,
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

  // Health router with OpenAPI docs
  app.route("/", createHealthRouter(queue));

  // OpenAPI documentation endpoint
  app.get(
    "/openapi.json",
    openAPIRouteHandler(app, {
      documentation: {
        info: {
          title: "OmniOptimize Analytics Backend",
          version: "1.0.0",
          description:
            "High-performance analytics ingestion and querying service",
        },
        servers: [
          {
            url: process.env.BACKEND_URL || "http://localhost:5000",
            description: "API Server",
          },
        ],
      },
    })
  );

  // Swagger UI
  app.get("/docs", swaggerUI({ url: "/openapi.json" }));

  // Root endpoint
  app.get("/", (c) => {
    return c.json({
      service: "omni-ingestor",
      version: "1.0.0",
      status: "running",
      docs: "/docs",
      openapi: "/openapi.json",
      endpoints: {
        health: "GET /health",
        ingest: "POST /ingest",
        sessions: "GET /sessions/:sessionId",
        replays: "GET /replays/:replayId",
        projectSessions: "GET /projects/:projectId/sessions",
        heatmaps: "GET /heatmaps/:projectId/:url",
        retention: "GET /analytics/retention",
        traffic: "GET /analytics/traffic",
        overview: "GET /analytics/overview",
        topPages: "GET /analytics/top-pages",
      },
    });
  });

  // Ingest route
  app.route("/ingest", createIngestRouter(queue));

  // Sessions routes
  app.route("/sessions", createSessionsRouter());

  // Heatmaps routes
  app.route("/heatmaps", createHeatmapsRouter());

  // Analytics routes
  app.route("/analytics/retention", createRetentionRouter());
  app.route("/analytics/traffic", createTrafficRouter());
  app.route("/analytics/overview", createOverviewRouter());
  app.route("/analytics/top-pages", createTopPagesRouter());

  console.log("✓ Backend initialized");
}

// Start server
const port = parseInt(process.env.PORT || "3000", 10);

initialize()
  .then(() => {
    console.log(`\n✓ Server listening on http://localhost:${port}`);
    console.log(`📚 API docs available at http://localhost:${port}/docs`);
  })
  .catch((error) => {
    console.error("Failed to initialize:", error);
    process.exit(1);
  });

export default app;
