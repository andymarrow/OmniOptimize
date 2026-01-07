import React from "react";
import DocsHero from "./_components/DocsHero";
import FrameworkSelect from "./_components/FrameworkSelect";
import ResourcesGrid from "./_components/ResourcesGrid";
import SolutionsCTA from "../solutions/_components/SolutionsCTA"; // Reuse CTA again
import ApiPlayground from "./_components/ApiPlayground";

export const metadata = {
  title: "Developers | OmniOptimize",
  description: "API Reference, SDKs, and Documentation for developers.",
};

export default function DocsPage() {
  return (
    <main className="flex-1">
      <DocsHero />
      <FrameworkSelect />
      <ApiPlayground />
      <ResourcesGrid />
      <div className="py-12 bg-slate-50 dark:bg-[#020617] border-t border-slate-200 dark:border-slate-900 text-center">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Need help?</h3>
        <p className="text-slate-500 mb-6">Join our discord community of 4,000+ developers.</p>
        <a href="#" className="text-brand-600 font-bold hover:underline">Join Community →</a>
      </div>
      <SolutionsCTA />
    </main>
  );
}