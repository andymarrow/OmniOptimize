/**
 * Session Snapshot event types
 * Used for DOM snapshots, heatmaps, session replay, and layout tracking
 */

/**
 * Metadata about masked/sanitized content during serialization
 */
export interface MaskMetadata {
  maskedSelectors: string[]; // Selectors that were masked
  truncated: boolean; // Whether DOM was truncated due to size limits
  domSize: number; // Raw DOM size in bytes (before compression)
  compressionType?: "gzip" | "deflate" | "none"; // Compression method applied
  blockedCount?: number; // Number of elements blocked/removed
}

/**
 * Snapshot type indicator
 */
export type SnapshotType = "initial" | "mutation" | "periodic" | "rrweb";

/**
 * Screen classification for responsive layouts
 */
export type ScreenClass = "mobile" | "tablet" | "desktop";

/**
 * Click data for heatmaps - normalized coordinates with element info
 */
export interface HeatmapClick {
  xNorm: number; // Normalized X (0-1): (pageX + scrollX) / pageWidth
  yNorm: number; // Normalized Y (0-1): (pageY + scrollY) / pageHeight
  elementSelector?: string; // CSS selector for the clicked element
  timestamp: number; // When the click occurred
}

/**
 * Session snapshot event for DOM capture
 * Used for heatmaps, session replay, layout detection, diagnostics
 */
export interface SessionSnapshotEvent {
  type: "session_snapshot";
  snapshotType: SnapshotType; // 'initial', 'mutation', 'periodic', or 'rrweb'
  timestamp: number; // milliseconds since epoch
  sessionId: string;
  userId?: string | null;
  clientId: string;
  url: string;
  screenClass: ScreenClass; // Device class based on viewport width
  layoutHash: string; // Deterministic hash of DOM structure (e.g., 'sha256:abc...')
  dom: string; // Serialized DOM (scripts removed, content sanitized/truncated)
  domCompression: "gzip" | "deflate" | "none"; // Compression method applied
  domSize: {
    original: number; // Original DOM size in bytes
    compressed: number; // Compressed DOM size in bytes
    truncated: boolean; // Whether DOM was truncated due to size limits
  };
  maskMetadata: MaskMetadata; // Metadata about what was masked/sanitized
  viewport: {
    width: number;
    height: number;
  };
  pageDimensions: {
    w: number;
    h: number;
  };
  referrer?: string;
  // Heatmap data
  clicks?: HeatmapClick[]; // Array of normalized click coordinates captured in this snapshot
  scrollX?: number; // Horizontal scroll position
  scrollY?: number; // Vertical scroll position
  schemaVersion: string; // Format version for backend parsing (e.g., '1.0')
}

/**
 * RrWeb event captured from rrweb library
 * Used for session replay with full interaction capture
 */
export interface RrwebEvent {
  type: "rrweb";
  timestamp: number; // Event timestamp
  sessionId: string; // Logical session (shared across tabs)
  replayId: string; // Tab-scoped replay ID (unique per tab)
  clientId: string;
  userId?: string | null;
  url: string;
  referrer?: string;
  // Raw rrweb event data (can be Initial, Full Snapshot, or Incremental Snapshot)
  rrwebPayload: {
    type: number; // rrweb event type
    data: Record<string, any>; // rrweb event data
    timestamp?: number; // rrweb internal timestamp
  };
  schemaVersion: string; // Format version (e.g., '1.0')
}
