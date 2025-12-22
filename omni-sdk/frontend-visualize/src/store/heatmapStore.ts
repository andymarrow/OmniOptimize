import { create } from "zustand";
import { HeatmapData } from "@/types";

interface HeatmapStore {
  selectedProjectId: string;
  selectedUrl: string;
  heatmapData: HeatmapData | null;

  setSelectedProjectId: (projectId: string) => void;
  setSelectedUrl: (url: string) => void;
  setHeatmapData: (data: HeatmapData) => void;
  clear: () => void;
}

export const useHeatmapStore = create<HeatmapStore>((set) => ({
  selectedProjectId: "local-example-app",
  selectedUrl: "",
  heatmapData: null,

  setSelectedProjectId: (projectId) => set({ selectedProjectId: projectId }),
  setSelectedUrl: (url) => set({ selectedUrl: url }),
  setHeatmapData: (data) => set({ heatmapData: data }),
  clear: () => set({ heatmapData: null }),
}));
