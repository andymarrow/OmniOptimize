/**
 * Configuration types
 */

/**
 * Session configuration for inactivity tracking and lifecycle
 */
export interface SessionConfig {
  /**
   * Inactivity timeout in milliseconds (default: 1800000 = 30 minutes)
   * When inactivity exceeds this duration, session rotates
   */
  inactivityTimeoutMs?: number;
}

/**
 * Replay/rrweb configuration for session recording
 */
export interface ReplayConfig {
  /**
   * Enable/disable rrweb recording (default: false - must be explicitly enabled)
   */
  enabled?: boolean;

  /**
   * Sample rate for rrweb events (0-1, default: 1.0 = capture all)
   */
  sampleRate?: number;

  /**
   * CSS selectors to completely block/exclude from rrweb recording
   */
  blockSelectors?: string[];

  /**
   * CSS selectors to mask content in rrweb recording
   */
  maskSelectors?: string[];

  /**
   * Whether to mask all input values (default: true)
   */
  maskInputOptions?: Record<string, boolean>;

  /**
   * Enable debug logging for rrweb manager
   */
  debug?: boolean;
}

/**
 * Privacy and sanitization settings for snapshots
 */
export interface PrivacyConfig {
  /**
   * CSS selectors to completely block/remove from snapshots
   */
  blockSelectors?: string[];

  /**
   * CSS selectors to mask/hide content in snapshots
   */
  maskSelectors?: string[];

  /**
   * Disable snapshot capturing entirely
   */
  disableSnapshots?: boolean;

  /**
   * Max text length per node in serialized DOM (default: 200)
   */
  maxNodeTextLength?: number;
}

/**
 * Snapshot capture configuration
 */
export interface SnapshotConfig {
  /**
   * Enable/disable snapshot collection (default: true)
   */
  enabled?: boolean;

  /**
   * Capture initial snapshot on pageview (default: true)
   */
  captureInitial?: boolean;

  /**
   * Enable mutation-triggered snapshots (default: false)
   */
  captureMutations?: boolean;

  /**
   * Min time between mutation snapshots in ms (default: 30000)
   */
  mutationThrottleMs?: number;

  /**
   * Enable periodic snapshots (default: false)
   */
  capturePeriodic?: boolean;

  /**
   * Interval for periodic snapshots in ms (default: 300000 = 5 min)
   */
  periodicIntervalMs?: number;

  /**
   * Max snapshot size in bytes before truncation (default: 512000)
   */
  maxSnapshotSizeBytes?: number;
}

/**
 * SDK configuration passed during initialization
 */
export interface SDKConfig {
  /**
   * Project/Site ID for analytics
   */
  projectId: string;

  /**
   * Server endpoint for event transmission
   */
  endpoint: string;

  /**
   * Optional: Client ID (defaults to anonymous ID)
   */
  clientId?: string;

  /**
   * Optional: User ID (can be set after auth)
   */
  userId?: string | null;

  /**
   * Optional: Batch size before auto-flush (default: 50)
   */
  batchSize?: number;

  /**
   * Optional: Batch timeout in ms before auto-flush (default: 10000)
   */
  batchTimeout?: number;

  /**
   * Optional: Enable debug logging (default: false)
   */
  debug?: boolean;

  /**
   * Optional: Custom session storage key
   */
  sessionStorageKey?: string;

  /**
   * Optional: Enable automatic error reporting
   */
  captureErrors?: boolean;

  /**
   * Optional: Session configuration for inactivity timeout and lifecycle
   */
  session?: SessionConfig;

  /**
   * Optional: Replay/rrweb configuration for session recording
   */
  replay?: ReplayConfig;

  /**
   * Optional: Snapshot configuration for DOM capture, heatmaps, and session replay
   */
  snapshot?: SnapshotConfig;

  /**
   * Optional: Privacy configuration for snapshot masking and data handling
   */
  privacy?: PrivacyConfig;
}
