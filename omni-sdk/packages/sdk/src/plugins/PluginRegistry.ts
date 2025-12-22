/**
 * Plugin Registry
 * Manages plugin registration, initialization, and lifecycle
 * Single Responsibility: Plugin management
 */

import type { IPlugin, PluginContext, PluginMetadata } from "../types";

export class PluginRegistry {
  private plugins: Map<string, PluginMetadata> = new Map();
  private initialized = false;

  /**
   * Register a plugin
   */
  register(plugin: IPlugin): void {
    if (this.initialized) {
      throw new Error("Cannot register plugins after initialization");
    }

    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin "${plugin.name}" already registered`);
    }

    this.plugins.set(plugin.name, {
      plugin,
      initialized: false,
    });
  }

  /**
   * Initialize all registered plugins
   */
  async initialize(context: PluginContext): Promise<void> {
    if (this.initialized) {
      return;
    }

    const initPromises: Promise<void>[] = [];

    for (const [name, metadata] of this.plugins) {
      try {
        const startTime = Date.now();
        const promise = metadata.plugin.init(context).then(() => {
          metadata.initialized = true;
          metadata.initTime = Date.now() - startTime;
        });
        initPromises.push(promise);
      } catch (error) {
        metadata.error =
          error instanceof Error ? error : new Error(String(error));
        console.error(
          `[PluginRegistry] Failed to initialize plugin "${name}":`,
          metadata.error
        );
      }
    }

    await Promise.all(initPromises);
    this.initialized = true;
  }

  /**
   * Get a registered plugin
   */
  get(name: string): IPlugin | undefined {
    return this.plugins.get(name)?.plugin;
  }

  /**
   * Get all plugins
   */
  getAll(): IPlugin[] {
    return Array.from(this.plugins.values()).map((m) => m.plugin);
  }

  /**
   * Get plugin metadata
   */
  getMetadata(name: string): PluginMetadata | undefined {
    return this.plugins.get(name);
  }

  /**
   * Check if plugin is initialized
   */
  isInitialized(name: string): boolean {
    return this.plugins.get(name)?.initialized ?? false;
  }

  /**
   * Destroy all plugins
   */
  async destroy(): Promise<void> {
    const destroyPromises: Promise<void>[] = [];

    for (const metadata of this.plugins.values()) {
      if (metadata.plugin.destroy) {
        try {
          destroyPromises.push(metadata.plugin.destroy());
        } catch (error) {
          console.error(
            `[PluginRegistry] Error destroying plugin "${metadata.plugin.name}":`,
            error
          );
        }
      }
    }

    await Promise.all(destroyPromises);
    this.plugins.clear();
    this.initialized = false;
  }

  /**
   * Get initialization status
   */
  getStatus() {
    return {
      total: this.plugins.size,
      initializedCount: Array.from(this.plugins.values()).filter(
        (m) => m.initialized
      ).length,
      failedCount: Array.from(this.plugins.values()).filter((m) => m.error)
        .length,
    };
  }
}
