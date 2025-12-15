"use client";
import React, { useState, useEffect } from "react";
import { Smartphone, Monitor, AlertTriangle, Info, Image as ImageIcon } from "lucide-react";
import { Accordion } from "@/components/ui/accordion";

import { MetricCard } from "./MetricCard";
import { AuditItem } from "./AuditItem"; 
import { Filmstrip } from "./Filmstrip"; 
import { ScoreGauge } from "./ScoreGuage";

const LighthouseWrapper = ({ data }) => {
  const [device, setDevice] = useState("mobile");
  const [filmstripData, setFilmstripData] = useState([]);
  
  const currentData = device === 'mobile' ? data?.mobile : data?.desktop;
  
  // Fetch Filmstrip Data when URL changes
  useEffect(() => {
    if (currentData?.filmstripUrl) {
        fetch(currentData.filmstripUrl)
            .then(res => res.json())
            .then(data => setFilmstripData(data))
            .catch(err => console.error("Failed to load filmstrip", err));
    } else {
        setFilmstripData([]);
    }
  }, [currentData?.filmstripUrl]);

  if (!currentData || !currentData.metrics) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Info className="w-10 h-10 mb-4 opacity-50" />
            <p>No data available for {device}. Run a scan to see results.</p>
        </div>
    );
  }

  const { performanceScore, scores, metrics, audits, screenshotUrl } = currentData;

  // Separate audits into groups
  const opportunities = audits.filter(a => a.group === 'opportunity');
  const diagnostics = audits.filter(a => a.group === 'diagnostic');

  const uiMetrics = [
      { label: "First Contentful Paint", value: metrics.fcp, score: getScore(metrics.fcp), desc: "Marks the time at which the first text or image is painted." },
      { label: "Largest Contentful Paint", value: metrics.lcp, score: getScore(metrics.lcp), desc: "Marks the time at which the largest text or image is painted." },
      { label: "Total Blocking Time", value: metrics.tbt, score: getScore(metrics.tbt), desc: "Sum of all time periods between FCP and Time to Interactive." },
      { label: "Cumulative Layout Shift", value: metrics.cls, score: getScore(metrics.cls, true), desc: "Measures the movement of visible elements within the viewport." },
      { label: "Speed Index", value: metrics.si, score: getScore(metrics.si), desc: "How quickly the contents of a page are visibly populated." },
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-20">
      
      {/* 1. CONTROLS */}
      <div className="flex justify-center sticky top-0 z-20 py-4 bg-slate-50/80 dark:bg-[#020617]/80 backdrop-blur-md">
        <div className="inline-flex bg-slate-200 dark:bg-slate-800 p-1 rounded-lg">
            <button 
                onClick={() => setDevice("mobile")}
                className={`flex items-center gap-2 px-6 py-2 rounded-md text-sm font-medium transition-all ${device === 'mobile' ? 'bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'}`}
            >
                <Smartphone className="w-4 h-4" /> Mobile
            </button>
            <button 
                onClick={() => setDevice("desktop")}
                className={`flex items-center gap-2 px-6 py-2 rounded-md text-sm font-medium transition-all ${device === 'desktop' ? 'bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'}`}
            >
                <Monitor className="w-4 h-4" /> Desktop
            </button>
        </div>
      </div>

      {/* 2. THE 4 BIG SCORES */}
      <div className="flex flex-wrap justify-center gap-8 md:gap-16 pb-8 border-b border-slate-200 dark:border-slate-800">
        <ScoreGauge score={performanceScore || 0} label="Performance" />
        <ScoreGauge score={scores?.accessibility || 0} label="Accessibility" />
        <ScoreGauge score={scores?.bestPractices || 0} label="Best Practices" />
        <ScoreGauge score={scores?.seo || 0} label="SEO" />
      </div>

      {/* 3. METRICS GRID & SCREENSHOT */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-px bg-slate-200 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            {uiMetrics.map((m, i) => (
                <div key={i} className="bg-white dark:bg-slate-900">
                    <MetricCard label={m.label} value={m.value} score={m.score} description={m.desc} />
                </div>
            ))}
        </div>
        
        {/* Screenshot */}
        <div className="bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col items-center justify-center gap-4">
            {screenshotUrl ? (
                <img 
                    src={screenshotUrl} 
                    alt="Site Screenshot" 
                    className={`rounded shadow-lg border border-slate-200 dark:border-slate-700 ${device === 'mobile' ? 'max-h-[300px]' : 'w-full'}`} 
                />
            ) : (
                <div className="text-center text-slate-400">
                    <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <span className="text-xs">No Screenshot</span>
                </div>
            )}
            <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">{device} Preview</span>
        </div>
      </section>

      {/* 4. FILMSTRIP */}
      {filmstripData.length > 0 && (
        <section className="mt-8">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4 px-2">Visual Loading Progress</h4>
            <Filmstrip items={filmstripData} device={device} />
        </section>
      )}

      {/* 5. OPPORTUNITIES & DIAGNOSTICS (ACCORDION) */}
      <section className="space-y-8">
        
        {/* Opportunities */}
        {opportunities.length > 0 && (
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-6 bg-red-500 rounded-full" />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Opportunities</h3>
                    <span className="text-sm text-slate-500">Suggestions to help your page load faster.</span>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                    <Accordion type="single" collapsible className="w-full">
                        {opportunities.map((opp, i) => (
                            <AuditItem key={i} audit={opp} />
                        ))}
                    </Accordion>
                </div>
            </div>
        )}

        {/* Diagnostics */}
        {diagnostics.length > 0 && (
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-6 bg-yellow-500 rounded-full" />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Diagnostics</h3>
                    <span className="text-sm text-slate-500">More information about the performance of your application.</span>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                    <Accordion type="single" collapsible className="w-full">
                        {diagnostics.map((diag, i) => (
                            <AuditItem key={i} audit={diag} />
                        ))}
                    </Accordion>
                </div>
            </div>
        )}

      </section>

    </div>
  );
};

// Helper to determine score color based on PSI logic
function getScore(val, isCls = false) {
    if(!val) return "average";
    // Strip non-numeric chars (e.g., "0.8 s" -> 0.8)
    const num = parseFloat(val.replace(/[^\d.-]/g, ''));
    if(isNaN(num)) return "average";

    if(isCls) return num <= 0.1 ? "good" : num <= 0.25 ? "average" : "poor";
    // Rough estimate for paint times (LCP/FCP)
    return num <= 2.5 ? "good" : num <= 4.0 ? "average" : "poor";
}

export default LighthouseWrapper;