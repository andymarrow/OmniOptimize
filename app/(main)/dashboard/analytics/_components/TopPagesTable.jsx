"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Clock } from "lucide-react";
import { TableSkeleton } from "@/components/skeleton/dashboardSkeletons";
import { formatDurationSeconds } from "@/utils/formatters";

const TopPagesTable = ({ pages = [], loading = false }) => {
  if (loading) {
    return <TableSkeleton title="Top Performing Pages" rows={6} columns={3} />;
  }

  if (!pages || pages.length === 0) {
    return (
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm flex-1">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">
            Top Performing Pages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No data available for this date range
          </p>
        </CardContent>
      </Card>
    );
  }

  // Calculate max views for progress bar scaling
  const maxViews = Math.max(...pages.map((p) => p.views || 0), 1);

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-sm flex-1">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">
          Top Performing Pages
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pages.map((page, i) => {
            const progressWidth = Math.max(
              4,
              Math.round((page.views / maxViews) * 100)
            );
            const formattedViews = new Intl.NumberFormat("en-US").format(
              page.views
            );
            const formattedTime = formatDurationSeconds(
              Math.round(page.avgTimeSeconds || 0)
            );

            return (
              <div
                key={i}
                className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg transition-colors"
              >
                <div className="flex flex-col flex-1">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {page.path}
                  </span>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div
                      className="bg-brand-500 h-full rounded-full"
                      style={{ width: `${progressWidth}%` }}
                    ></div>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500 ml-4">
                  <span className="flex items-center gap-1 whitespace-nowrap">
                    <Eye className="w-3 h-3" /> {formattedViews}
                  </span>
                  <span className="flex items-center gap-1 whitespace-nowrap">
                    <Clock className="w-3 h-3" /> {formattedTime}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default TopPagesTable;
