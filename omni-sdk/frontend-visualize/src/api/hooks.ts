import { useQuery } from "@tanstack/react-query";
import { apiClient } from "./client";
import { HeatmapResponse, SessionResponse } from "@/types";

// Heatmap API
export const useHeatmap = (projectId: string, url: string) => {
  return useQuery({
    queryKey: ["heatmap", projectId, url],
    queryFn: async () => {
      const encodedUrl = encodeURIComponent(url);
      const response = await apiClient.get<HeatmapResponse>(
        `/heatmaps/${projectId}/${encodedUrl}`
      );
      return response.data;
    },
    enabled: !!projectId && !!url,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Session API
export const useSession = (sessionId: string) => {
  return useQuery({
    queryKey: ["session", sessionId],
    queryFn: async () => {
      const response = await apiClient.get<SessionResponse>(
        `/sessions/${sessionId}`
      );
      return response.data;
    },
    enabled: !!sessionId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
