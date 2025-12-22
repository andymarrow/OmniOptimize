import { create } from "zustand";
import { Session } from "@/types";

interface SessionStore {
  selectedSessionId: string;
  selectedReplayId: string;
  sessionData: Session | null;

  setSelectedSessionId: (sessionId: string) => void;
  setSelectedReplayId: (replayId: string) => void;
  setSessionData: (data: Session) => void;
  clear: () => void;
}

export const useSessionStore = create<SessionStore>((set) => ({
  selectedSessionId: "",
  selectedReplayId: "",
  sessionData: null,

  setSelectedSessionId: (sessionId) =>
    set({ selectedSessionId: sessionId, selectedReplayId: "" }),
  setSelectedReplayId: (replayId) => set({ selectedReplayId: replayId }),
  setSessionData: (data) => set({ sessionData: data }),
  clear: () => set({ sessionData: null }),
}));
