"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Users,
  MousePointer2,
  ShieldCheck,
  GitCommit,
  Loader2,
  Calendar,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import Link from "next/link";

// Project & Convex
import { useProject } from "@/app/_context/ProjectContext";
import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";

// Date utilities
import {
  getDefaultDateRange,
  formatDateISO,
  formatDateRangeDisplay,
  formatChartLabel,
  parseISO,
} from "@/utils/dateFormatter";

// Formatters
import {
  formatNumberCompact,
  formatPercentage,
  formatDurationSeconds,
  getTrend,
  getTrendColors,
} from "@/utils/formatters";

import { format } from "date-fns";

// Mock chart data (keeping as requested)
const trafficData = [
  { name: "Mon", visits: 4000, bounce: 2400 },
  { name: "Tue", visits: 3000, bounce: 1398 },
  { name: "Wed", visits: 2000, bounce: 9800 },
  { name: "Thu", visits: 2780, bounce: 3908 },
  { name: "Fri", visits: 1890, bounce: 4800 },
  { name: "Sat", visits: 2390, bounce: 3800 },
  { name: "Sun", visits: 3490, bounce: 4300 },
];

export default function DashboardOverview() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { activeProject } = useProject();

  // 1. Get date range from URL or defaults
  const defaultRange = getDefaultDateRange();
  const startDate = searchParams.get("startDate") || defaultRange.startDate;
  const endDate = searchParams.get("endDate") || defaultRange.endDate;

  // 2. Call Convex action to fetch analytics
  const getOverviewAction = useAction(api.analytics.getOverview);
  const [overviewData, setOverviewData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    from: parseISO(startDate),
    to: parseISO(endDate),
  });
  const [pickerOpen, setPickerOpen] = useState(false);

  // 3. Fetch analytics when URL params change
  useEffect(() => {
    if (!activeProject || !startDate || !endDate) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getOverviewAction({
          projectId: activeProject._id,
          startDate,
          endDate,
        });
        setOverviewData(data);
      } catch (err) {
        console.error("Error fetching overview:", err);
        setError("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeProject, startDate, endDate, getOverviewAction]);

  // 4. Fetch recent commits (existing functionality)
  const recentCommits = useQuery(
    api.queries.getCommits,
    activeProject ? { projectId: activeProject._id } : "skip"
  );

  // 5. Map backend data to card format
  const getMetricsCards = () => {
    if (!overviewData?.cards) return [];

    const { totalVisits, avgSession, bounceRate } = overviewData.cards;

    return [
      {
        title: "Total Visits",
        value: formatNumberCompact(totalVisits.current),
        change: formatPercentage(totalVisits.changePct),
        trend: getTrend(totalVisits.changePct),
        icon: Users,
      },
      {
        title: "Avg. Session",
        value: formatDurationSeconds(avgSession.current),
        change: formatPercentage(avgSession.changePct),
        trend: getTrend(avgSession.changePct),
        icon: Activity,
      },
      {
        title: "Bounce Rate",
        value: `${bounceRate.current?.toFixed(1) || 0}%`,
        change: formatPercentage(bounceRate.changePct),
        trend: getTrend(bounceRate.changePct, true), // Inverted - down is good
        icon: MousePointer2,
      },
      {
        title: "Critical Issues",
        value: "—",
        change: "",
        trend: "neutral",
        icon: ShieldCheck,
        disabled: true,
      },
    ];
  };

  // 6. Transform chart data
  const getChartData = () => {
    if (!overviewData?.chart?.trafficOverview) return trafficData;

    return overviewData.chart.trafficOverview.map((item) => ({
      date: formatChartLabel(item.date),
      visitors: item.visitors,
      bounceRate: item.bounceRate,
    }));
  };

  // 7. Handle date range selection
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

  const getStatus = (score) => {
    if (score >= 80)
      return {
        label: "Critical",
        color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      };
    if (score >= 40)
      return {
        label: "Warning",
        color:
          "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
      };
    return {
      label: "Safe",
      color:
        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    };
  };

  const metrics = getMetricsCards();
  const chartData = getChartData();

  return (
    <div className="space-y-8">
      {/* 1. Header Section with Date Picker */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Overview
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            Here's what's happening with{" "}
            <span className="font-semibold text-slate-900 dark:text-white">
              {activeProject?.name || "your project"}
            </span>{" "}
            today.
          </p>
        </div>

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
      </div>

      {/* 2. Stats Grid - Real Data */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, i) => {
          const colors = getTrendColors(metric.trend);
          return (
            <Card
              key={i}
              className={`border-slate-200 dark:border-slate-800 shadow-sm ${
                metric.disabled ? "opacity-50" : ""
              }`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  {metric.title}
                </CardTitle>
                <metric.icon className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {metric.disabled ? (
                    <span className="text-sm opacity-70">Coming soon</span>
                  ) : (
                    metric.value
                  )}
                </div>
                {!metric.disabled && metric.change && (
                  <div className="flex items-center text-xs mt-1">
                    {metric.trend === "up" && (
                      <ArrowUpRight className="w-3 h-3 text-green-500 mr-1" />
                    )}
                    {metric.trend === "down" && (
                      <ArrowDownRight className="w-3 h-3 text-red-500 mr-1" />
                    )}
                    <span className={`font-medium ${colors.text}`}>
                      {metric.change}
                    </span>
                    <span className="text-slate-400 ml-1">from previous</span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 3. Loading State */}
      {loading && (
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="p-12 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
              <p className="text-sm text-slate-500">Loading analytics...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 4. Error State */}
      {error && (
        <Card className="border-red-200 dark:border-red-900/30 shadow-sm bg-red-50 dark:bg-red-900/10">
          <CardContent className="p-6">
            <p className="text-sm text-red-600 dark:text-red-400">
              Error loading analytics: {error}
            </p>
          </CardContent>
        </Card>
      )}

      {/* 5. Main Charts Area */}
      {!loading && overviewData && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          {/* Traffic Chart */}
          <Card className="col-span-4 border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader>
              <CardTitle>Traffic Overview</CardTitle>
              <CardDescription>Daily visitors vs. bounce rate.</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient
                        id="colorVisitors"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#3b82f6"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#3b82f6"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-slate-200 dark:stroke-slate-800"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="date"
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "none",
                        borderRadius: "8px",
                        color: "#fff",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="visitors"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorVisitors)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Recent Commits */}
          <Card className="col-span-3 border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
            <CardHeader>
              <CardTitle>Recent Code Commits</CardTitle>
              <CardDescription>
                {activeProject
                  ? "Real-time security scans from GitHub."
                  : "Select a project to view commits."}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
              <div className="space-y-6">
                {/* A. Loading State */}
                {recentCommits === undefined && (
                  <div className="flex flex-col items-center justify-center h-40 text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mb-2 text-brand-500" />
                    <p className="text-xs">Syncing commits...</p>
                  </div>
                )}

                {/* B. Empty State */}
                {recentCommits && recentCommits.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-40 text-slate-500 text-center">
                    <GitCommit className="w-8 h-8 mb-2 opacity-20" />
                    <p className="text-sm font-medium">
                      No commits scanned yet.
                    </p>
                    <p className="text-xs mt-1">
                      Push code to GitHub to trigger the AI agent.
                    </p>
                  </div>
                )}

                {/* C. Real Data List */}
                {recentCommits &&
                  recentCommits.slice(0, 5).map((commit, i) => {
                    const status = getStatus(commit.riskScore || 0);
                    return (
                      <div
                        key={commit._id}
                        className="flex items-start gap-4 group"
                      >
                        <div className="relative mt-1">
                          <div className="z-10 relative flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 group-hover:border-brand-500/50 transition-colors">
                            <GitCommit className="h-4 w-4 text-slate-500" />
                          </div>
                          {/* Vertical Line */}
                          {i !== recentCommits.length - 1 && (
                            <div className="absolute left-4 top-8 h-12 w-px bg-slate-200 dark:bg-slate-800" />
                          )}
                        </div>
                        <div className="flex-1 space-y-1 pb-2">
                          <p className="text-sm font-medium text-slate-900 dark:text-white leading-tight line-clamp-1 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                            {commit.message}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span>{commit.author}</span>
                            <span>•</span>
                            <span>
                              {commit.createdAt
                                ? new Date(
                                    commit.createdAt
                                  ).toLocaleDateString()
                                : "Just now"}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded-full text-[10px] uppercase font-bold ${status.color}`}
                            >
                              {status.label}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {recentCommits && recentCommits.length > 0 && (
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Link href="/code">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs"
                    >
                      View Full Scan History
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
