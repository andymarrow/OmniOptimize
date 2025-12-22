import type { SDKConfig } from "../types/config";
import { generateUUID } from "../utils";

/**
 * Config Manager
 * Handles all SDK configuration and validation
 * Single Responsibility: Configuration management
 */
export class Config {
  private readonly projectId: string;
  private readonly endpoint: string;
  private readonly batchSize: number;
  private readonly batchTimeout: number;
  private readonly debug: boolean;
  private readonly sessionStorageKey: string;
  private readonly clientIdStorageKey: string;
  private readonly replayIdStorageKey: string;
  private readonly captureErrors: boolean;
  private clientId: string;
  private userId: string | null;
  private replayId: string;
  private replayConfig: any;
  private sessionConfig: any;
  private inactivityTimeoutMs: number;

  constructor(config: SDKConfig) {
    // Validate required fields
    if (!config.projectId) {
      throw new Error("projectId is required");
    }
    if (!config.endpoint) {
      throw new Error("endpoint is required");
    }

    this.projectId = config.projectId;
    this.endpoint = config.endpoint;
    this.batchSize = config.batchSize ?? 50;
    this.batchTimeout = config.batchTimeout ?? 10000;
    this.debug = config.debug ?? false;
    this.sessionStorageKey = config.sessionStorageKey ?? "omni_session_id";
    this.clientIdStorageKey = "omni_client_id"; // Browser-wide persistence key
    this.replayIdStorageKey = "omni_replay_id"; // Tab-scoped (sessionStorage)
    this.captureErrors = config.captureErrors ?? false;
    this.clientId = config.clientId ?? this.loadOrCreateClientId();
    this.userId = config.userId ?? null;
    this.replayId = this.loadOrCreateReplayId();
    this.replayConfig = config.replay ?? {};
    this.sessionConfig = config.session ?? {};
    this.inactivityTimeoutMs = config.session?.inactivityTimeoutMs ?? 1800000;

    if (this.debug) {
      console.log("[OmniSDK] Config initialized:", {
        projectId: this.projectId,
        endpoint: this.endpoint,
        batchSize: this.batchSize,
        batchTimeout: this.batchTimeout,
      });
    }
  }

  /**
   * Load existing client ID from localStorage or create a new one
   * clientId persists for months across all tabs/windows in the same browser
   */
  private loadOrCreateClientId(): string {
    try {
      // Try to load from localStorage (browser-wide, persistent)
      const stored =
        typeof window !== "undefined" && window.localStorage
          ? window.localStorage.getItem(this.clientIdStorageKey)
          : null;

      if (stored) {
        return stored;
      }

      // Create new client ID
      const newClientId = this.generateAnonymousId();

      // Store in localStorage if available
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(this.clientIdStorageKey, newClientId);
      }

      return newClientId;
    } catch (e) {
      // If localStorage fails, just generate and use a new ID
      return this.generateAnonymousId();
    }
  }

  /**
   * Load existing replay ID from sessionStorage or create a new one
   * replayId is tab-scoped and regenerates when tab is closed/reopened
   */
  private loadOrCreateReplayId(): string {
    try {
      // Try to load from sessionStorage (tab-scoped, temporary)
      const stored =
        typeof window !== "undefined" && window.sessionStorage
          ? window.sessionStorage.getItem(this.replayIdStorageKey)
          : null;

      if (stored) {
        return stored;
      }

      // Create new replay ID (unique per tab)
      const newReplayId = this.generateReplayId();

      // Store in sessionStorage if available
      if (typeof window !== "undefined" && window.sessionStorage) {
        window.sessionStorage.setItem(this.replayIdStorageKey, newReplayId);
      }

      return newReplayId;
    } catch (e) {
      // If sessionStorage fails, just generate a new ID
      return this.generateReplayId();
    }
  }

  /**
   * Generate anonymous client ID if not provided
   */
  private generateAnonymousId(): string {
    return `anon-${generateUUID()}`;
  }

  /**
   * Generate unique replay ID for this tab
   */
  private generateReplayId(): string {
    return `replay-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 15)}`;
  }

  // Getters
  getProjectId(): string {
    return this.projectId;
  }

  getEndpoint(): string {
    return this.endpoint;
  }

  getBatchSize(): number {
    return this.batchSize;
  }

  getBatchTimeout(): number {
    return this.batchTimeout;
  }

  isDebugEnabled(): boolean {
    return this.debug;
  }

  getSessionStorageKey(): string {
    return this.sessionStorageKey;
  }

  shouldCaptureErrors(): boolean {
    return this.captureErrors;
  }

  getClientId(): string {
    return this.clientId;
  }

  setClientId(clientId: string): void {
    this.clientId = clientId;
  }

  getUserId(): string | null {
    return this.userId;
  }

  setUserId(userId: string | null): void {
    this.userId = userId;
  }

  /**
   * Get replay ID (tab-scoped, unique per tab)
   */
  getReplayId(): string {
    return this.replayId;
  }

  /**
   * Get session configuration
   */
  getSessionConfig(): any {
    // Will be populated from SDKConfig.session in future
    return {};
  }

  /**
   * Get replay configuration
   */
  getReplayConfig(): any {
    return this.replayConfig;
  }

  /**
   * Get inactivity timeout in milliseconds
   * Default: 30 minutes (1800000 ms)
   */
  getInactivityTimeoutMs(): number {
    return this.inactivityTimeoutMs;
  }
}
