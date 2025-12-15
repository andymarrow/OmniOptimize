"use client";
import React from "react";
import { cn } from "@/lib/utils";

export const Filmstrip = ({ items, device }) => {
  if (!items || items.length === 0) return null;

  // Adjust dimensions based on device
  const isMobile = device === 'mobile';
  
  return (
    <div className="py-6 px-2 overflow-x-auto scrollbar-hide">
        <div className="flex gap-4 min-w-max">
            {items.map((frame, i) => (
                <div key={i} className="flex flex-col gap-2 group">
                    <div 
                        className={cn(
                            "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded shadow-sm p-1 transition-transform group-hover:scale-105",
                            isMobile ? "w-24 h-40" : "w-40 h-28" // Portrait vs Landscape
                        )}
                    >
                        <img 
                            src={frame.data} 
                            alt={`Frame ${i}`} 
                            className="w-full h-full object-contain bg-slate-100 dark:bg-slate-950 rounded"
                        />
                    </div>
                    <span className="text-[10px] text-center text-slate-500 font-mono group-hover:text-slate-900 dark:group-hover:text-white">
                        {frame.timestamp}ms
                    </span>
                </div>
            ))}
        </div>
    </div>
  );
};