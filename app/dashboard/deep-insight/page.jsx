"use client";
import React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Fingerprint } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocalStorage } from "@/hooks/useLocalStorage";

// Import tab components from shared location
import { SessionReplayTab } from "@/app/dashboard/_components/insights/SessionReplayTab";
import { FunnelTab } from "@/app/dashboard/_components/insights/FunnelTab";
import { CohortTab } from "@/app/dashboard/_components/insights/CohortTab";
import { SearchTab } from "@/app/dashboard/_components/insights/SearchTab";

const DEFAULT_TAB = "behavior";

export default function DeepInsightPage() {
  // Use localStorage to persist tab selection
  const [activeTab, setActiveTab, isLoaded] = useLocalStorage(
    "deepInsight_activeTab",
    DEFAULT_TAB
  );

  if (!isLoaded) {
    return null; // Prevent hydration mismatch
  }

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-[#020617]">
      {/* HEADER */}
      <div className="px-4 py-4 sm:px-6 sm:py-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg shrink-0">
            <Fingerprint className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Deep Insights
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              AI-powered behavioral analysis
            </p>
          </div>
          <div className="ml-auto">
            <div className="bg-gradient-to-r from-amber-200 to-yellow-400 text-slate-900 text-xs sm:text-sm font-bold px-3 py-1.5 sm:px-4 rounded-full flex items-center gap-2">
              <span>👑</span>
              <span className="hidden sm:inline">PRO FEATURE</span>
              <span className="sm:hidden">PRO</span>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="h-full flex flex-col"
        >
          {/* TABS HEADER - Scrollable on mobile */}
          <div className="px-4 sm:px-6 pt-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex-shrink-0 overflow-x-auto scrollbar-hide">
            <TabsList className="bg-transparent p-0 gap-6 h-auto w-full justify-start">
              <TabsTrigger
                value="behavior"
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-brand-500 rounded-none pb-3 px-0 text-slate-500 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white transition-all whitespace-nowrap"
              >
                Session Replays
              </TabsTrigger>
              <TabsTrigger
                value="funnels"
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-brand-500 rounded-none pb-3 px-0 text-slate-500 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white transition-all whitespace-nowrap"
              >
                Funnels & Forms
              </TabsTrigger>
              <TabsTrigger
                value="retention"
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-brand-500 rounded-none pb-3 px-0 text-slate-500 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white transition-all whitespace-nowrap"
              >
                Cohorts (LTV)
              </TabsTrigger>
              <TabsTrigger
                value="search"
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-brand-500 rounded-none pb-3 px-0 text-slate-500 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white transition-all whitespace-nowrap"
              >
                Search & Intent
              </TabsTrigger>
            </TabsList>
          </div>

          {/* SCROLLABLE CONTENT BODY */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50 dark:bg-[#020617]">
            <TabsContent value="behavior" className="mt-0 h-full">
              <SessionReplayTab />
            </TabsContent>
            <TabsContent value="funnels" className="mt-0 h-full">
              <FunnelTab />
            </TabsContent>
            <TabsContent value="retention" className="mt-0 h-full">
              <CohortTab />
            </TabsContent>
            <TabsContent value="search" className="mt-0 h-full">
              <SearchTab />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
