"use client";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Timer, MousePointerClick } from "lucide-react";
import {
  formatNumberCompact,
  formatPercentage,
  formatDurationSeconds,
  getTrend,
  getTrendColors,
} from "@/utils/formatters";

const MetricsGrid = ({ data }) => {
  if (!data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-24 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  const { activeUsers, avgSessionTime, totalClicks } = data;

  const metrics = [
    {
      title: "Active Users",
      value: formatNumberCompact(activeUsers.current),
      change: formatPercentage(activeUsers.changePct),
      trend: getTrend(activeUsers.changePct),
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: "Avg. Time",
      value: formatDurationSeconds(avgSessionTime.current),
      change: formatPercentage(avgSessionTime.changePct),
      trend: getTrend(avgSessionTime.changePct),
      icon: Timer,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
    {
      title: "Total Clicks",
      value: formatNumberCompact(totalClicks.current),
      change: formatPercentage(totalClicks.changePct),
      trend: getTrend(totalClicks.changePct),
      icon: MousePointerClick,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {metrics.map((m, i) => {
        const colors = getTrendColors(m.trend);
        return (
          <Card
            key={i}
            className="border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow"
          >
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  {m.title}
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {m.value}
                  </h3>
                  <span
                    className={`text-xs font-medium px-1.5 py-0.5 rounded ${colors.bg} ${colors.text}`}
                  >
                    {m.change}
                  </span>
                </div>
              </div>
              <div className={`p-3 rounded-xl ${m.bg}`}>
                <m.icon className={`w-5 h-5 ${m.color}`} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default MetricsGrid;
