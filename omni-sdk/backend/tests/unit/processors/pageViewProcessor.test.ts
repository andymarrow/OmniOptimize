import { describe, test, expect, mock, beforeEach } from "bun:test";
import type { PageViewEventData } from "../../../src/types";

// 1. Mock DB client to prevent connection attempt and env check
mock.module("../../../src/db/client", () => ({
    db: {},
}));

// 2. Mock repositories
const mockUpsertSession = mock(() => Promise.resolve());
const mockInsertEvent = mock(() => Promise.resolve());
const mockUpsertUserFirstSeen = mock(() => Promise.resolve());
const mockUpsertUserDailyActivity = mock(() => Promise.resolve());

mock.module("../../../src/repositories", () => ({
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
    // Mock other repositories to satisfy shared imports
    heatmapRepository: {},
    rrwebRepository: {},
    trafficAnalyticsRepository: {},
    overviewAnalyticsRepository: {},
    topPagesRepository: {},
    retentionRepository: {},
}));

describe("PageViewProcessor", () => {
    beforeEach(() => {
        mockUpsertSession.mockClear();
        mockInsertEvent.mockClear();
        mockUpsertUserFirstSeen.mockClear();
        mockUpsertUserDailyActivity.mockClear();
    });

    test("processPageViewEvent should process base event with correct arguments", async () => {
        // Dynamic import to ensure mocks are applied
        const { processPageViewEvent } = await import("../../../src/processors/PageViewProcessor");

        const mockEvent: PageViewEventData = {
            type: "pageview",
            eventId: "evt_pv_123",
            projectId: "proj_abc",
            sessionId: "sess_xyz",
            clientId: "client_1",
            userId: "user_1",
            timestamp: Date.now(),
            url: "http://example.com/home",
            referrer: "http://google.com",
            pageDimensions: { w: 1024, h: 768 },
            viewport: { w: 1024, h: 768 },
            screenClass: "desktop",
        };

        await processPageViewEvent(mockEvent, "US", "Desktop");

        // 1. Verify Session Upsert
        expect(mockUpsertSession).toHaveBeenCalledTimes(1);
        expect(mockUpsertSession).toHaveBeenCalledWith({
            sessionId: "sess_xyz",
            projectId: "proj_abc",
            clientId: "client_1",
            userId: "user_1",
            location: "US", // Passed explicitly
            device: "Desktop", // Passed explicitly
        });

        // 2. Verify Event Insert
        expect(mockInsertEvent).toHaveBeenCalledTimes(1);
        expect(mockInsertEvent).toHaveBeenCalledWith(expect.objectContaining({
            eventId: "evt_pv_123",
            type: "pageview",
        }));

        // 3. Verify Retention Tracking
        expect(mockUpsertUserFirstSeen).toHaveBeenCalled();
        expect(mockUpsertUserDailyActivity).toHaveBeenCalled();
    });
});
