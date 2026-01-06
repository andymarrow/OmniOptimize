"use client";
import React, { useState } from "react";
import { 
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription 
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Bot, AlertTriangle, Check, X, Copy, CheckCircle2, FileCode, 
  Terminal, ShieldAlert, ShieldCheck, ArrowRight, Activity 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// --- SUB-COMPONENT: CODE BLOCK ---
const FixBlock = ({ type, content }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="mt-4 group relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
            {/* Toolbar */}
            <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-900 px-3 py-2 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                    <Terminal className="w-3 h-3 text-slate-500" />
                    <span className="text-[10px] font-mono font-medium text-slate-500 uppercase tracking-wider">
                        {type === 'code' ? 'Suggested Fix' : 'Action Plan'}
                    </span>
                </div>
                <button 
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-[10px] font-medium text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                    {copied ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied ? "Copied" : "Copy"}
                </button>
            </div>
            
            {/* Content */}
            <div className="p-4 bg-white dark:bg-[#0d1117] overflow-x-auto">
                <pre className="text-xs font-mono leading-relaxed text-slate-800 dark:text-slate-300 whitespace-pre-wrap break-words">
                    {content}
                </pre>
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---
const CommitDetailSheet = ({ isOpen, onClose, commit }) => {
  if (!commit) return null;

  // Determine Overall Health
  const isHighRisk = commit.riskScore >= 70;
  const isMediumRisk = commit.riskScore >= 40 && commit.riskScore < 70;
  const healthColor = isHighRisk ? "text-red-500" : isMediumRisk ? "text-yellow-500" : "text-green-500";
  const healthBg = isHighRisk ? "bg-red-500" : isMediumRisk ? "bg-yellow-500" : "bg-green-500";

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto bg-slate-50/50 dark:bg-[#020617] p-0 backdrop-blur-xl border-l border-slate-200 dark:border-slate-800 focus:outline-none">
        
        {/* --- HEADER (Sticky) --- */}
        <div className="sticky top-0 z-20 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 py-5">
            <div className="flex items-start justify-between gap-4">
                
                {/* Left: Metadata */}
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="font-mono text-[10px] bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500">
                            {commit.sha}
                        </Badge>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs text-slate-500 font-medium">{commit.time}</span>
                    </div>
                    <SheetTitle className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                        {commit.message}
                    </SheetTitle>
                    <SheetDescription className="mt-1 text-sm text-slate-500 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-400">
                            {commit.author?.substring(0,1).toUpperCase()}
                        </span>
                        {commit.author}
                    </SheetDescription>
                </div>

                {/* Right: Score & Close Button */}
                <div className="flex items-start gap-4">
                    
                    {/* Risk Score */}
                    <div className="flex flex-col items-center">
                        <div className="relative w-12 h-12 flex items-center justify-center">
                            <svg className="w-full h-full -rotate-90">
                                <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-200 dark:text-slate-800" />
                                <circle 
                                    cx="24" cy="24" r="20" 
                                    stroke="currentColor" strokeWidth="4" 
                                    fill="transparent" 
                                    strokeDasharray={125} 
                                    strokeDashoffset={125 - (125 * (commit.riskScore / 100))} 
                                    className={healthColor}
                                    strokeLinecap="round" 
                                />
                            </svg>
                            <span className={`absolute text-xs font-bold ${healthColor}`}>{commit.riskScore}</span>
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mt-1">Risk</span>
                    </div>

                    {/* CLOSE BUTTON (Mobile Friendly) */}
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"
                        onClick={() => onClose()}
                    >
                        <X className="w-4 h-4" />
                    </Button>

                </div>
            </div>
        </div>

        {/* --- SCROLLABLE CONTENT --- */}
        <div className="p-6 space-y-8">

            {/* 1. AI SUMMARY CARD */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-50" />
                <div className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <Bot className="w-4 h-4 text-blue-500" />
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">AI Executive Summary</h4>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        {commit.summary}
                    </p>
                </div>
            </div>

            {/* 2. ISSUES LIST */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Activity className="w-4 h-4 text-slate-400" />
                        Security Findings
                    </h3>
                    <Badge variant="secondary" className="text-xs">
                        {commit.issues?.length || 0} Issues
                    </Badge>
                </div>

                <div className="space-y-4">
                    {commit.issues && commit.issues.length > 0 ? (
                        commit.issues.map((issue, i) => {
                            const isCrit = issue.severity === 'high' || issue.severity === 'critical';
                            const isWarn = issue.severity === 'medium';
                            
                            return (
                                <motion.div 
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className={cn(
                                        "group rounded-xl border bg-white dark:bg-slate-900 transition-all hover:shadow-md overflow-hidden",
                                        isCrit ? "border-red-200 dark:border-red-900/30" : isWarn ? "border-yellow-200 dark:border-yellow-900/30" : "border-slate-200 dark:border-slate-800"
                                    )}
                                >
                                    {/* Issue Header */}
                                    <div className="px-5 py-4 flex gap-4">
                                        <div className={cn(
                                            "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                                            isCrit ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400" 
                                            : isWarn ? "bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400"
                                            : "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                                        )}>
                                            {isCrit ? <ShieldAlert className="w-5 h-5" /> : isWarn ? <AlertTriangle className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                                                <h5 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                                    {issue.suggestion || "Code Issue"}
                                                </h5>
                                                <div className="flex items-center gap-2">
                                                    {issue.file && (
                                                        <span className="text-[10px] font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 max-w-[120px] truncate">
                                                            {issue.file}:{issue.line}
                                                        </span>
                                                    )}
                                                    <Badge variant="outline" className={cn(
                                                        "text-[10px] uppercase font-bold px-1.5 py-0 border-0",
                                                        isCrit ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
                                                        : isWarn ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400"
                                                        : "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400"
                                                    )}>
                                                        {issue.severity}
                                                    </Badge>
                                                </div>
                                            </div>
                                            
                                            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                                                {issue.description}
                                            </p>

                                            {/* Fix Block (Rendered if content exists) */}
                                            {issue.fixContent && (
                                                <FixBlock type={issue.fixType} content={issue.fixContent} />
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                            <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-3">
                                <Check className="w-6 h-6 text-green-500" />
                            </div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">All Clear!</h4>
                            <p className="text-xs text-slate-500 mt-1 max-w-[200px]">
                                Omni found no critical issues in this commit. Good job!
                            </p>
                        </div>
                    )}
                </div>
            </div>

        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CommitDetailSheet;