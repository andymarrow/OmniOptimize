"use client";
import React from "react";
import { Calendar as CalendarIcon, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const AnalyticsHeader = () => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Traffic Analytics
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
            Real-time insights for <span className="font-semibold text-slate-900 dark:text-white">wego.com.et</span>
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" className="h-9 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    Last 30 Days
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
                {/* Mock Calendar Content */}
                <div className="p-4 text-sm text-center text-slate-500">
                    [Date Picker Component Would Go Here]
                </div>
            </PopoverContent>
        </Popover>
        
        <Button variant="outline" size="icon" className="h-9 w-9 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
            <Download className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default AnalyticsHeader;