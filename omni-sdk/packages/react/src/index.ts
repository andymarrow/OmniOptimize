/**
 * React integration for Omni Analytics SDK
 * Provides hooks and context for React applications
 */

// Re-export SDK
export * from "@omni-analytics/sdk";

// Import React integration (needed for tree-shaking to not eliminate them)
import {
  TrackerContext,
  TrackerProvider,
  useTrackerContext,
} from "./context/TrackerContext";
import { useTracker } from "./hooks/useTracker";

// Export React integration
export { TrackerContext, TrackerProvider, useTrackerContext, useTracker };
