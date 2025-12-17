/**
 * Session Manager
 * Handles session ID generation, persistence, and lifecycle with activity tracking
 * Single Responsibility: Session lifecycle management and inactivity detection
 */

/**
 * Session data stored in localStorage
 */
interface SessionData {
  sessionId: string;
  sessionStartedAt: number; // timestamp in ms
  lastActivityAt: number; // timestamp in ms
}

/**
 * Callback triggered when session expires due to inactivity
 */
export type SessionExpirationCallback = (newSessionId: string) => void;

export class SessionManager {
  private sessionId: string;
  private sessionData: SessionData;
  private readonly storageKey: string;
  private readonly inactivityTimeoutMs: number;
  private expirationCallback: SessionExpirationCallback | null = null;
  private activityCheckInterval: ReturnType<typeof setInterval> | null = null;

  constructor(
    storageKey: string = "omni_session_id",
    inactivityTimeoutMs: number = 1800000 // 30 minutes default
  ) {
    this.storageKey = storageKey;
    this.inactivityTimeoutMs = inactivityTimeoutMs;
    this.sessionData = this.loadOrCreateSession();
    this.sessionId = this.sessionData.sessionId;
  }

  /**
   * Load existing session data from localStorage or create new session
   * Returns session data with optional rotation if expired
   */
  private loadOrCreateSession(): SessionData {
    try {
      const stored =
        typeof window !== "undefined" && window.localStorage
          ? window.localStorage.getItem(this.storageKey)
          : null;

      if (stored) {
        const data = JSON.parse(stored) as SessionData;
        // Check if session has expired due to inactivity
        const now = Date.now();
        const timeSinceLastActivity = now - data.lastActivityAt;

        if (timeSinceLastActivity > this.inactivityTimeoutMs) {
          // Session expired, create new one
          return this.createNewSessionData();
        }

        // Session still valid, update last activity
        data.lastActivityAt = now;
        this.persistSessionData(data);
        return data;
      }

      // No session exists, create new
      return this.createNewSessionData();
    } catch (e) {
      // If parsing fails, create new session
      return this.createNewSessionData();
    }
  }

  /**
   * Create fresh session data
   */
  private createNewSessionData(): SessionData {
    const now = Date.now();
    const data: SessionData = {
      sessionId: this.generateSessionId(),
      sessionStartedAt: now,
      lastActivityAt: now,
    };
    this.persistSessionData(data);
    return data;
  }

  /**
   * Persist session data to localStorage
   */
  private persistSessionData(data: SessionData): void {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(this.storageKey, JSON.stringify(data));
      }
    } catch (e) {
      // Silently fail if localStorage unavailable
    }
  }

  /**
   * Generate a new unique session ID
   * Format: session-{timestamp}-{random}
   */
  private generateSessionId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `session-${timestamp}-${random}`;
  }

  /**
   * Get current session ID
   */
  getSessionId(): string {
    return this.sessionId;
  }

  /**
   * Update activity timestamp to keep session alive
   * Should be called on user interactions (clicks, key events, etc.)
   */
  updateActivity(): void {
    const now = Date.now();
    this.sessionData.lastActivityAt = now;
    this.persistSessionData(this.sessionData);
  }

  /**
   * Check if current session has expired due to inactivity
   * If expired, rotates session and triggers callback
   * Returns true if session was rotated, false if still valid
   */
  checkSessionExpired(): boolean {
    const now = Date.now();
    const timeSinceLastActivity = now - this.sessionData.lastActivityAt;

    if (timeSinceLastActivity > this.inactivityTimeoutMs) {
      // Session expired, create new one
      const oldSessionId = this.sessionId;
      this.sessionData = this.createNewSessionData();
      this.sessionId = this.sessionData.sessionId;

      // Trigger expiration callback if set
      if (this.expirationCallback) {
        this.expirationCallback(this.sessionId);
      }

      return true;
    }

    return false;
  }

  /**
   * Set callback to be triggered when session expires
   * Used by plugins to restart recording, etc.
   */
  setExpirationCallback(callback: SessionExpirationCallback): void {
    this.expirationCallback = callback;
  }

  /**
   * Start monitoring for session expiration
   * Checks periodically if session needs to be rotated
   * @param checkIntervalMs How often to check (default: 60000 = 1 minute)
   */
  startExpirationMonitoring(checkIntervalMs: number = 60000): void {
    if (this.activityCheckInterval) {
      clearInterval(this.activityCheckInterval);
    }

    this.activityCheckInterval = setInterval(() => {
      this.checkSessionExpired();
    }, checkIntervalMs);
  }

  /**
   * Stop monitoring for session expiration
   */
  stopExpirationMonitoring(): void {
    if (this.activityCheckInterval) {
      clearInterval(this.activityCheckInterval);
      this.activityCheckInterval = null;
    }
  }

  /**
   * Start a new session (e.g., after logout or manual rotation)
   */
  startNewSession(): string {
    this.sessionData = this.createNewSessionData();
    this.sessionId = this.sessionData.sessionId;
    return this.sessionId;
  }

  /**
   * Clear session (e.g., on logout)
   */
  clearSession(): void {
    this.stopExpirationMonitoring();
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.removeItem(this.storageKey);
      }
    } catch (e) {
      // Silently fail if localStorage unavailable
    }
  }

  /**
   * Get session metadata
   */
  getSessionMetadata(): {
    sessionId: string;
    sessionStartedAt: number;
    lastActivityAt: number;
    age: number;
    inactivityDuration: number;
  } {
    const now = Date.now();
    return {
      sessionId: this.sessionId,
      sessionStartedAt: this.sessionData.sessionStartedAt,
      lastActivityAt: this.sessionData.lastActivityAt,
      age: now - this.sessionData.sessionStartedAt,
      inactivityDuration: now - this.sessionData.lastActivityAt,
    };
  }
}
