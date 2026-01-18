"use client";
import React, { useState, useCallback } from "react";
import { format, parseISO } from "date-fns";
import { Calendar as CalendarIcon, RotateCcw, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const AVAILABLE_INTERVALS = ["0", "1", "2", "3", "7", "14", "30"];

export const CohortFilters = ({
  startDate,
  endDate,
  intervals,
  onFiltersChange,
}) => {
  const [dateRange, setDateRange] = useState({
    from: parseISO(startDate),
    to: parseISO(endDate),
  });
  const [pickerOpen, setPickerOpen] = useState(false);
  const intervalArray = intervals.split(",").map((i) => i.trim());

  const handleDateRangeSelect = useCallback((range) => {
    setDateRange(range);
  }, []);

  const handleApplyDateRange = useCallback(() => {
    if (dateRange?.from && dateRange?.to) {
      onFiltersChange(
        dateRange.from.toISOString().split("T")[0],
        dateRange.to.toISOString().split("T")[0],
        intervals,
      );
      setPickerOpen(false);
    }
  }, [dateRange, intervals, onFiltersChange]);

  const handleIntervalToggle = useCallback(
    (interval) => {
      let newIntervals;
      if (intervalArray.includes(interval)) {
        newIntervals = intervalArray.filter((i) => i !== interval).join(",");
      } else {
        newIntervals = [...intervalArray, interval]
          .sort((a, b) => parseInt(a) - parseInt(b))
          .join(",");
      }
      onFiltersChange(startDate, endDate, newIntervals);
    },
    [intervalArray, startDate, endDate, onFiltersChange],
  );

  const handleReset = useCallback(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const newStart = thirtyDaysAgo.toISOString().split("T")[0];
    const newEnd = now.toISOString().split("T")[0];
    const defaultIntervals = "0,1,2,3,7,14,30";

    setDateRange({
      from: parseISO(newStart),
      to: parseISO(newEnd),
    });
    onFiltersChange(newStart, newEnd, defaultIntervals);
  }, [onFiltersChange]);

  return (
    <div className="flex flex-col md:flex-row gap-3 p-4 bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-700 items-start md:items-center">
      {/* Date Range Picker */}
      <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="gap-2 text-sm">
            <CalendarIcon className="w-4 h-4" />
            <span className="hidden sm:inline">
              {format(parseISO(startDate), "MMM d")} -{" "}
              {format(parseISO(endDate), "MMM d")}
            </span>
            <span className="sm:hidden">Date Range</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-4" align="start">
          <div className="space-y-4">
            <Calendar
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={handleDateRangeSelect}
              numberOfMonths={2}
              className="rounded-lg"
            />
            <Button onClick={handleApplyDateRange} className="w-full" size="sm">
              Apply
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Intervals Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2 text-sm">
            <span>Days: {intervalArray.length}</span>
            <ChevronDown className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          {AVAILABLE_INTERVALS.map((interval) => (
            <DropdownMenuCheckboxItem
              key={interval}
              checked={intervalArray.includes(interval)}
              onCheckedChange={() => handleIntervalToggle(interval)}
            >
              Day {interval}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Reset Button */}
      <Button
        onClick={handleReset}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <RotateCcw className="w-4 h-4" />
        <span className="hidden sm:inline">Reset</span>
      </Button>
    </div>
  );
};
