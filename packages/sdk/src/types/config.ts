/**
 * Configuration types
 */

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
}
