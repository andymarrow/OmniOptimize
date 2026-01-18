"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { CohortFilters } from "./CohortFilters";
import { CohortTable } from "./CohortTable";
import { CohortSkeleton } from "@/components/skeleton/cohortSkeleton";
import { useRetentionCohorts } from "@/hooks/useRetentionCohorts";

export const RetentionTab = ({ projectId }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [intervals, setIntervals] = useState("0,1,2,3,7,14,30");
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize from URL or set defaults
  useEffect(() => {
    const urlStart = searchParams?.get("startDate");
    const urlEnd = searchParams?.get("endDate");
    const urlIntervals = searchParams?.get("intervals");

    if (urlStart && urlEnd) {
      setStartDate(urlStart);
      setEndDate(urlEnd);
      if (urlIntervals) setIntervals(urlIntervals);
    } else {
      // Set default to last 30 days
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const newStart = thirtyDaysAgo.toISOString().split("T")[0];
      const newEnd = now.toISOString().split("T")[0];

      setStartDate(newStart);
      setEndDate(newEnd);
    }

    setIsInitialized(true);
  }, [searchParams]);

  // Fetch retention data
  const { data, loading, error } = useRetentionCohorts({
    projectId,
    startDate,
    endDate,
    intervals,
  });

  // Update URL when filters change
  const handleFiltersChange = (newStart, newEnd, newIntervals) => {
    setStartDate(newStart);
    setEndDate(newEnd);
    setIntervals(newIntervals);

    // Update URL params
    const params = new URLSearchParams();
    params.set("startDate", newStart);
    params.set("endDate", newEnd);
    params.set("intervals", newIntervals);

    router.replace(`?${params.toString()}`);
  };

  if (!isInitialized) {
    return <CohortSkeleton />;
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <CohortFilters
        startDate={startDate}
        endDate={endDate}
        intervals={intervals}
        onFiltersChange={handleFiltersChange}
      />

      {/* Loading State */}
      {loading && <CohortSkeleton />}

      {/* Error State */}
      {error && !loading && (
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Data Display */}
      {!loading && !error && data && (
        <CohortTable
          cohorts={data.cohorts}
          intervals={intervals.split(",").map((i) => i.trim())}
        />
      )}
    </div>
  );
};
