"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Github, GitBranch, AlertCircle } from "lucide-react";
import { useProject } from "@/app/_context/ProjectContext"; // <--- Import Context

const CodeHeader = () => {
  const { activeProject, isLoading } = useProject();

  // Loading Skeleton
  if (isLoading) {
    return <div className="h-20 w-full bg-slate-100 dark:bg-slate-900 rounded-lg animate-pulse mb-8" />;
  }

  // Fallback if no project selected
  if (!activeProject) {
    return null;
  }

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            Code Health
        </h2>
        <div className="flex items-center gap-3 mt-1.5 text-sm text-slate-500 dark:text-slate-400 font-mono">
            {/* Dynamic Project Name / Repo */}
            <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                <Github className="w-3.5 h-3.5" /> 
                {activeProject.githubRepo || activeProject.name}
            </span>
            
            <span>/</span>
            
            {/* We default to 'main' visually, or you could hide this if you prefer */}
            <span className="flex items-center gap-1">
                <GitBranch className="w-3.5 h-3.5" /> main
            </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-900 rounded text-xs text-slate-500 mr-2 border border-slate-200 dark:border-slate-800">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Listening for Webhooks
        </div>
        
        {/* Manual Trigger (Optional: You could wire this to a mutation later) */}
        <Button className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100">
            <RefreshCw className="mr-2 w-4 h-4" /> Trigger Manual Scan
        </Button>
      </div>
    </div>
  );
};

export default CodeHeader;