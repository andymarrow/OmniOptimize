import { describe, test, expect, mock, beforeEach, afterEach } from "bun:test";
import { BeaconTransmitter } from "../../../omni-sdk/packages/sdk/src/transmitter/BeaconTransmitter";

describe("BeaconTransmitter", () => {
    let mockSendBeacon;

    beforeEach(() => {
        mockSendBeacon = mock(() => true);
        // Mock global navigator
        global.navigator = {
            sendBeacon: mockSendBeacon,
        };
    });

    afterEach(() => {
        delete global.navigator;
    });

    test("isAvailable should return true if sendBeacon exists", () => {
        const transmitter = new BeaconTransmitter("http://api.test", "key");
        expect(transmitter.isAvailable()).toBe(true);
    });

    test("should call navigator.sendBeacon with serialized batch", async () => {
        const transmitter = new BeaconTransmitter("http://api.test", "key-xyz");
        const batch = { batchId: "b-100", events: [] };

        await transmitter.send(batch);

        expect(mockSendBeacon).toHaveBeenCalled();
        const [url, body] = mockSendBeacon.mock.calls[0];

        expect(url).toBe("http://api.test?writeKey=key-xyz");
        expect(JSON.parse(body).batchId).toBe("b-100");
    });

    test("should throw error if sendBeacon returns false", async () => {
        mockSendBeacon.mockReturnValue(false);
        const transmitter = new BeaconTransmitter("http://api.test", "key");

        expect(transmitter.send({ batchId: "fail" }))
            .rejects.toThrow("sendBeacon returned false - queue may be full");
    });
});
