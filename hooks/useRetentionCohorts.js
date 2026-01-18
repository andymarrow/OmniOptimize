import { useCallback, useEffect, useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";

export const useRetentionCohorts = ({
  projectId,
  startDate,
  endDate,
  intervals,
}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getRetentionCohorts = useAction(api.analytics.getRetentionCohorts);

  const fetch = useCallback(async () => {
    // Validate that required params are defined
    if (!projectId || !startDate || !endDate) {
      setData(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await getRetentionCohorts({
        projectId,
        startDate,
        endDate,
        intervals,
      });
      setData(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch retention data",
      );
    } finally {
      setLoading(false);
    }
  }, [projectId, startDate, endDate, intervals, getRetentionCohorts]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
};
