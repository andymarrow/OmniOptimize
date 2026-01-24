import { describe, test, expect, mock, beforeEach } from "bun:test";
import type { ClickEventData } from "../../../src/types";

// 1. Mock DB client to prevent connection attempt and env check
mock.module("../../../src/db/client", () => ({
    db: {},
}));

// 2. Mock repositories
// We define the mock functions here so we can reference them in expectations
const mockRecordClick = mock(() => Promise.resolve());
const mockUpsertSession = mock(() => Promise.resolve());
const mockInsertEvent = mock(() => Promise.resolve());
const mockUpsertUserFirstSeen = mock(() => Promise.resolve());
const mockUpsertUserDailyActivity = mock(() => Promise.resolve());

mock.module("../../../src/repositories", () => ({
    heatmapRepository: {
        recordClick: mockRecordClick,
    },
    // Mock other repositories to prevent "Export named ... not found" errors
    rrwebRepository: {
        insertRrwebEvent: mock(() => Promise.resolve()),
    },
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
    // Add other missing exports if needed by other tests running in the same context
    trafficAnalyticsRepository: {},
    overviewAnalyticsRepository: {},
    topPagesRepository: {},
    retentionRepository: {},
}));

describe("ClickProcessor", () => {
    beforeEach(() => {
        mockRecordClick.mockClear();
        mockUpsertSession.mockClear();
        mockInsertEvent.mockClear();
        mockUpsertUserFirstSeen.mockClear();
        mockUpsertUserDailyActivity.mockClear();
    });

    test("processClickEvent should record click and process base event", async () => {
        // Dynamic import to ensure mocks are applied
        const { processClickEvent } = await import("../../../src/processors/ClickProcessor");

        const mockEvent: ClickEventData = {
            type: "click",
            eventId: "evt_123",
            projectId: "proj_abc",
            sessionId: "sess_xyz",
            clientId: "client_1",
            userId: "user_1",
            timestamp: Date.now(),
            url: "http://example.com/page",
            referrer: "http://google.com",
            pageDimensions: { w: 1024, h: 768 },
            viewport: { w: 1024, h: 768 },
            pageX: 100,
            pageY: 200,
            xNorm: 0.1,
            yNorm: 0.25,
            selector: "button#submit",
            tagName: "BUTTON",
            screenClass: "desktop",
        };

        await processClickEvent(mockEvent, "US", "Desktop");

        // 1. Verify Heatmap Recording
        expect(mockRecordClick).toHaveBeenCalledTimes(1);
        expect(mockRecordClick).toHaveBeenCalledWith({
            projectId: "proj_abc",
            sessionId: "sess_xyz",
            url: "http://example.com/page",
            xNorm: 0.1,
            yNorm: 0.25,
            pageX: 100,
            pageY: 200,
            selector: "button#submit",
            tagName: "BUTTON",
            elementTextHash: undefined,
            screenClass: "desktop",
            layoutHash: undefined,
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
            location: "US", // Passed explicitly
            device: "Desktop", // Passed explicitly
        });

        // 3. Verify Event Insert
        expect(mockInsertEvent).toHaveBeenCalledTimes(1);
        expect(mockInsertEvent).toHaveBeenCalledWith(expect.objectContaining({
            eventId: "evt_123",
            type: "click",
        }));

        // 4. Verify Retention Tracking
        expect(mockUpsertUserFirstSeen).toHaveBeenCalled();
        expect(mockUpsertUserDailyActivity).toHaveBeenCalled();
    });
});
