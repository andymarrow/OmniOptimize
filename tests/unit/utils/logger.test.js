import { describe, test, expect, mock, beforeEach } from "bun:test";
import { Logger, NoOpLogger } from "../../../omni-sdk/packages/sdk/src/utils/Logger";

describe("Logger Utility", () => {
    let consoleLogMock;
    let consoleInfoMock;
    let consoleWarnMock;
    let consoleErrorMock;

    beforeEach(() => {
        // Mock console methods
        consoleLogMock = mock();
        consoleInfoMock = mock();
        consoleWarnMock = mock();
        consoleErrorMock = mock();

        global.console.log = consoleLogMock;
        global.console.info = consoleInfoMock;
        global.console.warn = consoleWarnMock;
        global.console.error = consoleErrorMock;
    });

    test("Logger should not log debug/info/warn when disabled", () => {
        const logger = new Logger(false); // Debug disabled

        logger.debug("test debug");
        logger.info("test info");
        logger.warn("test warn");

        expect(consoleLogMock).not.toHaveBeenCalled();
        expect(consoleInfoMock).not.toHaveBeenCalled();
        expect(consoleWarnMock).not.toHaveBeenCalled();
    });

    test("Logger should log errors even when disabled", () => {
        const logger = new Logger(false);
        logger.error("test error");
        expect(consoleErrorMock).toHaveBeenCalled();
    });

    test("Logger should log everything when enabled", () => {
        const logger = new Logger(true);

        logger.debug("test debug");
        logger.info("test info");
        logger.warn("test warn");
        logger.error("test error");

        expect(consoleLogMock).toHaveBeenCalled();
        expect(consoleInfoMock).toHaveBeenCalled();
        expect(consoleWarnMock).toHaveBeenCalled();
        expect(consoleErrorMock).toHaveBeenCalled();
    });

    test("Logger should include prefix in messages", () => {
        const logger = new Logger(true, "[TEST]");
        logger.debug("hello");

        expect(consoleLogMock.mock.calls[0][0]).toContain("[TEST]");
    });

    test("NoOpLogger should never log", () => {
        const logger = new NoOpLogger();

        logger.debug("test");
        logger.info("test");
        logger.warn("test");
        logger.error("test");

        expect(consoleLogMock).not.toHaveBeenCalled();
        expect(consoleInfoMock).not.toHaveBeenCalled();
        expect(consoleWarnMock).not.toHaveBeenCalled();
        expect(consoleErrorMock).not.toHaveBeenCalled();
    });
});
