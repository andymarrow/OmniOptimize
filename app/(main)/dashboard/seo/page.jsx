"use client";
import React, { useState, useEffect } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useProject } from "@/app/_context/ProjectContext"; 
import SeoHeader from "./_components/SeoHeader";
import AgentView from "./_components/AgentView";
import MlView from "./_components/MlView";
import LighthouseWrapper from "./_components/lighthouse/LighthouseWrapper"; 
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import HistoryView from "./_components/lighthouse/HistoryView";

export default function SeoPage() {
  const { activeProject } = useProject();
  
  // 1. State
  const [url, setUrl] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [activeScanId, setActiveScanId] = useState(null);

  // 2. Convex Hooks
  const performScan = useAction(api.seo.performScan);
  
  // Fetch scan history (Sorted Newest -> Oldest by backend)
  const scanHistory = useQuery(api.seo.getScannedUrls, 
    activeProject ? { projectId: activeProject._id } : "skip"
  );

  // Fetch the active scan details
  const scanResult = useQuery(api.seo.getScanResult, 
    activeScanId ? { scanId: activeScanId } : "skip"
  );

  // 3. EFFECT: Handle Project Change & Auto-Load Latest Data
  useEffect(() => {
    if (!activeProject) return;

    // A. Always sync the input box to the project URL initially
    // Only set if URL is empty to allow user to type other URLs
    if (url === "") {
        setUrl(activeProject.url);
    }

    // B. Auto-select the latest scan when history loads or project switches
    if (scanHistory && scanHistory.length > 0) {
        // Only override if we don't have an ID, OR if the current ID doesn't belong to this project history
        // (This fixes the issue when switching projects)
        const currentScanInHistory = scanHistory.find(s => s._id === activeScanId);
        
        if (!activeScanId || !currentScanInHistory) {
            const latestScan = scanHistory[0]; // First item is newest
            setActiveScanId(latestScan._id);
            setUrl(latestScan.url); // Update input to match the loaded scan
        }
    } else if (scanHistory && scanHistory.length === 0) {
        // If new project has no history, clear the view
        setActiveScanId(null);
        setUrl(activeProject.url);
    }
  }, [activeProject, scanHistory, activeScanId, url]);


  // 4. Handle Scan Action
  const handleScan = async () => {
    if(!url || !activeProject) return;
    
    setIsScanning(true);
    setStatusMessage("Initializing Mobile Scan...");

    try {
        // Run Mobile
        const scanId = await performScan({
            projectId: activeProject._id,
            url: url,
            strategy: "mobile"
        });
        
        // Update UI immediately to show we are working on THIS scan
        setActiveScanId(scanId); 
        
        await new Promise(r => setTimeout(r, 2000)); // Rate limit buffer

        // Run Desktop
        setStatusMessage("Analyzing Desktop Performance...");
        await performScan({
            projectId: activeProject._id,
            url: url,
            strategy: "desktop"
        });

        setStatusMessage("Finalizing Report...");
    } catch (err) {
        console.error("Scan error:", err);
    } finally {
        setIsScanning(false);
        setStatusMessage("");
    }
  };

  return (
    <div className="space-y-6">
      
      <SeoHeader 
        url={url} 
        setUrl={setUrl} 
        isScanning={isScanning} 
        onScan={handleScan}
        scanHistory={scanHistory}
        onSelectHistory={(scan) => {
            setUrl(scan.url);
            setActiveScanId(scan._id);
        }}
      />

      {isScanning && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-4 border border-slate-200 dark:border-slate-800">
                <Loader2 className="w-12 h-12 text-brand-600 animate-spin" />
                <div className="text-center">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">Scanning...</h3>
                    <p className="text-sm text-slate-500">{statusMessage}</p>
                </div>
            </div>
        </div>
      )}

      <Tabs defaultValue="lighthouse" className="w-full">
        <TabsList className="grid w-full max-w-[600px] grid-cols-4 mb-8 bg-slate-100 dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-800">
          <TabsTrigger value="lighthouse">Lighthouse</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="agent">AI Agent</TabsTrigger>
          <TabsTrigger value="ml">Omni ML</TabsTrigger>
        </TabsList>
        
        <TabsContent value="lighthouse" className="animate-in fade-in-50 duration-500">
             {activeScanId ? (
                 scanResult ? (
                    <LighthouseWrapper 
                        data={scanResult} 
                        mobileScreen={scanResult.mobileScreen}
                        desktopScreen={scanResult.desktopScreen}
                    /> 
                 ) : (
                    <div className="h-64 flex items-center justify-center">
                        <Loader2 className="animate-spin text-slate-300 mr-2" />
                        <span className="text-slate-400">Loading Report...</span>
                    </div>
                 )
             ) : (
                 <div className="h-64 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                    <p>No scans found for {activeProject?.name}.</p>
                    <p className="text-xs mt-2">Click "Analyze" to run your first audit.</p>
                 </div>
             )}
        </TabsContent>
        
        {/* --- NEW HISTORY CONTENT --- */}
        <TabsContent value="history" className="animate-in fade-in-50 duration-500">
             <HistoryView history={scanHistory} />
        </TabsContent>

        <TabsContent value="ml" className="animate-in fade-in-50 duration-500">
          <MlView />
      </TabsContent>

        <TabsContent value="agent" className="animate-in fade-in-50 duration-500">
             <AgentView />
        </TabsContent>
      </Tabs>
    </div>
  );
}