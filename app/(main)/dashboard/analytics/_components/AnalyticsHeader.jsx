"use client";
import React from "react";

const AnalyticsHeader = () => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Traffic Analytics
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Real-time insights for{" "}
          <span className="font-semibold text-slate-900 dark:text-white">
            wego.com.et
          </span>
        </p>
      </div>
    </div>
  );
};

export default AnalyticsHeader;
