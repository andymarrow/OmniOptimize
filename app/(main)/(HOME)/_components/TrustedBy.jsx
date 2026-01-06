"use client";
import React from "react";
import { motion } from "framer-motion";

const companies = [
  "Vercel", "Stripe", "Linear", "Supabase", "Raycast", "Acme Corp", "Next.js", "Convex"
];

const TrustedBy = () => {
  return (
    <section className="py-10 border-y border-slate-100 dark:border-slate-900 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm font-medium text-slate-500 mb-8">
          Trusted by forward-thinking engineering teams
        </p>
        
        <div className="relative flex overflow-hidden group">
            {/* Gradient Masks for Fade Effect */}
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white dark:from-slate-950 to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white dark:from-slate-950 to-transparent z-10" />

            {/* Infinite Scroll Wrapper */}
            <motion.div 
                className="flex gap-16 items-center whitespace-nowrap"
                animate={{ x: ["0%", "-50%"] }}
                transition={{ repeat: Infinity, ease: "linear", duration: 20 }}
            >
                {/* We double the list to make the loop seamless */}
                {[...companies, ...companies].map((company, i) => (
                    <span 
                        key={i} 
                        className="text-xl font-bold text-slate-300 dark:text-slate-700 uppercase tracking-widest font-mono select-none"
                    >
                        {company}
                    </span>
                ))}
            </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TrustedBy;