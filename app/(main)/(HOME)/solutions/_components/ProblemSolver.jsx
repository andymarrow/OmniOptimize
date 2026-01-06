"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, XCircle, FileWarning, Zap, Search, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const ProblemSolver = () => {
  const [activeSide, setActiveSide] = useState("right"); // 'left' or 'right'

  return (
    <section className="py-24 bg-white dark:bg-slate-950 overflow-hidden">
      <div className="container mx-auto px-4">
        
        <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                The Cost of Fragmentation
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                Most teams treat SEO, Performance, and Code Quality as separate silos. 
                This leads to "Optimization Debt."
            </p>
        </div>

        {/* THE INTERACTIVE COMPARISON */}
        <div className="flex flex-col md:flex-row h-[600px] w-full max-w-6xl mx-auto rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl">
            
            {/* LEFT SIDE: THE PROBLEM (Red/Chaos) */}
            <div 
                className={cn(
                    "relative transition-all duration-700 ease-in-out cursor-pointer overflow-hidden border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800",
                    activeSide === "left" ? "flex-[2]" : "flex-1"
                )}
                onMouseEnter={() => setActiveSide("left")}
            >
                <div className="absolute inset-0 bg-red-50/50 dark:bg-red-950/10" />
                
                {/* Content */}
                <div className="relative z-10 p-8 md:p-12 h-full flex flex-col">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center text-red-600">
                            <XCircle className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">The Fragmented Stack</h3>
                    </div>

                    {/* Chaos Visuals */}
                    <div className="space-y-4 opacity-80">
                         {/* Fake Error Cards */}
                        <motion.div 
                             animate={{ x: activeSide === 'left' ? 0 : -10 }}
                             className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-red-200 dark:border-red-900/30 shadow-sm flex items-start gap-3"
                        >
                            <FileWarning className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                            <div>
                                <div className="text-sm font-bold text-slate-700 dark:text-slate-200">SEO Score: 42/100</div>
                                <div className="text-xs text-slate-500">Missing meta tags on 14 pages.</div>
                            </div>
                        </motion.div>

                        <motion.div 
                             animate={{ x: activeSide === 'left' ? 0 : -10 }}
                             transition={{ delay: 0.1 }}
                             className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-orange-200 dark:border-orange-900/30 shadow-sm flex items-start gap-3"
                        >
                            <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                            <div>
                                <div className="text-sm font-bold text-slate-700 dark:text-slate-200">Security Risk</div>
                                <div className="text-xs text-slate-500">API Key exposed in client bundle.</div>
                            </div>
                        </motion.div>
                        
                        {/* Only visible when expanded */}
                        <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: activeSide === 'left' ? 1 : 0 }}
                            className="mt-8 text-slate-600 dark:text-slate-400 text-sm leading-relaxed"
                        >
                            Without a unified view, developers push code that breaks SEO. Marketers write content that slows down the site. Everyone works hard, but the website score keeps dropping.
                        </motion.p>
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE: THE SOLUTION (Green/Order) */}
            <div 
                className={cn(
                    "relative transition-all duration-700 ease-in-out cursor-pointer overflow-hidden bg-slate-50 dark:bg-slate-900",
                    activeSide === "right" ? "flex-[2]" : "flex-1"
                )}
                onMouseEnter={() => setActiveSide("right")}
            >
                <div className="absolute inset-0 bg-brand-50/50 dark:bg-brand-900/10" />
                
                 {/* Content */}
                 <div className="relative z-10 p-8 md:p-12 h-full flex flex-col">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/50 flex items-center justify-center text-brand-600">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">The Omni Approach</h3>
                    </div>

                     {/* Order Visuals */}
                     <div className="space-y-4">
                        {/* Unified Card */}
                        <motion.div 
                             animate={{ x: activeSide === 'right' ? 0 : 10 }}
                             className="p-5 bg-white dark:bg-slate-950 rounded-xl border border-brand-200 dark:border-brand-900/30 shadow-lg shadow-brand-500/5"
                        >
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Health Score</span>
                                <span className="text-sm font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/30 px-2 py-0.5 rounded-full">98/100</span>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-2">
                                <div className="flex flex-col items-center p-2 bg-slate-50 dark:bg-slate-900 rounded">
                                    <Search className="w-4 h-4 text-blue-500 mb-1" />
                                    <span className="text-[10px] font-bold dark:text-slate-50 text-slate-900">SEO</span>
                                </div>
                                <div className="flex flex-col items-center p-2 bg-slate-50 dark:bg-slate-900 rounded">
                                    <Zap className="w-4 h-4 text-yellow-500 mb-1" />
                                    <span className="text-[10px] font-bold dark:text-slate-50 text-slate-900">Perf</span>
                                </div>
                                <div className="flex flex-col items-center p-2 bg-slate-50 dark:bg-slate-900 rounded">
                                    <ShieldCheck className="w-4 h-4 text-purple-500 mb-1" />
                                    <span className="text-[10px] font-bold dark:text-slate-50 text-slate-900">Code</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Only visible when expanded */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: activeSide === 'right' ? 1 : 0 }}
                            className="space-y-4"
                        >
                            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                                OmniOptimize acts as a guardrail. It catches SEO regressions in PRs, monitors latency in production, and provides AI-powered fixes automatically.
                            </p>
                            
                            <div className="flex items-center gap-2 text-xs font-mono text-brand-600 dark:text-brand-400">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>CI/CD Pipeline Integration Active</span>
                            </div>
                        </motion.div>
                     </div>
                </div>
            </div>

        </div>
      </div>
    </section>
  );
};

export default ProblemSolver;