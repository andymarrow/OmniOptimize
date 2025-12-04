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
  private readonly captureErrors: boolean;
  private clientId: string;
  private userId: string | null;

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
    this.captureErrors = config.captureErrors ?? false;
    this.clientId = config.clientId ?? this.generateAnonymousId();
    this.userId = config.userId ?? null;

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
   * Generate anonymous client ID if not provided
   */
  private generateAnonymousId(): string {
    return `anon-${generateUUID()}`;
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
}
