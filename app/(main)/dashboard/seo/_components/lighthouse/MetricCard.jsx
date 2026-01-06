"use client";
import React from "react";
import { cn } from "@/lib/utils";

export const MetricCard = ({ label, value, score, description }) => {
  // Map PSI score strings/numbers to colors
  const getColor = () => {
    if (score === "good") return "bg-green-500";
    if (score === "average") return "bg-orange-500";
    return "bg-red-500";
  };

  const getTextColor = () => {
    if (score === "good") return "text-green-700 dark:text-green-400";
    if (score === "average") return "text-orange-700 dark:text-orange-400";
    return "text-red-700 dark:text-red-400";
  };

  return (
    <div className="p-5 flex flex-col justify-between h-full border-b md:border-r border-slate-100 dark:border-slate-800 relative overflow-hidden group">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</span>
            <div className={cn("w-2 h-2 rounded-full", getColor())} />
        </div>

        {/* Value */}
        <div className={cn("text-3xl font-mono font-medium mb-4", getTextColor())}>
            {value}
        </div>

        {/* Visual Bar (PSI Style) */}
        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
            {/* These percentages roughly mimic PSI's distribution visuals */}
            <div className="h-full bg-green-500 w-[50%] opacity-20" />
            <div className="h-full bg-orange-500 w-[30%] opacity-20" />
            <div className="h-full bg-red-500 w-[20%] opacity-20" />
            
            {/* The Indicator */}
            <div 
                className={cn("absolute h-1.5 w-8 rounded-full", getColor())}
                style={{ 
                    // Simple logic to position the bar based on "good/average/poor"
                    left: score === "good" ? "20%" : score === "average" ? "60%" : "90%" 
                }} 
            />
        </div>
        
        {/* Tooltip Description on Hover */}
        {description && (
            <div className="absolute inset-0 bg-slate-900/95 p-4 text-xs text-slate-300 flex items-center justify-center text-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                {description}
            </div>
        )}
    </div>
  );
};