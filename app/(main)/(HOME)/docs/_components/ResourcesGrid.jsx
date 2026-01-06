"use client";
import React from "react";
import { Book, Code, Webhook, Fingerprint, CloudLightning, ShieldAlert } from "lucide-react";
import Link from "next/link";

const resources = [
  { title: "Getting Started", desc: "Installation & Setup", icon: <Book className="w-5 h-5 text-blue-500" /> },
  { title: "API Reference", desc: "REST & GraphQL Endpoints", icon: <CloudLightning className="w-5 h-5 text-yellow-500" /> },
  { title: "Webhooks", desc: "Real-time event listeners", icon: <Webhook className="w-5 h-5 text-purple-500" /> },
  { title: "React SDK", desc: "Component Library", icon: <Code className="w-5 h-5 text-cyan-500" /> },
  { title: "Authentication", desc: "API Keys & OAuth", icon: <Fingerprint className="w-5 h-5 text-green-500" /> },
  { title: "Security", desc: "Compliance & GDPR", icon: <ShieldAlert className="w-5 h-5 text-red-500" /> },
];

const ResourcesGrid = () => {
  return (
    <section className="py-24 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-900">
      <div className="container mx-auto px-4 max-w-6xl">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Documentation</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((res, i) => (
                <Link key={i} href="#" className="group block p-6 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-brand-500 dark:hover:border-brand-500 transition-colors">
                    <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        {res.icon}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 group-hover:text-brand-600 dark:group-hover:text-brand-400">
                        {res.title}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {res.desc}
                    </p>
                </Link>
            ))}
        </div>
      </div>
    </section>
  );
};

export default ResourcesGrid;