import "dotenv/config";
import { createIngestionQueue } from "./src/queue/index";

async function testQueue() {
  console.log("🧪 Testing queue connection...");

  try {
    console.log("1. Creating queue...");
    const queue = await createIngestionQueue();
    console.log("✓ Queue created");

    console.log("2. Adding test job...");
    const job = await queue.add("ingest", {
      batchId: "test-" + Date.now(),
      timestamp: Date.now(),
      events: [
        {
          type: "click",
          eventId: "123e4567-e89b-12d3-a456-426614174000",
          projectId: "test",
          clientId: "test-client",
          sessionId: "test-session",
          userId: null,
          timestamp: Date.now(),
          url: "http://localhost:3000",
          referrer: "",
          pageDimensions: { w: 1024, h: 768 },
          viewport: { w: 1024, h: 768 },
          pageX: 100,
          pageY: 100,
          xNorm: 0.5,
          yNorm: 0.5,
          selector: "button",
          tagName: "button",
        },
      ],
    });
    console.log("✓ Job added:", job.id);

    console.log("\n✅ Queue is working!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Queue test failed:", error);
    process.exit(1);
  }
}

testQueue();
