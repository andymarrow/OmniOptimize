/**
 * Plugin system types and interfaces
 */

/**
 * Context passed to plugins during initialization
 */
export interface PluginContext {
  tracker: any; // Tracker type (avoiding circular dependency)
  config: any; // Config type (avoiding circular dependency)
  logger?: Logger;
}

/**
 * Logger interface for plugins
 */
export interface Logger {
  debug(message: string, data?: any): void;
  info(message: string, data?: any): void;
  warn(message: string, data?: any): void;
  error(message: string, error?: any): void;
}

/**
 * Plugin interface that all plugins must implement
 */
export interface IPlugin {
  /**
   * Unique name of the plugin
   */
  name: string;

  /**
   * Semantic version of the plugin
   */
  version: string;

  /**
   * Called when the plugin is being initialized
   * @param context Plugin context with tracker, config, logger
   */
  init(context: PluginContext): Promise<void>;

  /**
   * Called when the plugin is being destroyed (e.g., page unload)
   */
  destroy?(): Promise<void>;
}

/**
 * Metadata about a registered plugin
 */
export interface PluginMetadata {
  plugin: IPlugin;
  initialized: boolean;
  initTime?: number;
  error?: Error;
}
