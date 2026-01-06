"use client";
import React from "react";
import { motion } from "framer-motion";

const PricingHeader = () => {
  return (
    <section className="pt-32 pb-12 bg-white dark:bg-slate-950">
      <div className="container mx-auto px-4 text-center">
        <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6"
        >
            Simple, transparent pricing.
        </motion.h1>
        <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto"
        >
            Start for free, scale as you grow. No hidden fees. <br/>
            Cancel anytime.
        </motion.p>
      </div>
    </section>
  );
};

export default PricingHeader;