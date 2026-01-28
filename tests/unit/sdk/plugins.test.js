import { describe, test, expect, mock, beforeEach } from "bun:test";
import { PluginRegistry } from "../../../omni-sdk/packages/sdk/src/plugins/PluginRegistry";

describe("PluginRegistry", () => {
    let registry;
    let mockContext;

    beforeEach(() => {
        registry = new PluginRegistry();
        mockContext = { config: {}, tracker: {} };
    });

    test("should register plugins and report status", () => {
        const plugin = {
            name: "test-plugin",
            version: "1.0.0",
            init: mock(() => Promise.resolve()),
        };

        registry.register(plugin);
        const status = registry.getStatus();

        expect(status.total).toBe(1);
        expect(status.initializedCount).toBe(0);
        expect(registry.get("test-plugin")).toBe(plugin);
    });

    test("should throw error on duplicate registration", () => {
        const plugin = { name: "test", version: "1", init: () => { } };
        registry.register(plugin);

        expect(() => registry.register(plugin)).toThrow("Plugin \"test\" already registered");
    });

    test("should initialize all plugins and update metadata", async () => {
        const init1 = mock(() => Promise.resolve());
        const init2 = mock(() => Promise.resolve());

        registry.register({ name: "p1", version: "1", init: init1 });
        registry.register({ name: "p2", version: "1", init: init2 });

        await registry.initialize(mockContext);

        expect(init1).toHaveBeenCalledWith(mockContext);
        expect(init2).toHaveBeenCalledWith(mockContext);
        expect(registry.isInitialized("p1")).toBe(true);
        expect(registry.isInitialized("p2")).toBe(true);
        expect(registry.getStatus().initializedCount).toBe(2);
    });

    test("should prevent registration after initialization", async () => {
        await registry.initialize(mockContext);

        expect(() => registry.register({ name: "late", version: "1", init: () => { } }))
            .toThrow("Cannot register plugins after initialization");
    });

    test("should call pause/resume on all plugins", async () => {
        const pauseMock = mock(() => Promise.resolve());
        const resumeMock = mock(() => Promise.resolve());

        registry.register({
            name: "p1",
            version: "1",
            init: () => Promise.resolve(),
            pause: pauseMock,
            resume: resumeMock
        });

        await registry.pauseAll();
        expect(pauseMock).toHaveBeenCalledTimes(1);

        await registry.resumeAll();
        expect(resumeMock).toHaveBeenCalledTimes(1);
    });

    test("should call destroy on all plugins and clear registry", async () => {
        const destroyMock = mock(() => Promise.resolve());

        registry.register({
            name: "p1",
            version: "1",
            init: () => Promise.resolve(),
            destroy: destroyMock
        });

        await registry.destroy();
        expect(destroyMock).toHaveBeenCalledTimes(1);
        expect(registry.getStatus().total).toBe(0);
    });
});
