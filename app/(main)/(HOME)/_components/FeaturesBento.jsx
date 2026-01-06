"use client";
import React from "react";
import { motion } from "framer-motion";
import { Search, MousePointer2, ShieldCheck, Zap, Bot, ArrowUpRight } from "lucide-react";
import Image from "next/image";

const FeaturesBento = () => {
  return (
    <section id="features" className="py-24 bg-slate-50 dark:bg-[#020617] relative overflow-hidden">
      
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-700 to-transparent" />
      
      <div className="container mx-auto px-4 md:px-6">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Three powerful tools. <br/>
            <span className="text-slate-400 dark:text-slate-500">One dashboard.</span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Stop switching between Google Analytics, SEMRush, and SonarQube. 
            OmniOptimize unifies your entire web stack health.
          </p>
        </div>

        {/* BENTO GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto h-auto md:h-[600px]">
          
          {/* CARD 1: AGENTIC SEO (Takes up 2 columns) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-2 relative group overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl transition-all duration-500"
          >
            <div className="p-8 md:p-10 relative z-20 h-full flex flex-col">
                <div className="w-12 h-12 bg-brand-100 dark:bg-brand-900/30 rounded-2xl flex items-center justify-center mb-6 text-brand-600 dark:text-brand-400">
                    <Bot className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Agentic SEO</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-8">
                    We don't just check meta tags. We deploy AI agents to browse your site and tell you exactly how LLMs (like ChatGPT) perceive your content.
                </p>
                
                {/* Visual Representation */}
                <div className="flex-1 w-full bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 p-4 relative overflow-hidden group-hover:border-brand-500/30 transition-colors">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-xs font-mono text-slate-400">AI_AGENT_CRAWL_V2.LOG</span>
                    </div>
                    <div className="space-y-3">
                         <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0"><Bot size={16} className="text-blue-500"/></div>
                            <div className="bg-white dark:bg-slate-900 p-3 rounded-tr-xl rounded-b-xl border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 shadow-sm">
                                Scanning your pricing page... structure is confusing for AI.
                            </div>
                         </div>
                         <div className="flex gap-3 flex-row-reverse">
                             <div className="bg-brand-50 dark:bg-brand-900/20 p-3 rounded-tl-xl rounded-b-xl border border-brand-100 dark:border-brand-800/50 text-xs text-brand-700 dark:text-brand-300">
                                Fixing schema markup automatically.
                             </div>
                         </div>
                    </div>
                </div>
            </div>
            
            {/* Hover Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          </motion.div>


          {/* RIGHT COLUMN STACK */}
          <div className="md:col-span-1 flex flex-col gap-6">
            
            {/* CARD 2: HEATMAPS */}
            <motion.div 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="flex-1 relative group overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl transition-all duration-500 p-8"
            >
                <div className="absolute top-0 right-0 p-8 opacity-50 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRight className="w-5 h-5 text-slate-400" />
                </div>
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center mb-4 text-orange-600 dark:text-orange-400">
                    <MousePointer2 className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">4K Heatmaps</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                    See exactly where users rage-click.
                </p>
                
                {/* Mini Heatmap Visual */}
                <div className="absolute bottom-0 right-0 w-32 h-24 bg-slate-100 dark:bg-slate-800 rounded-tl-2xl border-t border-l border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="absolute top-1/2 left-1/2 w-20 h-20 bg-red-500/40 blur-xl rounded-full" />
                    <div className="absolute top-4 left-4 w-10 h-10 bg-yellow-500/40 blur-lg rounded-full" />
                </div>
            </motion.div>

            {/* CARD 3: CODE SECURITY */}
            <motion.div 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="flex-1 relative group overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl transition-all duration-500 p-8"
            >
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-4 text-purple-600 dark:text-purple-400">
                    <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Code Watchdog</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Catch insecure commits before deploy.
                </p>

                {/* Code Visual */}
                <div className="mt-4 bg-slate-950 rounded-lg p-3 font-mono text-[10px] text-slate-300 border border-slate-800 opacity-80 group-hover:opacity-100 transition-opacity">
                    <p className="text-green-400">+ git push origin main</p>
                    <p className="text-yellow-400">⚠ Warning: API Key found</p>
                    <p className="text-slate-500">Scanning completed...</p>
                </div>
            </motion.div>

          </div>

        </div>
      </div>
    </section>
  );
};

export default FeaturesBento;