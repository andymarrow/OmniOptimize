import { describe, test, expect, mock, beforeEach, afterEach } from "bun:test";
import {
    getPageDimensions,
    getPageContext,
    getPageTitle,
    getPageRoute
} from "../../../omni-sdk/packages/sdk/src/utils/index";

describe("SDK Context Utils", () => {

    beforeEach(() => {
        // Setup browser globals
        global.window = {
            location: { href: "https://example.com/path", pathname: "/path" },
            innerWidth: 1024,
            innerHeight: 768,
        };
        global.document = {
            title: "Test Page",
            referrer: "https://google.com",
            documentElement: {
                scrollWidth: 1200,
                scrollHeight: 5000
            }
        };
    });

    afterEach(() => {
        delete global.window;
        delete global.document;
    });

    test("getPageDimensions should return correct width and height", () => {
        const { pageDimensions, viewport } = getPageDimensions();

        expect(pageDimensions.w).toBe(1200);
        expect(pageDimensions.h).toBe(5000);
        expect(viewport.w).toBe(1024);
        expect(viewport.h).toBe(768);
    });

    test("getPageContext should return current URL and referrer", () => {
        const { url, referrer } = getPageContext();
        expect(url).toBe("https://example.com/path");
        expect(referrer).toBe("https://google.com");
    });

    test("getPageTitle should return document title", () => {
        expect(getPageTitle()).toBe("Test Page");
    });

    test("getPageRoute should return pathname", () => {
        expect(getPageRoute()).toBe("/path");
    });

    test("should handle undefined window/document gracefully", () => {
        // Temporarily clear globals
        const oldWindow = global.window;
        const oldDocument = global.document;
        delete global.window;
        delete global.document;

        expect(getPageTitle()).toBe("");
        expect(getPageRoute()).toBe("");

        const { url } = getPageContext();
        expect(url).toBe("");

        global.window = oldWindow;
        global.document = oldDocument;
    });

});
