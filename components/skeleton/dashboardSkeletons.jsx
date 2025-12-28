"use client";
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

// Generic skeleton pulse element
export const SkeletonPulse = ({ className = "" }) => (
  <div
    className={`bg-slate-200 dark:bg-slate-700 animate-pulse rounded ${className}`}
  />
);

// Skeleton for metric cards (small cards with number + label)
export const MetricCardSkeleton = () => (
  <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
    <CardContent className="pt-6">
      <div className="space-y-3">
        <SkeletonPulse className="h-8 w-24" />
        <SkeletonPulse className="h-4 w-32" />
        <SkeletonPulse className="h-4 w-20" />
      </div>
    </CardContent>
  </Card>
);

// Skeleton for metrics grid (3-4 cards in a row)
export const MetricsGridSkeleton = ({ count = 3 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <MetricCardSkeleton key={i} />
    ))}
  </div>
);

// Skeleton for chart section (full width with tall height)
export const ChartSkeleton = ({ title = true }) => (
  <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
    {title && (
      <CardHeader>
        <SkeletonPulse className="h-6 w-40" />
      </CardHeader>
    )}
    <CardContent className="pt-6">
      <SkeletonPulse className="h-80 w-full rounded-lg" />
    </CardContent>
  </Card>
);

// Skeleton for table rows
export const TableRowSkeleton = ({ columns = 4 }) => (
  <div className="flex gap-4 py-3 px-4 border-b border-slate-200 dark:border-slate-700">
    {Array.from({ length: columns }).map((_, i) => (
      <SkeletonPulse key={i} className="h-4 flex-1" />
    ))}
  </div>
);

// Skeleton for entire table section
export const TableSkeleton = ({ title = true, rows = 5, columns = 4 }) => (
  <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
    {title && (
      <CardHeader>
        <SkeletonPulse className="h-6 w-40" />
      </CardHeader>
    )}
    <CardContent className="pt-6">
      <div className="space-y-1">
        {/* Header skeleton */}
        <div className="flex gap-4 py-3 px-4 border-b-2 border-slate-300 dark:border-slate-600">
          {Array.from({ length: columns }).map((_, i) => (
            <SkeletonPulse key={i} className="h-4 flex-1" />
          ))}
        </div>
        {/* Row skeletons */}
        {Array.from({ length: rows }).map((_, i) => (
          <TableRowSkeleton key={i} columns={columns} />
        ))}
      </div>
    </CardContent>
  </Card>
);

// Skeleton for demographics card (devices + pie chart)
export const DemographicsSkeleton = () => (
  <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
    <CardHeader>
      <SkeletonPulse className="h-6 w-40" />
    </CardHeader>
    <CardContent className="pt-6">
      <div className="space-y-8">
        {/* Device icons skeleton */}
        <div className="flex items-center justify-center gap-8">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <SkeletonPulse className="h-8 w-8 rounded-full" />
              <SkeletonPulse className="h-4 w-12" />
              <SkeletonPulse className="h-3 w-16" />
            </div>
          ))}
        </div>
        {/* Separator */}
        <SkeletonPulse className="h-px w-full" />
        {/* Pie chart skeleton */}
        <div className="flex flex-col items-center">
          <SkeletonPulse className="h-5 w-32 mb-4" />
          <SkeletonPulse className="h-64 w-full rounded-lg" />
        </div>
      </div>
    </CardContent>
  </Card>
);

// Skeleton for heatmap card
export const HeatmapSkeleton = () => (
  <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
    <CardHeader>
      <SkeletonPulse className="h-6 w-40" />
    </CardHeader>
    <CardContent className="pt-6">
      <SkeletonPulse className="h-64 w-full rounded-lg" />
    </CardContent>
  </Card>
);

// Dashboard section skeleton (for analytics page)
export const AnalyticsDashboardSkeleton = () => (
  <div className="space-y-6">
    {/* Metrics grid */}
    <MetricsGridSkeleton count={3} />

    {/* Chart */}
    <ChartSkeleton />

    {/* Demographics and heatmap */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <HeatmapSkeleton />
      <DemographicsSkeleton />
    </div>

    {/* Table */}
    <TableSkeleton rows={6} columns={4} />
  </div>
);
