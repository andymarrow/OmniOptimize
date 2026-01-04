import { describe, test, expect } from "bun:test";
import { getScreenClass } from "../../../omni-sdk/packages/sdk/src/utils/domSerializer";

describe("domSerializer Utility (Logic)", () => {

    describe("getScreenClass", () => {
        test("should return 'mobile' for widths less than 768", () => {
            expect(getScreenClass(375)).toBe("mobile");
            expect(getScreenClass(767)).toBe("mobile");
        });

        test("should return 'tablet' for widths between 768 and 1023", () => {
            expect(getScreenClass(768)).toBe("tablet");
            expect(getScreenClass(1023)).toBe("tablet");
        });

        test("should return 'desktop' for widths 1024 and above", () => {
            expect(getScreenClass(1024)).toBe("desktop");
            expect(getScreenClass(1920)).toBe("desktop");
        });
    });

});
