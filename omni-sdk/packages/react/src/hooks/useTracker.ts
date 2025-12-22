/**
 * useTracker Hook
 * Provides access to the Tracker instance in React components
 */

import { useContext } from "react";
import { TrackerContext } from "../context/TrackerContext";

export function useTracker() {
  const context = useContext(TrackerContext);
  if (!context) {
    throw new Error("useTracker must be used within TrackerProvider");
  }
  return context.tracker;
}
