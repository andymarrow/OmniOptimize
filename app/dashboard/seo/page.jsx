"use client";
import React, { useState } from "react";
import SeoHeader from "./_components/SeoHeader";
import AgentView from "./_components/AgentView";
import LighthouseWrapper from "./_components/lighthouse/LighthouseWrapper"; 
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SeoPage() {
  // State for the URL Input
  const [url, setUrl] = useState("https://wego.com.et");
  const [isScanning, setIsScanning] = useState(false);
  const [lastScan, setLastScan] = useState("Today, 10:42 AM");

  // Mock function to simulate a Google PageSpeed API call
  const handleScan = () => {
    if(!url) return;
    
    setIsScanning(true);
    
    // Simulate network delay
    setTimeout(() => {
        setIsScanning(false);
        setLastScan("Just now");
        // In the real backend integration, this is where we would 
        // fetch the new data from Convex and update the LighthouseWrapper props
    }, 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header controls the URL and Scan State */}
      <SeoHeader 
        url={url} 
        setUrl={setUrl} 
        isScanning={isScanning} 
        onScan={handleScan}
        lastScan={lastScan}
      />

      {/* Main Content */}
      <Tabs defaultValue="lighthouse" className="w-full">
        <TabsList className="grid w-full max-w-[400px] grid-cols-2 mb-8 bg-slate-100 dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-800">
          <TabsTrigger value="lighthouse">Lighthouse View</TabsTrigger>
          <TabsTrigger value="agent">Agent View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="lighthouse" className="animate-in fade-in-50 duration-500">
          {/* We pass isScanning here so we could potentially show a skeleton state inside */}
          {isScanning ? (
             <div className="h-[600px] flex items-center justify-center bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                 <div className="text-center space-y-4">
                    <div className="w-16 h-16 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-slate-500 animate-pulse">Analyzing Core Web Vitals...</p>
                 </div>
             </div>
          ) : (
             <LighthouseWrapper /> 
          )}
        </TabsContent>
        
        <TabsContent value="agent" className="animate-in fade-in-50 duration-500">
            {isScanning ? (
             <div className="h-[400px] flex items-center justify-center bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                 <div className="text-center space-y-4">
                    <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-slate-500 animate-pulse">Agent is reading your HTML...</p>
                 </div>
             </div>
          ) : (
             <AgentView />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}