"use client";
import React from "react";
import { motion } from "framer-motion";
import { Zap, Shield, Smartphone, Bell, GitBranch, Database } from "lucide-react";

const features = [
  { title: "Lighthouse CI", desc: "Performance scores on every PR.", icon: <Zap className="w-5 h-5 text-yellow-500"/> },
  { title: "GDPR Compliant", desc: "No PII storage by default.", icon: <Shield className="w-5 h-5 text-green-500"/> },
  { title: "Mobile Emulation", desc: "Test on iPhone, Pixel & Tablets.", icon: <Smartphone className="w-5 h-5 text-blue-500"/> },
  { title: "Real-time Alerts", desc: "Slack & Email notifications.", icon: <Bell className="w-5 h-5 text-red-500"/> },
  { title: "Git Blame Integration", desc: "See who broke the build.", icon: <GitBranch className="w-5 h-5 text-purple-500"/> },
  { title: "Data Retention", desc: "Up to 1 year history storage.", icon: <Database className="w-5 h-5 text-orange-500"/> },
];

const FeatureGrid = () => {
  return (
    <section className="py-24 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-900">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Everything else you need</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((item, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:border-brand-500/50 dark:hover:border-brand-500/50 transition-colors group cursor-default"
                >
                    <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        {item.icon}
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white mb-2">{item.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{item.desc}</p>
                </motion.div>
            ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureGrid;