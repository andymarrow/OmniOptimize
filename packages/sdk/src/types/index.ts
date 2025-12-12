/**
 * Central export point for all SDK types
 * Consumers can import from '@omni-analytics/sdk' without accessing internal modules
 */

// Common types
export * from "./common";
export type { ITransmitter, TransmitterConfig } from "./transmitter";
export type { IPlugin, PluginContext, Logger, PluginMetadata } from "./plugin";
export type { SDKConfig } from "./config";

// Event types
export type { PageViewEvent, PageViewPayload } from "./events/pageView";
export type {
  ClickEvent,
  ClickPayload,
  ElementMetadata,
  InputEvent,
  RouteEvent,
  CustomEvent,
} from "./events/click";
export type {
  SessionSnapshotEvent,
  SnapshotType,
  ScreenClass,
  MaskMetadata,
} from "./events/snapshot";
