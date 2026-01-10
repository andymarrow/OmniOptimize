import { describe, test, expect, mock, beforeEach, afterEach } from "bun:test";
import { SessionManager } from "../../../omni-sdk/packages/sdk/src/session/SessionManager";

describe("SessionManager", () => {
    let mockStorage = {};
    let now = 1000000;

    beforeEach(() => {
        mockStorage = {};
        now = 1000000;

        // Mock global window and localStorage
        global.window = {
            localStorage: {
                getItem: mock((key) => mockStorage[key] || null),
                setItem: mock((key, value) => { mockStorage[key] = value; }),
                removeItem: mock((key) => { delete mockStorage[key]; }),
            }
        };

        // Mock Date.now()
        global.Date.now = mock(() => now);
    });

    afterEach(() => {
        delete global.window;
        // Restore Date.now? Bun's mock might handled it, but let's be safe
        // Actually Bun mocks globals fine.
    });

    test("should create new session on first start", () => {
        const manager = new SessionManager("omni_test_id");
        expect(manager.getSessionId()).toContain("session-");
        expect(window.localStorage.setItem).toHaveBeenCalled();
    });

    test("should load existing session from storage if valid", () => {
        const existingId = "session-123-abc";
        mockStorage["omni_test_id"] = JSON.stringify({
            sessionId: existingId,
            sessionStartedAt: now - 1000,
            lastActivityAt: now - 500
        });

        const manager = new SessionManager("omni_test_id");
        expect(manager.getSessionId()).toBe(existingId);
    });

    test("should rotate session if expired due to inactivity during load", () => {
        const existingId = "session-old";
        const timeout = 1000;
        mockStorage["omni_test_id"] = JSON.stringify({
            sessionId: existingId,
            sessionStartedAt: now - 5000,
            lastActivityAt: now - 2000 // Last activity was 2s ago, timeout 1s
        });

        const manager = new SessionManager("omni_test_id", timeout);
        expect(manager.getSessionId()).not.toBe(existingId);
        expect(manager.getSessionId()).toContain("session-");
    });

    test("updateActivity should refresh lastActivityAt", () => {
        const manager = new SessionManager("omni_test_id");
        const initialActivity = manager.getSessionMetadata().lastActivityAt;

        // Advance time
        now += 1000;
        manager.updateActivity();

        expect(manager.getSessionMetadata().lastActivityAt).toBe(initialActivity + 1000);
    });

    test("checkSessionExpired should rotate and trigger callback", () => {
        const timeout = 1000;
        const manager = new SessionManager("omni_test_id", timeout);
        const oldId = manager.getSessionId();

        const callback = mock();
        manager.setExpirationCallback(callback);

        // Advance time past timeout
        now += 2000;

        const expired = manager.checkSessionExpired();
        expect(expired).toBe(true);
        expect(manager.getSessionId()).not.toBe(oldId);
        expect(callback).toHaveBeenCalledWith(manager.getSessionId());
    });
});
