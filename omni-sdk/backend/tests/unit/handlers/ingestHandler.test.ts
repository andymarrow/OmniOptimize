import { describe, test, expect, mock, beforeEach } from "bun:test";
import { ingestHandler } from "../../../src/handlers/ingest.handler";
import type { Queue } from "bullmq";

// Mock geolocation util
mock.module("../../../src/utils/geolocation", () => ({
    getCountryFromHeader: mock(() => Promise.resolve("US")),
}));

// Mock schema (optional, but using real schema is better for integration-like unit tests)
// We will rely on real schema validation to fail/pass

describe("Ingest Handler", () => {
    let mockQueue: any;

    beforeEach(() => {
        // Create a mock queue with an add method
        mockQueue = {
            add: mock(() => Promise.resolve({ id: "job_123" })),
        };
    });

    test("ingestHandler should accept valid batch and enqueue job", async () => {
        const validBatch = {
            batchId: "batch_123",
            timestamp: Date.now(),
            events: [
                {
                    eventId: "123e4567-e89b-12d3-a456-426614174000", // Valid UUID
                    type: "pageview",
                    projectId: "proj_1",
                    sessionId: "sess_1",
                    clientId: "client_1",
                    userId: "user_1",
                    timestamp: Date.now(),
                    url: "http://example.com",
                    referrer: "http://google.com", // Required
                    pageDimensions: { w: 1024, h: 768 },
                    viewport: { w: 1024, h: 768 },
                },
            ],
        };

        const result = await ingestHandler(validBatch, "1.2.3.4", mockQueue as Queue);

        // 1. Check success response
        expect(result).toBeDefined();
        expect(result!.statusCode).toBe(202);
        expect((result as any).success).toBe(true);
        expect((result as any).jobId).toBe("job_123");

        // 2. Check interaction with queue
        expect(mockQueue.add).toHaveBeenCalledTimes(1);
        // Argument 1: name
        expect(mockQueue.add.mock.calls[0][0]).toBe("ingest");
        // Argument 2: job data (includes location)
        expect(mockQueue.add.mock.calls[0][1]).toEqual(expect.objectContaining({
            batchId: "batch_123",
            location: "US", // From mocked util
        }));
    });

    test("ingestHandler should return 400 for invalid batch", async () => {
        // Missing required fields like 'events' and 'batchId'
        const invalidBatch = {
            foo: "bar",
        };

        const result = await ingestHandler(invalidBatch, undefined, mockQueue as Queue);

        expect(result).toBeDefined();
        expect(result!.statusCode).toBe(400);
        expect((result as any).error).toContain("Validation error");

        // Should NOT enqueue
        expect(mockQueue.add).not.toHaveBeenCalled();
    });

    test("ingestHandler should return 500 when queue fails", async () => {
        const validBatch = {
            batchId: "batch_fail",
            timestamp: Date.now(),
            events: [
                {
                    eventId: "123e4567-e89b-12d3-a456-426614174000",
                    type: "pageview",
                    projectId: "p1",
                    sessionId: "s1",
                    clientId: "c1",
                    userId: "u1",
                    timestamp: Date.now(),
                    url: "http://example.com",
                    referrer: "ref",
                    pageDimensions: { w: 100, h: 100 },
                    viewport: { w: 100, h: 100 },
                }
            ],
        };

        // Make queue throw error
        mockQueue.add = mock(() => Promise.reject(new Error("Redis connection failed")));

        const result = await ingestHandler(validBatch, undefined, mockQueue as Queue);

        expect(result).toBeDefined();
        expect(result!.statusCode).toBe(500);
        expect((result as any).error).toBe("Redis connection failed");
    });
});
