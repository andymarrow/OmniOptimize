"use client";
import React from "react";
import { motion } from "framer-motion";
import { Terminal, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const DocsHero = () => {
  const [copied, setCopied] = React.useState(false);

  const copyCommand = () => {
    navigator.clipboard.writeText("npm install @omni/sdk");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="pt-32 pb-20 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
      <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

        {/* Left: Text */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-mono font-bold mb-6">
            v0.2.0 Released
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight">
            Build with <span className="text-brand-600 dark:text-brand-500 font-mono">intelligence</span>.
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-xl leading-relaxed">
            Integrate SEO analysis, heatmaps, and code security checks directly into your CI/CD pipeline or application runtime with a few lines of code.
          </p>
          <div className="flex gap-4">
            <Button size="lg" className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100">
              Read the Guide
            </Button>
            <Button variant="outline" size="lg" className="border-slate-300 dark:border-slate-700 dark:text-white text-slate-800">
              View on GitHub
            </Button>
          </div>
        </motion.div>

        {/* Right: Terminal Visual */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="relative"
        >
          {/* Glow Effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-brand-500 to-blue-500 rounded-lg blur opacity-20" />

          <div className="relative bg-[#0d1117] rounded-lg border border-slate-800 shadow-2xl overflow-hidden">
            {/* Terminal Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/50">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
              </div>
              <div className="text-[10px] font-mono text-slate-500">bash — 80x24</div>
            </div>

            {/* Terminal Body */}
            <div className="p-6 font-mono text-sm">
              <div className="flex items-center gap-2 text-slate-300 mb-4">
                <span className="text-green-400">➜</span>
                <span className="text-blue-400">~</span>
                <span>npm i @omni-analytics/sdk</span>
              </div>
              <div className="text-slate-500 mb-2">
                added 4 packages, and audited 124 packages in 2s
              </div>
              <div className="text-green-400 mb-4">
                12 packages are looking for funding
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <span className="text-green-400">➜</span>
                <span className="text-blue-400">~</span>
                <span className="animate-pulse">_</span>
              </div>
            </div>

            {/* Copy Button Overlay */}
            <div className="absolute top-14 right-4">
              <button
                onClick={copyCommand}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default DocsHero;
