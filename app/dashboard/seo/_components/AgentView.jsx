"use client";
import React, { useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useProject } from "@/app/_context/ProjectContext";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, LayoutDashboard } from "lucide-react";

// Components
import { AiSidebar } from "./agent/AiSidebar";
import { PriorityMatrix } from "./agent/PriorityMatrix";
import { TechDebtRadar } from "./agent/TechDebtRadar";
import { ActionPlan } from "./agent/ActionPlan";

const AgentView = () => {
  const { activeProject } = useProject();
  const [isGenerating, setIsGenerating] = useState(false);
  
  // 1. Fetch Latest Scan & Analysis
  const scans = useQuery(api.seo.getScannedUrls, 
    activeProject ? { projectId: activeProject._id } : "skip"
  );
  
  const latestScan = scans && scans.length > 0 ? scans[0] : null;
  const analysis = latestScan?.aiAnalysis;

  // 2. Generator Action
  const generate = useAction(api.ai.generateInsights);

  const handleGenerate = async () => {
    if (!latestScan) return;
    setIsGenerating(true);
    try {
        await generate({ scanId: latestScan._id });
    } catch (err) {
        console.error(err);
    } finally {
        setIsGenerating(false);
    }
  };

  if (!latestScan) {
    return (
        <div className="h-64 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            <p>No scan data available. Run a Lighthouse scan first.</p>
        </div>
    );
  }

  // Render Trigger Button
  if (!analysis) {
    return (
        <div className="h-[500px] flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="w-16 h-16 bg-brand-100 dark:bg-brand-900/20 rounded-full flex items-center justify-center mb-6">
                <Sparkles className="w-8 h-8 text-brand-600 dark:text-brand-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Unlock AI Insights</h3>
            <p className="text-slate-500 max-w-md text-center mb-8">
                Let Omni Agent analyze your performance metrics to generate a strategic priority matrix and actionable roadmap.
            </p>
            <Button 
                size="lg" 
                onClick={handleGenerate} 
                disabled={isGenerating}
                className="bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-700 hover:to-purple-700 text-white shadow-lg"
            >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                {isGenerating ? "Analyzing..." : "Generate Strategic Report"}
            </Button>
        </div>
    );
  }

  // --- THE NEW DASHBOARD LAYOUT ---
  return (
    <div className="animate-in fade-in-50 pb-20 space-y-8">
        
        {/* Top Row: Sidebar + Matrix + Radar */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            
            {/* Sidebar (3 Cols on XL) */}
            <div className="xl:col-span-3 h-full min-h-[450px]">
                <AiSidebar analysis={analysis} />
            </div>

            {/* Middle: Priority Matrix (6 Cols on XL) */}
            <div className="xl:col-span-6 h-full min-h-[450px]">
                <PriorityMatrix data={analysis.visuals.priorityMatrix} />
            </div>

            {/* Right: Radar Chart (3 Cols on XL) */}
            <div className="xl:col-span-3 h-full min-h-[450px]">
                <TechDebtRadar data={analysis.visuals.radarData} />
            </div>
        </div>

        {/* Bottom Row: Roadmap */}
        <div>
            <div className="flex items-center gap-2 mb-4 px-1">
                <LayoutDashboard className="w-5 h-5 text-brand-600" />
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-none">Execution Roadmap</h3>
                    <p className="text-xs text-slate-500 mt-1">AI-recommended path to 90+ Score</p>
                </div>
            </div>
            <ActionPlan roadmap={analysis.roadmap} />
        </div>

    </div>
  );
};

export default AgentView;