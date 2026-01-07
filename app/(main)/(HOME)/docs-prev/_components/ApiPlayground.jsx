"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, RotateCcw, Clock, Server, CheckCircle2, ChevronRight, Activity, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ENDPOINTS = [
  {
    method: "POST",
    path: "/v1/analyze",
    desc: "Scan a URL for SEO & Performance",
    body: {
      url: "https://wego.com.et",
      options: { mobile: true, ai_check: true }
    },
    response: {
      status: "success",
      score: 94,
      metrics: { lcp: "0.8s", cls: 0.02 },
      ai_readability: "high"
    }
  },
  {
    method: "GET",
    path: "/v1/heatmaps/events",
    desc: "Retrieve raw click events",
    body: null, // GET requests usually don't have bodies in this context
    response: {
      count: 1420,
      events: [
        { x: 450, y: 120, type: "click", el: "button#signup" },
        { x: 452, y: 121, type: "click", el: "button#signup" }
      ]
    }
  },
  {
    method: "POST",
    path: "/v1/security/scan",
    desc: "Check code snippet for vulnerabilities",
    body: {
      code_snippet: "const key = process.env.API_KEY;",
      language: "javascript"
    },
    response: {
      safe: true,
      vulnerabilities: [],
      audit_id: "scan_8x92"
    }
  }
];

const ApiPlayground = () => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [latency, setLatency] = useState(null);
  const [status, setStatus] = useState(null);

  const activeEndpoint = ENDPOINTS[activeIdx];

  const handleSend = () => {
    setLoading(true);
    setResponse(null);
    setStatus(null);
    setLatency(null);

    // Simulate Network Request
    const fakeDuration = Math.floor(Math.random() * 400) + 150; // 150-550ms

    setTimeout(() => {
      setLoading(false);
      setResponse(activeEndpoint.response);
      setLatency(fakeDuration);
      setStatus(200);
    }, fakeDuration);
  };

  // Helper for Syntax Highlighting
  const highlightJSON = (json) => {
    if (!json) return "";
    const str = JSON.stringify(json, null, 2);
    return str.split('\n').map((line, i) => (
      <div key={i} className="table-row">
        <span className="table-cell select-none text-slate-700 dark:text-slate-800 text-right pr-4 text-[10px] w-8">{i + 1}</span>
        <span className="table-cell" dangerouslySetInnerHTML={{
          __html: line
            .replace(/"(.*?)"(?=:)/g, '<span class="text-blue-600 dark:text-blue-400">"$1"</span>') // Keys
            .replace(/: "(.*?)"/g, ': <span class="text-green-600 dark:text-green-400">"$1"</span>') // String Values
            .replace(/: (\d+)/g, ': <span class="text-orange-600 dark:text-orange-400">$1</span>') // Number Values
            .replace(/: (true|false)/g, ': <span class="text-purple-600 dark:text-purple-400">$1</span>') // Booleans
            .replace(/null/g, '<span class="text-slate-500">null</span>')
        }} />
      </div>
    ));
  };

  return (
    <section className="py-24 bg-slate-50 dark:bg-[#020617] border-t border-slate-200 dark:border-slate-900">
      <div className="container mx-auto px-4 max-w-6xl">
        
        <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-4">
            <div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Interactive API</h2>
                <p className="text-slate-600 dark:text-slate-400">Test our endpoints directly from your browser.</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded-full uppercase tracking-wider">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                System Operational
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: Controls */}
            <div className="lg:col-span-4 space-y-6">
                
                {/* Endpoint Selector */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                    <div className="px-4 py-3 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Available Endpoints
                    </div>
                    <div>
                        {ENDPOINTS.map((ep, i) => (
                            <button
                                key={i}
                                onClick={() => { setActiveIdx(i); setResponse(null); setStatus(null); }}
                                className={cn(
                                    "w-full text-left px-4 py-3 text-sm border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-between group",
                                    activeIdx === i ? "bg-blue-50/50 dark:bg-blue-900/10" : ""
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <span className={cn(
                                        "font-mono text-[10px] px-1.5 py-0.5 rounded font-bold",
                                        ep.method === 'POST' ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                    )}>
                                        {ep.method}
                                    </span>
                                    <span className={cn("font-medium", activeIdx === i ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400")}>
                                        {ep.path}
                                    </span>
                                </div>
                                {activeIdx === i && <ChevronRight className="w-4 h-4 text-brand-500" />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Description Card */}
                <div className="p-4 bg-slate-100 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400">
                    <span className="font-bold text-slate-900 dark:text-white block mb-1">Description:</span>
                    {activeEndpoint.desc}
                </div>

            </div>

            {/* RIGHT COLUMN: The Playground */}
            <div className="lg:col-span-8">
                
                {/* REQUEST WINDOW */}
                <div className="bg-[#0d1117] rounded-xl border border-slate-800 shadow-2xl overflow-hidden mb-6">
                    {/* Toolbar */}
                    <div className="flex items-center justify-between px-4 py-3 bg-[#161b22] border-b border-slate-800">
                        <div className="flex items-center gap-2">
                             <span className="text-slate-400 text-xs font-mono">Request Body</span>
                             <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400">JSON</span>
                        </div>
                        <Button 
                            size="sm" 
                            onClick={handleSend}
                            disabled={loading}
                            className={cn(
                                "h-8 px-4 text-xs font-bold transition-all",
                                loading ? "bg-slate-700 text-slate-400" : "bg-brand-600 hover:bg-brand-500 text-white"
                            )}
                        >
                            {loading ? (
                                <span className="flex items-center gap-2"><Activity className="w-3 h-3 animate-spin" /> Sending...</span>
                            ) : (
                                <span className="flex items-center gap-2"><Play className="w-3 h-3 fill-current" /> Send Request</span>
                            )}
                        </Button>
                    </div>

                    {/* Editor Area */}
                    <div className="p-4 font-mono text-sm overflow-x-auto min-h-[160px]">
                        <code>
                            {highlightJSON(activeEndpoint.body || { note: "No body required" })}
                        </code>
                    </div>
                </div>

                {/* RESPONSE WINDOW */}
                <div className="relative">
                    {/* Status Bar (Absolute) */}
                    <AnimatePresence>
                        {(status || loading) && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="absolute -top-3 right-4 flex gap-3 z-10"
                            >
                                {loading && (
                                    <span className="px-3 py-1 bg-slate-800 text-slate-300 text-xs font-mono rounded-full border border-slate-700 flex items-center gap-2 shadow-lg">
                                        <Clock className="w-3 h-3 animate-spin" /> Pending...
                                    </span>
                                )}
                                {status === 200 && (
                                    <>
                                        <span className="px-3 py-1 bg-green-500/10 text-green-500 text-xs font-mono font-bold rounded-full border border-green-500/20 flex items-center gap-2 shadow-lg backdrop-blur-md">
                                            <CheckCircle2 className="w-3 h-3" /> 200 OK
                                        </span>
                                        <span className="px-3 py-1 bg-slate-800 text-slate-300 text-xs font-mono rounded-full border border-slate-700 flex items-center gap-2 shadow-lg backdrop-blur-md">
                                            <Server className="w-3 h-3" /> {latency}ms
                                        </span>
                                    </>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Output Area */}
                    <div className="bg-[#0d1117] rounded-xl border border-slate-800 shadow-2xl overflow-hidden min-h-[200px] relative">
                         <div className="flex items-center justify-between px-4 py-3 bg-[#161b22] border-b border-slate-800">
                             <span className="text-slate-400 text-xs font-mono">Response Output</span>
                             {response && (
                                 <button 
                                    onClick={() => { setResponse(null); setStatus(null); }}
                                    className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-white transition-colors"
                                >
                                    <RotateCcw className="w-3 h-3" />
                                </button>
                             )}
                        </div>

                        <div className="p-4 font-mono text-sm overflow-x-auto">
                            {!response && !loading && (
                                <div className="h-[140px] flex flex-col items-center justify-center text-slate-600">
                                    <Terminal className="w-8 h-8 mb-2 opacity-50" />
                                    <p className="text-xs">Ready to test. Click "Send Request".</p>
                                </div>
                            )}
                            
                            {loading && (
                                <div className="h-[140px] flex items-center justify-center space-x-1">
                                    <div className="w-2 h-2 bg-brand-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="w-2 h-2 bg-brand-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="w-2 h-2 bg-brand-500 rounded-full animate-bounce"></div>
                                </div>
                            )}

                            {response && (
                                <motion.code
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    {highlightJSON(response)}
                                </motion.code>
                            )}
                        </div>
                    </div>
                </div>

            </div>

        </div>
      </div>
    </section>
  );
};

export default ApiPlayground;