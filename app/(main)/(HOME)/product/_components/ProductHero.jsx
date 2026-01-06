"use client";
import React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge"; // Ensure you have this or standard div

const ProductHero = () => {
  return (
    <section className="pt-32 pb-20 bg-white dark:bg-slate-950 overflow-hidden">
      <div className="container mx-auto px-4 text-center">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-6"
        >
          <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-mono uppercase tracking-widest border border-slate-200 dark:border-slate-700">
            The Platform
          </span>
        </motion.div>

        <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 dark:text-white tracking-tight mb-8 leading-[1.1]">
                {["One", "Unified", "Intelligence", "Layer."].map((word, i) => (
                    <motion.span
                        key={i}
                        initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        transition={{ delay: i * 0.15, duration: 0.8, ease: "easeOut" }}
                        className="inline-block mr-3 md:mr-5 last:mr-0"
                    >
                        {word}
                    </motion.span>
                ))}
            </h1>
        </div>

        <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed"
        >
            OmniOptimize isn't just a checker. It's an active participant in your engineering workflow, bridging the gap between code, content, and user experience.
        </motion.p>

      </div>
    </section>
  );
};

export default ProductHero;