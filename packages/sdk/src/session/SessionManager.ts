/**
 * Session Manager
 * Handles session ID generation and persistence
 * Single Responsibility: Session lifecycle management
 */
export class SessionManager {
  private sessionId: string;
  private readonly storageKey: string;

  constructor(storageKey: string = "omni_session_id") {
    this.storageKey = storageKey;
    this.sessionId = this.loadOrCreateSession();
  }

  /**
   * Load existing session ID from localStorage or create a new one
   */
  private loadOrCreateSession(): string {
    try {
      // Try to load from localStorage
      const stored =
        typeof window !== "undefined" && window.localStorage
          ? window.localStorage.getItem(this.storageKey)
          : null;

      if (stored) {
        return stored;
      }

      // Create new session ID
      const newSessionId = this.generateSessionId();

      // Store in localStorage if available
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(this.storageKey, newSessionId);
      }

      return newSessionId;
    } catch (e) {
      // If localStorage fails, just generate and use a new ID
      return this.generateSessionId();
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
   * Start a new session (e.g., after logout)
   */
  startNewSession(): string {
    this.sessionId = this.generateSessionId();
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(this.storageKey, this.sessionId);
      }
    } catch (e) {
      // Silently fail if localStorage unavailable
    }
    return this.sessionId;
  }

  /**
   * Clear session (e.g., on logout)
   */
  clearSession(): void {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.removeItem(this.storageKey);
      }
    } catch (e) {
      // Silently fail if localStorage unavailable
    }
  }
}
