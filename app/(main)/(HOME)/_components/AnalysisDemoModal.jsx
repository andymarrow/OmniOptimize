"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Lock, ArrowRight, Sparkles, Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  "Connecting to headless browser...",
  "Parsing semantic HTML structure...",
  "Evaluating Core Web Vitals...",
  "Checking mobile responsiveness...",
  "Generating optimization strategies..."
];

const AnalysisDemoModal = ({ isOpen, onClose, url }) => {
  const [isFinished, setIsFinished] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Clean URL display
  const displayUrl = url ? url.replace(/(^\w+:|^)\/\//, '').replace('www.', '') : "website.com";

  useEffect(() => {
    if (isOpen) {
      setIsFinished(false);
      setProgress(0);
      setCurrentStepIndex(0);

      // Smooth Progress Bar Simulation
      const timer = setInterval(() => {
        setProgress((old) => {
          if (old >= 100) {
            clearInterval(timer);
            setTimeout(() => setIsFinished(true), 600); // Small delay before switching
            return 100;
          }
          // Randomize speed to feel "real"
          const diff = Math.random() * 2 + 1;
          return Math.min(old + diff, 100);
        });
      }, 50);

      // Step Text Switcher
      const stepTimer = setInterval(() => {
        setCurrentStepIndex((prev) => (prev + 1) % STEPS.length);
      }, 1200);

      return () => {
        clearInterval(timer);
        clearInterval(stepTimer);
      };
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[700px] p-0 border-none bg-white dark:bg-slate-950 shadow-2xl overflow-hidden outline-none">
        
        {/* Main Container with Fixed Height */}
        <div className="relative w-full h-[500px] flex flex-col">
            
            {/* Header / Traffic Lights */}
            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-20 pointer-events-none">
                <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/20" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
                    <div className="w-3 h-3 rounded-full bg-green-500/20" />
                </div>
            </div>

            <AnimatePresence mode="wait">
                {!isFinished ? (
                    // --- PHASE 1: MINIMALIST SCANNER ---
                    <motion.div 
                        key="scan"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.5 }}
                        className="flex-1 flex flex-col items-center justify-center relative bg-slate-50 dark:bg-[#0B1120]"
                    >
                        {/* Central Pulsing Orb */}
                        <div className="relative mb-12">
                            <div className="absolute inset-0 bg-brand-500/20 blur-[60px] rounded-full animate-pulse" />
                            <div className="relative w-24 h-24 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-center z-10">
                                <Sparkles className="w-10 h-10 text-brand-600 dark:text-brand-500 animate-spin-slow" />
                            </div>
                            {/* Rotating Ring */}
                            <div className="absolute -inset-4 border border-brand-500/30 rounded-2xl animate-[spin_10s_linear_infinite]" />
                        </div>

                        {/* Text & Progress */}
                        <div className="w-full max-w-sm text-center px-8">
                            <motion.p 
                                key={currentStepIndex}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="text-lg font-medium text-slate-900 dark:text-white mb-6 h-8"
                            >
                                {STEPS[currentStepIndex]}
                            </motion.p>
                            
                            {/* Smooth Progress Bar */}
                            <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                <motion.div 
                                    className="h-full bg-brand-600"
                                    style={{ width: `${progress}%` }}
                                    transition={{ ease: "linear" }}
                                />
                            </div>
                            <p className="mt-4 text-xs font-mono text-slate-400 uppercase tracking-widest">
                                Scanning {displayUrl}
                            </p>
                        </div>
                    </motion.div>
                ) : (
                    // --- PHASE 2: CLEAN RESULT ---
                    <motion.div 
                        key="result"
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex-1 flex flex-col md:flex-row h-full bg-white dark:bg-slate-950"
                    >
                        
                        {/* LEFT COLUMN: THE SCORE */}
                        <div className="w-full md:w-[40%] bg-slate-50 dark:bg-[#0B1120] border-r border-slate-100 dark:border-slate-900 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02]" />
                            
                            {/* Score Ring */}
                            <div className="relative w-48 h-48 flex items-center justify-center mb-6">
                                <svg className="w-full h-full -rotate-90">
                                    <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-200 dark:text-slate-800" />
                                    <motion.circle 
                                        initial={{ strokeDasharray: 502, strokeDashoffset: 502 }}
                                        animate={{ strokeDashoffset: 502 - (502 * 0.72) }} // 72% score
                                        transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                                        cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-yellow-500" strokeLinecap="round" 
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-6xl font-bold text-slate-900 dark:text-white tracking-tighter">72</span>
                                    <span className="text-sm font-medium text-slate-500 mt-1">Score</span>
                                </div>
                            </div>

                            <div className="flex gap-2 items-center bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-3 py-1 rounded-full text-xs font-bold">
                                <AlertCircle className="w-3 h-3" /> Needs Improvement
                            </div>
                        </div>

                        {/* RIGHT COLUMN: THE HOOK (Blurred Code) */}
                        <div className="flex-1 relative flex flex-col">
                            
                            {/* Fake IDE Header */}
                            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                                    <span className="text-xs font-mono text-slate-500">layout.tsx</span>
                                </div>
                                <span className="text-[10px] text-slate-400 font-mono">Read-only</span>
                            </div>

                            {/* Blurred Content */}
                            <div className="flex-1 p-6 relative overflow-hidden bg-slate-50/50 dark:bg-[#0d1117]">
                                <div className="space-y-3 filter blur-[6px] select-none opacity-50">
                                    <div className="h-4 w-1/3 bg-slate-200 dark:bg-slate-800 rounded"/>
                                    <div className="h-4 w-2/3 bg-slate-300 dark:bg-slate-700 rounded"/>
                                    <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-800 rounded"/>
                                    <div className="h-4 w-3/4 bg-red-200 dark:bg-red-900/30 rounded border border-red-300 dark:border-red-900/50"/>
                                    <div className="h-4 w-1/4 bg-slate-200 dark:bg-slate-800 rounded"/>
                                    <div className="h-4 w-full bg-slate-300 dark:bg-slate-700 rounded"/>
                                    <div className="h-4 w-2/3 bg-yellow-200 dark:bg-yellow-900/30 rounded border border-yellow-300 dark:border-yellow-900/50"/>
                                    <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-800 rounded"/>
                                </div>

                                {/* The CTA Overlay */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-8 text-center">
                                    <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-full shadow-xl flex items-center justify-center mb-4">
                                        <Lock className="w-5 h-5 text-brand-600" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                                        Unlock 3 Critical Issues
                                    </h3>
                                    <p className="text-sm text-slate-500 mb-6 max-w-[200px] leading-relaxed">
                                        We found blocking scripts and unoptimized images.
                                    </p>
                                    <Button className="bg-brand-600 hover:bg-brand-700 text-white rounded-full px-8 shadow-xl shadow-brand-500/30 transition-transform hover:scale-105">
                                        Fix My Website <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                    </motion.div>
                )}
            </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AnalysisDemoModal;