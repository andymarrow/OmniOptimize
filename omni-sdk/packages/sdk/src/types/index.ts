/**
 * Central export point for all SDK types
 * Consumers can import from '@omni-analytics/sdk' without accessing internal modules
 */

// Common types
export * from "./common";
export type { ITransmitter, TransmitterConfig } from "./transmitter";
export type { IPlugin, PluginContext, Logger, PluginMetadata } from "./plugin";
export type { SDKConfig, SnapshotConfig, PrivacyConfig } from "./config";

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
  RrwebEvent,
  SnapshotType,
  ScreenClass,
  MaskMetadata,
  HeatmapClick,
} from "./events/snapshot";
