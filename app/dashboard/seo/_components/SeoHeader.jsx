"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RefreshCcw, ExternalLink, Globe, Loader2 } from "lucide-react";

const SeoHeader = ({ url, setUrl, isScanning, onScan, lastScan }) => {
  
  const handleViewSite = () => {
    if (!url) return;
    // Add https if missing for browser safety
    const safeUrl = url.startsWith("http") ? url : `https://${url}`;
    window.open(safeUrl, "_blank");
  };

  return (
    <div className="flex flex-col gap-6 mb-8 border-b border-slate-200 dark:border-slate-800 pb-6">
      
      {/* Top Row: Title & Last Scan Status */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              SEO Performance
          </h2>
          <div className="flex items-center gap-2 mt-1">
              <div className={`w-2 h-2 rounded-full ${isScanning ? "bg-yellow-500 animate-bounce" : "bg-green-500 animate-pulse"}`} />
              <p className="text-sm text-slate-500 dark:text-slate-400">
                  {isScanning ? "Scanning in progress..." : (
                    <>Last scan: <span className="font-mono">{lastScan}</span></>
                  )}
              </p>
          </div>
        </div>
      </div>

      {/* Bottom Row: URL Input & Actions */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
                placeholder="https://your-website.com" 
                className="pl-9 bg-white dark:bg-slate-900"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isScanning}
            />
        </div>

        <div className="flex items-center gap-2 shrink-0">
            <Button 
                variant="outline" 
                className="border-slate-200 dark:border-slate-800"
                onClick={handleViewSite}
                disabled={!url || isScanning}
            >
                View Live Site <ExternalLink className="ml-2 w-4 h-4" />
            </Button>
            
            <Button 
                className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 min-w-[140px]"
                onClick={onScan}
                disabled={!url || isScanning}
            >
                {isScanning ? (
                    <><Loader2 className="mr-2 w-4 h-4 animate-spin" /> Scanning...</>
                ) : (
                    <><RefreshCcw className="mr-2 w-4 h-4" /> Run New Audit</>
                )}
            </Button>
        </div>
      </div>

    </div>
  );
};

export default SeoHeader;