import { describe, test, expect, mock, beforeEach } from "bun:test";
import type { RrwebEventData } from "../../../src/types";

// 1. Mock DB client to prevent connection attempt and env check
mock.module("../../../src/db/client", () => ({
    db: {},
}));

// 2. Mock repositories
const mockInsertRrwebEvent = mock(() => Promise.resolve());
const mockUpsertSession = mock(() => Promise.resolve());
const mockInsertEvent = mock(() => Promise.resolve());
const mockUpsertUserFirstSeen = mock(() => Promise.resolve());
const mockUpsertUserDailyActivity = mock(() => Promise.resolve());

mock.module("../../../src/repositories", () => ({
    rrwebRepository: {
        insertRrwebEvent: mockInsertRrwebEvent,
    },
    // Required to satisfy other imports if shared
    heatmapRepository: {},
    sessionRepository: {
        upsertSession: mockUpsertSession,
    },
    eventRepository: {
        insertEvent: mockInsertEvent,
    },
    userRepository: {
        upsertUserFirstSeen: mockUpsertUserFirstSeen,
        upsertUserDailyActivity: mockUpsertUserDailyActivity,
    },
}));

describe("RrwebProcessor", () => {
    beforeEach(() => {
        mockInsertRrwebEvent.mockClear();
        mockUpsertSession.mockClear();
        mockInsertEvent.mockClear();
        mockUpsertUserFirstSeen.mockClear();
        mockUpsertUserDailyActivity.mockClear();
    });

    test("processRrwebEvent should record event and process base event", async () => {
        // Dynamic import to ensure mocks are applied
        const { processRrwebEvent } = await import("../../../src/processors/RrwebProcessor");

        const mockEvent: RrwebEventData = {
            type: "rrweb",
            eventId: "evt_rr_456",
            projectId: "proj_abc",
            sessionId: "sess_xyz",
            replayId: "replay_789",
            clientId: "client_1",
            userId: "user_1",
            timestamp: Date.now(),
            url: "http://example.com/app",
            referrer: "http://google.com",
            schemaVersion: "v1",
            rrwebPayload: {
                type: 3,
                data: { tag: "div" },
                timestamp: Date.now(),
            },
            pageDimensions: { w: 1024, h: 768 },
            viewport: { w: 1024, h: 768 },
        };

        await processRrwebEvent(mockEvent, "US", "Desktop");

        // 1. Verify Rrweb Event Insert
        expect(mockInsertRrwebEvent).toHaveBeenCalledTimes(1);
        expect(mockInsertRrwebEvent).toHaveBeenCalledWith({
            eventId: "evt_rr_456",
            projectId: "proj_abc",
            sessionId: "sess_xyz",
            replayId: "replay_789",
            clientId: "client_1",
            userId: "user_1",
            timestamp: expect.any(Date),
            url: "http://example.com/app",
            referrer: "http://google.com",
            rrwebPayload: mockEvent.rrwebPayload,
            schemaVersion: "v1",
            pageWidth: 1024,
            pageHeight: 768,
            viewportWidth: 1024,
            viewportHeight: 768,
        });

        // 2. Verify Session Upsert
        expect(mockUpsertSession).toHaveBeenCalledTimes(1);
        expect(mockUpsertSession).toHaveBeenCalledWith({
            sessionId: "sess_xyz",
            projectId: "proj_abc",
            clientId: "client_1",
            userId: "user_1",
            location: "US",
            device: "Desktop",
        });

        // 3. Verify Event Insert
        expect(mockInsertEvent).toHaveBeenCalledTimes(1);
        expect(mockInsertEvent).toHaveBeenCalledWith(expect.objectContaining({
            eventId: "evt_rr_456",
            type: "rrweb",
        }));

        // 4. Verify Retention Tracking
        expect(mockUpsertUserFirstSeen).toHaveBeenCalled();
        expect(mockUpsertUserDailyActivity).toHaveBeenCalled();
    });
});
