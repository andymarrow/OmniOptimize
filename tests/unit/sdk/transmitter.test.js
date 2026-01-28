import { describe, test, expect, mock, beforeEach, afterEach } from "bun:test";
import { FetchTransmitter } from "../../../omni-sdk/packages/sdk/src/transmitter/FetchTransmitter";

describe("FetchTransmitter", () => {
    let mockFetch;

    beforeEach(() => {
        mockFetch = mock(() => Promise.resolve({
            ok: true,
            status: 200,
        }));
        global.fetch = mockFetch;
    });

    afterEach(() => {
        delete global.fetch;
    });

    test("should send simple batch successfully", async () => {
        const transmitter = new FetchTransmitter("http://api.test", "key-123");
        const batch = { batchId: "b1", events: [] };

        await transmitter.send(batch);

        expect(mockFetch).toHaveBeenCalledTimes(1);
        const [url, options] = mockFetch.mock.calls[0];

        expect(url).toBe("http://api.test?writeKey=key-123");
        expect(options.method).toBe("POST");
        expect(JSON.parse(options.body).batchId).toBe("b1");
    });

    test("should retry on failure", async () => {
        // First call fails, second succeeds
        mockFetch
            .mockImplementationOnce(() => Promise.resolve({ ok: false, status: 500, statusText: "Error" }))
            .mockImplementationOnce(() => Promise.resolve({ ok: true, status: 200 }));

        const transmitter = new FetchTransmitter("http://api.test", "key-123", 1000, 3);
        const batch = { batchId: "retry-me", events: [] };

        // Mock delay to speed up tests
        transmitter.delay = mock(() => Promise.resolve());

        await transmitter.send(batch);

        expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    test("should fail after maximum retries", async () => {
        mockFetch.mockImplementation(() => Promise.resolve({ ok: false, status: 500, statusText: "Fatal" }));

        const transmitter = new FetchTransmitter("http://api.test", "key-123", 1000, 2);

        // Mock delay
        transmitter.delay = mock(() => Promise.resolve());

        expect(transmitter.send({ batchId: "fail", events: [] }))
            .rejects.toThrow("HTTP 500: Fatal");

        // Wait a bit for pending promises
        await new Promise(r => setTimeout(r, 10));

        expect(mockFetch).toHaveBeenCalledTimes(2);
    });
});
