"use client";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle2, XCircle, MessageSquare, Loader2, GitCommit } from "lucide-react";
import CommitDetailSheet from "./CommitDetailSheet";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { formatDistanceToNow } from "date-fns"; 
import { useProject } from "@/app/_context/ProjectContext"; // <--- 1. Import Context

const CommitLog = () => {
  const [selectedCommit, setSelectedCommit] = useState(null);
  
  // 2. Get the REAL active project from Context
  const { activeProject } = useProject();

  // 3. Fetch data dynamically based on the active project ID
  // We skip the query if activeProject is null to prevent errors
  const rawCommits = useQuery(api.queries.getCommits, 
    activeProject ? { projectId: activeProject._id } : "skip"
  );

  // Helper to determine status color
  const getStatusColor = (score) => {
    if (score >= 80) return "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"; // Critical
    if (score >= 40) return "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400"; // Warning
    return "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"; // Safe
  };

  const getStatusIcon = (score) => {
    if (score >= 80) return <XCircle className="w-5 h-5" />;
    if (score >= 40) return <AlertTriangle className="w-5 h-5" />;
    return <CheckCircle2 className="w-5 h-5" />;
  };

  // 4. Loading State
  if (!activeProject || rawCommits === undefined) {
    return (
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm min-h-[200px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-slate-500">
                <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
                <span className="text-sm">Syncing with GitHub...</span>
            </div>
        </Card>
    );
  }

  // 5. Transform DB data to UI format
  const commits = rawCommits.map(c => ({
      _id: c._id,
      sha: c.commitHash ? c.commitHash.substring(0, 7) : "unknown",
      message: c.message || "No commit message",
      author: c.author || "Unknown",
      // Safely handle date
      time: c.createdAt ? formatDistanceToNow(c.createdAt, { addSuffix: true }) : "Just now",
      riskScore: c.riskScore || 0,
      summary: c.aiSummary || "Analysis pending...",
      issues: c.issues || [],
      aiComments: c.issues ? c.issues.length : 0
  }));

  return (
    <>
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">
              Commit History
          </CardTitle>
          <div className="flex gap-2 text-xs text-slate-500">
             <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"/> Safe</span>
             <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500"/> Warning</span>
             <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"/> Critical</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            
            {commits.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                    <GitCommit className="w-10 h-10 mb-3 opacity-20" />
                    <p className="font-medium">No commits found yet</p>
                    <p className="text-xs max-w-[250px] text-center mt-1">
                        Push code to your connected repository to trigger the first security scan.
                    </p>
                </div>
            ) : (
                commits.map((commit) => (
                <div 
                    key={commit._id} 
                    onClick={() => setSelectedCommit(commit)}
                    className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all cursor-pointer group"
                >
                    <div className="flex items-start gap-4">
                        {/* Dynamic Status Icon */}
                        <div className={`mt-1 p-2 rounded-full ${getStatusColor(commit.riskScore)}`}>
                            {getStatusIcon(commit.riskScore)}
                        </div>

                        <div>
                            <div className="flex items-center gap-3">
                                <p className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-1">
                                    {commit.message}
                                </p>
                                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-mono text-slate-500">
                                    {commit.sha}
                                </span>
                            </div>
                            
                            <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-500">
                                <span className="flex items-center gap-1">
                                    <span className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[8px] font-bold">
                                        {commit.author.substring(0,1).toUpperCase()}
                                    </span>
                                    {commit.author}
                                </span>
                                <span>•</span>
                                <span>{commit.time}</span>
                                
                                {/* AI Comment Count */}
                                {commit.aiComments > 0 && (
                                    <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-medium bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                        <MessageSquare className="w-3 h-3" />
                                        {commit.aiComments} Findings
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Risk Score Indicator */}
                        <div className="text-right hidden sm:block">
                            <div className="text-[10px] uppercase font-bold text-slate-400">Risk Score</div>
                            <div className={`text-sm font-bold ${
                                commit.riskScore > 50 ? "text-red-500" : commit.riskScore > 0 ? "text-yellow-500" : "text-green-500"
                            }`}>
                                {commit.riskScore}/100
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-brand-500 transition-colors" />
                    </div>
                </div>
                ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Slide-over Sheet */}
      <CommitDetailSheet 
        isOpen={!!selectedCommit} 
        onClose={() => setSelectedCommit(null)} 
        commit={selectedCommit} 
      />
    </>
  );
};

// Helper Icon
const ChevronRight = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m9 18 6-6-6-6"/></svg>
);

export default CommitLog;