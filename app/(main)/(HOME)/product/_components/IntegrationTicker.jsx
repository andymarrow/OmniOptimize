"use client";
import React from "react";
import { motion } from "framer-motion";

const tools = ["Next.js", "React", "Vercel", "Netlify", "GitHub", "Slack", "Linear", "WordPress", "Shopify"];

const IntegrationTicker = () => {
  return (
    <section className="py-12 bg-slate-50 dark:bg-slate-950 border-y border-slate-200 dark:border-slate-900 overflow-hidden">
        <div className="container mx-auto px-4 text-center mb-8">
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">Works seamlessly with</p>
        </div>
        <div className="relative flex overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-slate-50 dark:from-slate-950 to-transparent z-10"/>
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-slate-50 dark:from-slate-950 to-transparent z-10"/>
            
            <motion.div 
                className="flex gap-16 items-center whitespace-nowrap"
                animate={{ x: ["0%", "-50%"] }}
                transition={{ repeat: Infinity, ease: "linear", duration: 30 }}
            >
                {[...tools, ...tools, ...tools].map((tool, i) => (
                    <span key={i} className="text-xl font-bold text-slate-300 dark:text-slate-700">{tool}</span>
                ))}
            </motion.div>
        </div>
    </section>
  );
};

export default IntegrationTicker;