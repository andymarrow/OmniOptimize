"use client";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Bot, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export const AiSidebar = ({ analysis }) => {
  const { summary, visuals } = analysis;
  
  return (
    <Card className="h-full border-brand-200 dark:border-brand-900 bg-gradient-to-b from-brand-50/50 to-white dark:from-brand-900/10 dark:to-slate-950 shadow-sm">
        <CardContent className="p-6 flex flex-col h-full">
            
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-brand-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand-500/30">
                    <Bot className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">Omni Agent</h3>
                    <p className="text-xs text-slate-500 dark:text-brand-200">v2.5 • Semantic Model</p>
                </div>
            </div>

            {/* Summary */}
            <div className="mb-8">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Executive Summary</h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    "{summary}"
                </p>
            </div>

            {/* Confidence Gauge */}
            <div className="space-y-2 mb-6">
                <div className="flex justify-between text-xs">
                    <span className="font-bold text-slate-500">Analysis Confidence</span>
                    <span className="font-mono text-brand-600 dark:text-brand-400">{visuals.confidenceScore}%</span>
                </div>
                <Progress value={visuals.confidenceScore} className="h-2" />
            </div>

            {/* Code Health Sentiment */}
            <div className="mt-auto p-4 bg-white/50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <span className="text-xs font-bold text-slate-700 dark:text-white">Technical Health</span>
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                    {visuals.sentimentScore}/100
                </div>
            </div>

        </CardContent>
    </Card>
  );
};