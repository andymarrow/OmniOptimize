"use client";
import React from "react";

const HeatmapSkeleton = () => {
  return (
    <div className="w-full h-full flex items-center justify-center p-4 md:p-8">
      {/* Skeleton canvas */}
      <div className="w-full max-w-5xl h-96 md:h-full bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
    </div>
  );
};

export default HeatmapSkeleton;
