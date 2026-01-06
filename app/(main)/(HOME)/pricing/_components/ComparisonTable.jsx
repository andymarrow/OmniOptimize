"use client";
import React from "react";
import { Check, Minus } from "lucide-react";

const features = [
    { category: "SEO Optimization", items: [
        { name: "Pages Crawled", starter: "50", pro: "500", business: "Unlimited" },
        { name: "Keyword Analysis", starter: "Basic", pro: "Advanced", business: "Advanced + Competitor" },
        { name: "Schema Generation", starter: <Check className="w-4 h-4 text-brand-500"/>, pro: <Check className="w-4 h-4 text-brand-500"/>, business: <Check className="w-4 h-4 text-brand-500"/> },
        { name: "Agentic AI Simulation", starter: <Minus className="w-4 h-4 text-slate-300"/>, pro: <Check className="w-4 h-4 text-brand-500"/>, business: <Check className="w-4 h-4 text-brand-500"/> },
    ]},
    { category: "Analytics & Heatmaps", items: [
        { name: "Monthly Sessions", starter: "1,000", pro: "50,000", business: "Unlimited" },
        { name: "Heatmaps Retention", starter: "7 Days", pro: "30 Days", business: "1 Year" },
        { name: "Rage Click Detection", starter: <Minus className="w-4 h-4 text-slate-300"/>, pro: <Check className="w-4 h-4 text-brand-500"/>, business: <Check className="w-4 h-4 text-brand-500"/> },
    ]},
    { category: "Code Security", items: [
        { name: "GitHub Integration", starter: <Check className="w-4 h-4 text-brand-500"/>, pro: <Check className="w-4 h-4 text-brand-500"/>, business: <Check className="w-4 h-4 text-brand-500"/> },
        { name: "Auto-Fix PRs", starter: <Minus className="w-4 h-4 text-slate-300"/>, pro: <Check className="w-4 h-4 text-brand-500"/>, business: <Check className="w-4 h-4 text-brand-500"/> },
    ]}
];

const ComparisonTable = () => {
  return (
    <section className="py-24 bg-slate-50 dark:bg-[#020617]">
      <div className="container mx-auto px-4 max-w-5xl">
        <h2 className="text-3xl font-bold text-center mb-16 text-slate-900 dark:text-white">Feature Breakdown</h2>
        
        <div className="overflow-x-auto">
            <table className="w-full border-collapse">
                <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800">
                        <th className="py-4 px-6 text-left text-sm font-medium text-slate-500">Features</th>
                        <th className="py-4 px-6 text-center text-sm font-bold text-slate-900 dark:text-white">Starter</th>
                        <th className="py-4 px-6 text-center text-sm font-bold text-brand-600 dark:text-brand-400">Pro</th>
                        <th className="py-4 px-6 text-center text-sm font-bold text-slate-900 dark:text-white">Business</th>
                    </tr>
                </thead>
                <tbody>
                    {features.map((section, i) => (
                        <React.Fragment key={i}>
                            <tr className="bg-slate-100/50 dark:bg-slate-900/50">
                                <td colSpan={4} className="py-3 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">
                                    {section.category}
                                </td>
                            </tr>
                            {section.items.map((row, j) => (
                                <tr key={j} className="border-b border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-900 transition-colors">
                                    {/* Name Column */}
                                    <td className="py-4 px-6 text-sm text-slate-700 dark:text-slate-300">
                                        {row.name}
                                    </td>
                                    
                                    {/* Starter Column */}
                                    <td className="py-4 px-6">
                                        <div className="flex items-center justify-center text-sm text-slate-600 dark:text-slate-400">
                                            {row.starter}
                                        </div>
                                    </td>

                                    {/* Pro Column */}
                                    <td className="py-4 px-6">
                                        <div className="flex items-center justify-center text-sm font-medium text-slate-900 dark:text-white">
                                            {row.pro}
                                        </div>
                                    </td>

                                    {/* Business Column */}
                                    <td className="py-4 px-6">
                                        <div className="flex items-center justify-center text-sm text-slate-600 dark:text-slate-400">
                                            {row.business}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </React.Fragment>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </section>
  );
};

export default ComparisonTable;