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
export type SnapshotType = "initial" | "mutation" | "periodic";

/**
 * Screen classification for responsive layouts
 */
export type ScreenClass = "mobile" | "tablet" | "desktop";

/**
 * Session snapshot event for DOM capture
 * Used for heatmaps, session replay, layout detection, diagnostics
 */
export interface SessionSnapshotEvent {
  type: "session_snapshot";
  snapshotType: SnapshotType; // 'initial', 'mutation', or 'periodic'
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
  schemaVersion: string; // Format version for backend parsing (e.g., '1.0')
}
