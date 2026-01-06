"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Users, CheckCircle2, ArrowRight, Search, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "dev", label: "For Developers", icon: <Terminal className="w-4 h-4" /> },
  { id: "seo", label: "For SEO Pros", icon: <Search className="w-4 h-4" /> },
  { id: "pm", label: "For Product Managers", icon: <Users className="w-4 h-4" /> },
];

const content = {
  dev: {
    title: "Ship faster. Debug less.",
    description: "Stop wasting time on 'fix SEO tags' tickets. Integrate OmniOptimize into your CI/CD pipeline and catch regressions before they hit production.",
    features: [
      "Next.js & React SDK (2kb)",
      "Automated GitHub Comments",
      "Type-safe Analytics",
      "Zero-config Heatmaps"
    ],
    visual: (
      <div className="bg-[#0d1117] p-4 sm:p-6 rounded-xl border border-slate-800 font-mono text-[10px] sm:text-xs text-slate-300 shadow-2xl overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="flex gap-1.5 mb-4 sticky left-0">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500/50"/>
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500/50"/>
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500/50"/>
        </div>
        <div className="min-w-[250px]">
            <p><span className="text-purple-400">import</span> &#123; Omni &#125; <span className="text-purple-400">from</span> <span className="text-green-400">'@omni/sdk'</span>;</p>
            <br/>
            <p><span className="text-blue-400">export default function</span> <span className="text-yellow-300">RootLayout</span>() &#123;</p>
            <p className="pl-4">return (</p>
            <p className="pl-8">&lt;<span className="text-green-400">OmniAnalytics</span></p>
            <p className="pl-12">projectId=<span className="text-blue-400">"proj_123"</span></p>
            <p className="pl-12">autoTrack=<span className="text-blue-400">&#123;true&#125;</span></p>
            <p className="pl-8">/&gt;</p>
            <p className="pl-4">);</p>
            <p>&#125;</p>
        </div>
      </div>
    )
  },
  seo: {
    title: "Dominate Search & AI.",
    description: "Traditional SEO tools ignore AI. We optimize your content for Google AND Large Language Models like ChatGPT and Perplexity.",
    features: [
      "Agentic Content Analysis",
      "Competitor Keyword Gap",
      "Schema Markup Gen",
      "Core Web Vitals"
    ],
    visual: (
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col gap-4 text-sm">
         <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4"/> Rank Tracker
            </span>
            <span className="text-[10px] sm:text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full whitespace-nowrap">+12% this week</span>
         </div>
         <div className="space-y-3">
             <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded">
                <span className="text-xs sm:text-sm font-medium dark:text-slate-50 text-slate-800 truncate max-w-[120px] sm:max-w-none">"College Merch"</span>
                <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-slate-500">Pos:</span>
                    <span className="font-bold text-green-500">#1</span>
                </div>
             </div>
             <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded">
                <span className="text-xs sm:text-sm font-medium dark:text-slate-50 text-slate-800 truncate max-w-[120px] sm:max-w-none">"Student Mktplace"</span>
                <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-slate-500">Pos:</span>
                    <span className="font-bold text-green-500">#3</span>
                </div>
             </div>
             <div className="p-3 bg-brand-50 dark:bg-brand-900/20 border border-brand-100 dark:border-brand-800 rounded text-[11px] sm:text-xs text-brand-700 dark:text-brand-300 leading-snug">
                ✨ AI Insight: Add price schema to rank in Shopping snippets.
             </div>
         </div>
      </div>
    )
  },
  pm: {
    title: "Understand User Intent.",
    description: "Numbers don't tell the whole story. See exactly how users interact with your product through heatmaps and session replay data.",
    features: [
      "Click & Scroll Heatmaps",
      "Rage Click Detection",
      "User Journey funnels",
      "Retention Cohorts"
    ],
    visual: (
      <div className="relative bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden h-56 sm:h-64">
         <div className="absolute inset-0 bg-white dark:bg-slate-950 p-4">
             <div className="w-full h-6 sm:h-8 bg-slate-200 dark:bg-slate-800 rounded mb-4" />
             <div className="flex gap-4">
                 <div className="w-1/3 h-24 sm:h-32 bg-slate-200 dark:bg-slate-800 rounded" />
                 <div className="w-2/3 space-y-2">
                    <div className="w-full h-3 sm:h-4 bg-slate-200 dark:bg-slate-800 rounded" />
                    <div className="w-full h-3 sm:h-4 bg-slate-200 dark:bg-slate-800 rounded" />
                    <div className="w-3/4 h-3 sm:h-4 bg-slate-200 dark:bg-slate-800 rounded" />
                    <div className="w-1/2 h-6 sm:h-8 bg-blue-500 rounded mt-4" />
                 </div>
             </div>
         </div>
         {/* Heatmap Overlay */}
         <div className="absolute top-1/2 right-8 sm:right-12 w-20 h-20 sm:w-24 sm:h-24 bg-red-500/50 blur-xl rounded-full mix-blend-multiply dark:mix-blend-normal" />
         <div className="absolute bottom-4 left-8 sm:left-12 w-12 h-12 sm:w-16 sm:h-16 bg-yellow-500/50 blur-xl rounded-full mix-blend-multiply dark:mix-blend-normal" />
         
         <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-2 py-1 rounded backdrop-blur-sm">
            Live View
         </div>
      </div>
    )
  }
};

const PersonaTabs = () => {
  const [activeTab, setActiveTab] = useState("dev");

  return (
    <section className="py-16 sm:py-24 bg-slate-50 dark:bg-[#020617] border-t border-slate-200 dark:border-slate-900 overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        
        <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight">
                Built for the entire team
            </h2>
            
            {/* 
                ADDED CLASSES: [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]
                This hides the scrollbar on Chrome/Safari, IE/Edge, and Firefox respectively.
            */}
            <div className="flex justify-start sm:justify-center overflow-x-auto pb-4 sm:pb-0 -mx-4 px-4 sm:mx-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <div className="inline-flex p-1 bg-white dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm shrink-0">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap",
                                activeTab === tab.id 
                                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md ring-1 ring-black/5" 
                                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                            )}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>

        {/* CONTENT AREA */}
        <div className="max-w-6xl mx-auto">
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.98 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center"
                >
                    {/* LEFT: TEXT */}
                    <div className="space-y-6 sm:space-y-8 order-2 lg:order-1">
                        <div>
                            <h3 className="text-2xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                                {content[activeTab].title}
                            </h3>
                            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                                {content[activeTab].description}
                            </p>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4">
                            {content[activeTab].features.map((feature, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="bg-brand-100 dark:bg-brand-900/30 p-1 rounded-full shrink-0">
                                      <CheckCircle2 className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                                    </div>
                                    <span className="text-slate-700 dark:text-slate-200 font-medium text-sm sm:text-base">{feature}</span>
                                </div>
                            ))}
                        </div>

                        <Button size="lg" className="w-full sm:w-auto bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors">
                            Read Documentation <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>

                    {/* RIGHT: VISUAL */}
                    <div className="relative order-1 lg:order-2">
                        {/* Decorative Blob */}
                        <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl opacity-50 pointer-events-none" />
                        
                        <div className="relative transform transition-all duration-500">
                            {content[activeTab].visual}
                        </div>
                    </div>

                </motion.div>
            </AnimatePresence>
        </div>

      </div>
    </section>
  );
};

export default PersonaTabs;