import { describe, test, expect, mock, beforeEach, afterEach } from "bun:test";
import { Config } from "../../../omni-sdk/packages/sdk/src/config/Config";

describe("SDK Config Manager", () => {
    let mockStorage = {};

    beforeEach(() => {
        mockStorage = {};
        // Mock window and storage
        global.window = {
            localStorage: {
                getItem: mock((key) => mockStorage[key] || null),
                setItem: mock((key, value) => { mockStorage[key] = value; }),
            },
            sessionStorage: {
                getItem: mock((key) => mockStorage[key] || null),
                setItem: mock((key, value) => { mockStorage[key] = value; }),
            },
        };
    });

    afterEach(() => {
        delete global.window;
    });

    test("should throw error if required fields are missing", () => {
        expect(() => new Config({})).toThrow("projectId is required");
        expect(() => new Config({ projectId: "p1" })).toThrow("endpoint is required");
    });

    test("should initialize with default values", () => {
        const config = new Config({
            projectId: "test-proj",
            endpoint: "http://api.test",
            writeKey: "test-key"
        });

        expect(config.getBatchSize()).toBe(50);
        expect(config.getBatchTimeout()).toBe(10000);
        expect(config.isEnabled()).toBe(true);
        expect(config.isDebugEnabled()).toBe(false);
    });

    test("should persist and reload clientId from localStorage", () => {
        const firstConfig = new Config({
            projectId: "p1",
            endpoint: "e1",
            writeKey: "w1"
        });

        const clientId = firstConfig.getClientId();
        expect(clientId).toContain("anon-");

        // Create a second config instance - should load the same clientId
        const secondConfig = new Config({
            projectId: "p1",
            endpoint: "e1",
            writeKey: "w1"
        });

        expect(secondConfig.getClientId()).toBe(clientId);
        expect(window.localStorage.getItem).toHaveBeenCalledWith("omni_client_id");
    });

    test("should generate new replayId if not in sessionStorage", () => {
        const config = new Config({
            projectId: "p1",
            endpoint: "e1",
            writeKey: "w1"
        });

        const replayId = config.getReplayId();
        expect(replayId).toContain("replay-");
        expect(window.sessionStorage.setItem).toHaveBeenCalledWith("omni_replay_id", replayId);
    });

    test("should allow manual set of userId", () => {
        const config = new Config({
            projectId: "p1",
            endpoint: "e1",
            writeKey: "w1"
        });

        expect(config.getUserId()).toBeNull();
        config.setUserId("user-123");
        expect(config.getUserId()).toBe("user-123");
    });
});
