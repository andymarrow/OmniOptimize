"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Code2, Box, Globe, Server } from "lucide-react";

const frameworks = [
  { id: "next", label: "Next.js", icon: <Globe className="w-4 h-4"/> },
  { id: "react", label: "React", icon: <Code2 className="w-4 h-4"/> },
  { id: "node", label: "Node.js", icon: <Server className="w-4 h-4"/> },
];

const snippets = {
  next: `// app/layout.tsx
import { OmniProvider } from '@omni/sdk/next';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <OmniProvider apiKey={process.env.OMNI_KEY}>
          {children}
        </OmniProvider>
      </body>
    </html>
  );
}`,
  react: `// src/App.jsx
import { OmniAnalytics } from '@omni/sdk/react';

function App() {
  return (
    <div className="App">
      <OmniAnalytics projectId="proj_123" />
      <YourContent />
    </div>
  );
}`,
  node: `// server.js
const { OmniClient } = require('@omni/sdk/node');

const client = new OmniClient({
  secretKey: process.env.OMNI_SECRET
});

// Log a server-side event
client.track('api_call', { endpoint: '/users' });`
};

const FrameworkSelect = () => {
  const [active, setActive] = useState("next");

  return (
    <section className="py-24 bg-slate-50 dark:bg-[#020617]">
      <div className="container mx-auto px-4 max-w-5xl">
        
        <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Initialize in seconds</h2>
            <p className="text-slate-600 dark:text-slate-400">Native SDKs for your favorite frameworks.</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[400px]">
            
            {/* Sidebar Tabs */}
            <div className="w-full md:w-64 bg-slate-50 dark:bg-slate-950/50 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 p-2 md:p-4 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible">
                {frameworks.map((fw) => (
                    <button
                        key={fw.id}
                        onClick={() => setActive(fw.id)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                            active === fw.id 
                            ? "bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700" 
                            : "text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900"
                        }`}
                    >
                        {fw.icon}
                        {fw.label}
                    </button>
                ))}
            </div>

            {/* Code Area */}
            <div className="flex-1 bg-[#0d1117] p-6 md:p-8 relative overflow-hidden group">
                <div className="absolute top-4 right-4 px-2 py-1 bg-slate-800 rounded text-[10px] text-slate-400 font-mono">
                    TypeScript
                </div>
                
                <AnimatePresence mode="wait">
                    <motion.pre
                        key={active}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="font-mono text-sm text-slate-300 leading-relaxed overflow-x-auto"
                    >
                        <code>
                            {snippets[active].split('\n').map((line, i) => (
                                <div key={i} className="table-row">
                                    <span className="table-cell text-slate-700 select-none text-right pr-4">{i + 1}</span>
                                    <span className="table-cell">
                                        {/* Simple syntax highlighting simulation */}
                                        {line
                                            .replace(/import|from|export|default|function|return|const|new/g, match => `<span class="text-purple-400">${match}</span>`)
                                            .replace(/'[^']*'|"[^"]*"/g, match => `<span class="text-green-400">${match}</span>`)
                                            .replace(/OmniProvider|OmniAnalytics|OmniClient/g, match => `<span class="text-yellow-300">${match}</span>`)
                                            .split(/(\<span.*?\>.*?<\/span\>)/g)
                                            .map((part, idx) => 
                                                part.startsWith('<span') 
                                                    ? <span key={idx} dangerouslySetInnerHTML={{ __html: part }} />
                                                    : part
                                            )
                                        }
                                    </span>
                                </div>
                            ))}
                        </code>
                    </motion.pre>
                </AnimatePresence>
            </div>

        </div>

      </div>
    </section>
  );
};

export default FrameworkSelect;