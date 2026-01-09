import { describe, test, expect } from "bun:test";
import { generateUUID } from "../../../omni-sdk/packages/sdk/src/utils/index";

describe("common SDK Utilities", () => {

    test("generateUUID should return a string of valid UUID length", () => {
        const uuid = generateUUID();
        expect(typeof uuid).toBe("string");
        // Standard UUID is 36 chars
        expect(uuid.length).toBe(36);
    });

    test("generateUUID should produce unique IDs", () => {
        const uuids = new Set();
        for (let i = 0; i < 100; i++) {
            uuids.add(generateUUID());
        }
        expect(uuids.size).toBe(100);
    });

    test("generateUUID should match basic UUID regex pattern", () => {
        const uuid = generateUUID();
        const pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        expect(uuid).toMatch(pattern);
    });

});
