import { describe, test, expect, mock, beforeEach } from "bun:test";
import { EventQueue } from "../../../omni-sdk/packages/sdk/src/queue/EventQueue";

describe("EventQueue", () => {
    let mockTransmitter;
    let mockConfig;

    beforeEach(() => {
        // Setup simple mocks
        mockTransmitter = {
            isAvailable: mock(() => true),
            send: mock(() => Promise.resolve()),
            getPriority: mock(() => 10),
        };

        mockConfig = {
            isEnabled: mock(() => true),
        };
    });

    test("should add events to queue correctly", () => {
        const queue = new EventQueue([mockTransmitter], 50, 10000, undefined, mockConfig);

        queue.add({ type: "pageview", eventId: "123" });
        expect(queue.getQueueSize()).toBe(1);
    });

    test("should auto-flush when batch size is reached", async () => {
        // Small batch size to trigger flush
        const queue = new EventQueue([mockTransmitter], 2, 10000, undefined, mockConfig);

        queue.add({ type: "event_1" });
        expect(queue.getQueueSize()).toBe(1);

        queue.add({ type: "event_2" });

        // Wait for potential async flush completion
        await new Promise(r => setTimeout(r, 10));

        expect(queue.getQueueSize()).toBe(0);
        expect(mockTransmitter.send).toHaveBeenCalled();
    });

    test("should NOT add events if SDK is disabled", () => {
        mockConfig.isEnabled.mockReturnValue(false);
        const queue = new EventQueue([mockTransmitter], 10, 10000, undefined, mockConfig);

        queue.add({ type: "event_1" });
        expect(queue.getQueueSize()).toBe(0);
    });

    test("should use priority to sort transmitters", () => {
        const t1 = { getPriority: () => 10, isAvailable: () => true };
        const t2 = { getPriority: () => 50, isAvailable: () => true };

        const queue = new EventQueue([t1, t2]);

        // @ts-ignore - reaching into private for testing check
        const sorted = queue.transmitters;
        expect(sorted[0]).toBe(t2); // Priority 50 first
        expect(sorted[1]).toBe(t1); // Priority 10 second
    });

    test("should clear queue when clear() is called", () => {
        const queue = new EventQueue([mockTransmitter], 10, 10000, undefined, mockConfig);
        queue.add({ type: "test" });
        expect(queue.getQueueSize()).toBe(1);

        queue.clear();
        expect(queue.getQueueSize()).toBe(0);
    });
});
