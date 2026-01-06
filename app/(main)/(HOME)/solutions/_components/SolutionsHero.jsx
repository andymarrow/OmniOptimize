"use client";
import React from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";

const SolutionsHero = () => {
  
  // 1. Define the scroll function
  const scrollToContent = () => {
    const element = document.getElementById("use-cases");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
      
      {/* Background Pattern */}
      <div className="absolute inset-0 w-full h-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] opacity-50 pointer-events-none" />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-50 dark:to-slate-950 pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10 text-center">
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-600 dark:text-brand-400 text-xs font-bold tracking-widest uppercase mb-6"
        >
          <Sparkles className="w-3 h-3" />
          Unified Optimization
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 dark:text-white mb-6 max-w-4xl mx-auto"
        >
          Stop stitching together <br />
          <span className="text-slate-400 dark:text-slate-600 line-through decoration-red-500/50 decoration-2">fragmented tools</span>.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          OmniOptimize replaces your tangle of SEO plugins, analytics scripts, and code linters with a single, intelligent intelligence layer.
        </motion.p>

        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
        >
            {/* 2. Add the onClick handler here */}
            <Button 
                onClick={scrollToContent}
                variant="outline" 
                className="rounded-full border-slate-300 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white"
            >
                Explore Use Cases <ArrowDown className="w-4 h-4 ml-2" />
            </Button>
        </motion.div>

      </div>
    </section>
  );
};

export default SolutionsHero;