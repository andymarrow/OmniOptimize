/**
 * TrackerContext
 * React Context for providing Tracker instance to components
 */

import React, { createContext, ReactNode } from "react";
import type { Tracker } from "@omni-analytics/sdk";

interface TrackerContextType {
  tracker: Tracker;
}

export const TrackerContext = createContext<TrackerContextType | null>(null);

export interface TrackerProviderProps {
  tracker: Tracker;
  children: ReactNode;
}

export function TrackerProvider({ tracker, children }: TrackerProviderProps) {
  return (
    <TrackerContext.Provider value={{ tracker }}>
      {children}
    </TrackerContext.Provider>
  );
}

export function useTrackerContext() {
  const context = React.useContext(TrackerContext);
  if (!context) {
    throw new Error("useTrackerContext must be used within TrackerProvider");
  }
  return context;
}
