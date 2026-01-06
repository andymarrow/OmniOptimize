"use client";
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Fingerprint, X } from "lucide-react";

// IMPORTS
import { SessionReplayTab } from "./insights/SessionReplayTab";
import { FunnelTab } from "./insights/FunnelTab";
import { CohortTab } from "./insights/CohortTab";
import { SearchTab } from "./insights/SearchTab";

const DeepInsightsModal = ({ isOpen, onClose, defaultTab = "behavior" }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* 
          RESPONSIVE SIZING: 
          - Mobile: w-full h-[100dvh] (Full screen, no border radius)
          - Desktop: w-[1200px] h-[90vh] (Floating modal with borders)
      */}
      <DialogContent className="max-w-full w-full h-[100dvh] sm:max-w-[95vw] sm:w-[1200px] sm:h-[90vh] p-0 gap-0 overflow-hidden bg-slate-50 dark:bg-[#020617] border-0 sm:border sm:border-slate-200 dark:sm:border-slate-800 flex flex-col sm:rounded-xl">
        
        {/* HEADER */}
        <DialogHeader className="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex-shrink-0 flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg shrink-0">
                    <Fingerprint className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                    <DialogTitle className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white text-left">Deep Insights</DialogTitle>
                    <p className="text-xs text-slate-500 hidden sm:block">AI-powered behavioral analysis</p>
                </div>
            </div>
            
            <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-amber-200 to-yellow-400 text-slate-900 text-[10px] sm:text-xs font-bold px-2 py-1 sm:px-3 rounded-full flex items-center gap-1">
                    <span>👑</span> <span className="hidden sm:inline">PRO FEATURE</span><span className="sm:hidden">PRO</span>
                </div>
                {/* Mobile Close Button since standard one might be tight */}
                <button onClick={onClose} className="sm:hidden p-2 -mr-2 text-slate-500">
                    <X className="w-5 h-5" />
                </button>
            </div>
        </DialogHeader>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 overflow-hidden flex flex-col">
            <Tabs defaultValue={defaultTab} className="h-full flex flex-col">
                
                {/* TABS HEADER - Scrollable on mobile */}
                <div className="px-4 sm:px-6 pt-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex-shrink-0 overflow-x-auto scrollbar-hide">
                    <TabsList className="bg-transparent p-0 gap-6 h-auto w-full justify-start">
                        <TabsTrigger value="behavior" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-brand-500 rounded-none pb-3 px-0 text-slate-500 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white transition-all whitespace-nowrap">
                            Session Replays
                        </TabsTrigger>
                        <TabsTrigger value="funnels" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-brand-500 rounded-none pb-3 px-0 text-slate-500 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white transition-all whitespace-nowrap">
                            Funnels & Forms
                        </TabsTrigger>
                        <TabsTrigger value="retention" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-brand-500 rounded-none pb-3 px-0 text-slate-500 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white transition-all whitespace-nowrap">
                            Cohorts (LTV)
                        </TabsTrigger>
                        <TabsTrigger value="search" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-brand-500 rounded-none pb-3 px-0 text-slate-500 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white transition-all whitespace-nowrap">
                            Search & Intent
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* SCROLLABLE CONTENT BODY */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6  bg-slate-50 dark:bg-[#020617]">
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

      </DialogContent>
    </Dialog>
  );
};

export default DeepInsightsModal;