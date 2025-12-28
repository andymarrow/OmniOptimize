// app/dashboard/analytics/page.jsx
"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

import AnalyticsHeader from "./_components/AnalyticsHeader";
import TrafficChart from "./_components/TrafficChart";
import TopPagesTable from "./_components/TopPagesTable";
import DemographicsCard from "./_components/DemographicsCard";
import HeatmapCard from "./_components/HeatmapCard";
import MetricsGrid from "./_components/MetricsGrid";

// Skeleton & Error
import { AnalyticsDashboardSkeleton } from "@/components/skeleton/dashboardSkeletons";
import ErrorState from "@/components/ErrorState";

// Project & Convex
import { useProject } from "@/app/_context/ProjectContext";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";

// Images
import confusedCatImage from "@/assets/confused-cat.png";

// Date utilities
import {
  getDefaultDateRange,
  formatDateISO,
  formatDateRangeDisplay,
  parseISO,
} from "@/utils/dateFormatter";

import { format } from "date-fns";

export default function AnalyticsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { activeProject } = useProject();

  // State
  const [trafficData, setTrafficData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  // Date range
  const defaultRange = getDefaultDateRange();
  const startDate = searchParams.get("startDate") || defaultRange.startDate;
  const endDate = searchParams.get("endDate") || defaultRange.endDate;
  const [dateRange, setDateRange] = useState({
    from: parseISO(startDate),
    to: parseISO(endDate),
  });

  // Convex action
  const getTrafficData = useAction(api.analytics.getTrafficData);
  const getTopPages = useAction(api.analytics.getTopPages);

  // Fetch data when URL params change
  useEffect(() => {
    if (!activeProject || !startDate || !endDate) {
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [traffic, topPages] = await Promise.all([
          getTrafficData({
            projectId: activeProject._id,
            startDate,
            endDate,
          }),
          getTopPages({
            projectId: activeProject._id,
            startDate,
            endDate,
          }),
        ]);
        setTrafficData({ ...traffic, topPages });
        setError(null);
      } catch (err) {
        console.error("Error fetching traffic data:", err);
        setError(err?.message || "Failed to load analytics");
        setTrafficData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeProject, startDate, endDate, getTrafficData]);

  // Handle date range selection
  const handleDateRangeSelect = (range) => {
    setDateRange(range);
  };

  const handleApplyDateRange = () => {
    if (dateRange?.from && dateRange?.to) {
      const params = new URLSearchParams(searchParams);
      params.set("startDate", formatDateISO(dateRange.from));
      params.set("endDate", formatDateISO(dateRange.to));
      router.push(`?${params.toString()}`);
      setPickerOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Date Range Picker */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <AnalyticsHeader />
        </div>

        <div className="flex items-center gap-2">
          {/* Date Range Picker */}
          <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2 text-sm"
              >
                <Calendar className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {formatDateRangeDisplay(startDate, endDate)}
                </span>
                <span className="sm:hidden">
                  {format(parseISO(startDate), "MMM d")} -{" "}
                  {format(parseISO(endDate), "MMM d")}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-4" align="end">
              <div className="space-y-4">
                <CalendarComponent
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={handleDateRangeSelect}
                  numberOfMonths={2}
                  className="rounded-lg"
                />
                <Button
                  onClick={handleApplyDateRange}
                  className="w-full"
                  size="sm"
                >
                  Apply
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {/* Deep Insights Button */}
          <Button
            onClick={() => router.push("/dashboard/deep-insight")}
            className="bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-700 hover:to-emerald-700 text-white shadow-lg shadow-brand-500/20 border-0"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Open Deep Insights
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {loading && <AnalyticsDashboardSkeleton />}

      {/* Error State */}
      {error && (
        <ErrorState
          title="Well, this is awkward..."
          message="Our server just tripped over its own shoelaces."
          onRetry={() => {
            // Refetch by re-triggering the effect
            const params = new URLSearchParams(searchParams);
            router.refresh();
          }}
          onContact={() => {
            window.location.href = "mailto:support@omnoptimize.com";
          }}
          showRefresh
          showContact
          backgroundImage={confusedCatImage.src}
        />
      )}

      {/* Content */}
      {!loading && !error && trafficData && (
        <>
          <MetricsGrid data={trafficData.cards} />

          <div className="grid grid-cols-1">
            <TrafficChart data={trafficData.charts.visitorGrowth} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <HeatmapCard />
            <DemographicsCard
              data={trafficData.demographics}
              deviceData={trafficData.devices}
            />
          </div>

          <div className="grid grid-cols-1">
            <TopPagesTable
              pages={trafficData?.topPages?.pages || []}
              loading={loading}
            />
          </div>
        </>
      )}
    </div>
  );
}
