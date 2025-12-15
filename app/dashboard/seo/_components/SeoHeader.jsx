"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RefreshCcw, ExternalLink, Globe, Loader2, History } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";

const SeoHeader = ({ 
  url, 
  setUrl, 
  isScanning, 
  onScan, 
  scanHistory, 
  onSelectHistory 
}) => {
  
  const handleViewSite = () => {
    if (!url) return;
    const safeUrl = url.startsWith("http") ? url : `https://${url}`;
    window.open(safeUrl, "_blank");
  };

  return (
    <div className="flex flex-col gap-6 mb-8 border-b border-slate-200 dark:border-slate-800 pb-6">
      
      {/* Top Row: Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              SEO Performance
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Analyze Core Web Vitals & Performance using Google PageSpeed.
          </p>
        </div>
      </div>

      {/* Bottom Row: URL Input & Actions */}
      <div className="flex flex-col md:flex-row gap-3">
        
        <div className="relative flex-1 flex gap-2">
            {/* History Dropdown */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="shrink-0 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800">
                        <History className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[300px] bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                    {scanHistory?.length > 0 ? (
                        scanHistory.map((scan) => (
                            <DropdownMenuItem 
                                key={scan._id} 
                                onClick={() => onSelectHistory(scan)}
                                className="flex flex-col items-start gap-1 cursor-pointer focus:bg-slate-100 dark:focus:bg-slate-900"
                            >
                                <span className="font-medium truncate w-full text-slate-900 dark:text-white">{scan.url}</span>
                                <span className="text-xs text-slate-500">
                                    Last update: {scan.mobile?.updatedAt ? formatDistanceToNow(scan.mobile.updatedAt) + " ago" : "Unknown"}
                                </span>
                            </DropdownMenuItem>
                        ))
                    ) : (
                        <div className="p-2 text-xs text-slate-500 text-center">No history yet</div>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Input */}
            <div className="relative flex-1">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                    placeholder="https://your-website.com" 
                    className="pl-9 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    disabled={isScanning}
                />
            </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
            <Button 
                variant="outline" 
                className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                onClick={handleViewSite}
                disabled={!url || isScanning}
            >
                <ExternalLink className="mr-2 w-4 h-4" /> Live Site
            </Button>
            
            <Button 
                className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 min-w-[140px]"
                onClick={onScan}
                disabled={!url || isScanning}
            >
                {isScanning ? (
                    <><Loader2 className="mr-2 w-4 h-4 animate-spin" /> Scanning...</>
                ) : (
                    <><RefreshCcw className="mr-2 w-4 h-4" /> Analyze</>
                )}
            </Button>
        </div>
      </div>

    </div>
  );
};

export default SeoHeader;