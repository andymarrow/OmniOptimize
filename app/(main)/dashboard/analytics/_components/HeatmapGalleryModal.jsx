"use client";
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MousePointer2, Smartphone, Monitor, Eye, Search, 
  Menu, X, ChevronDown, Check 
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// --- MOCK DATA ---
const PAGES = [
  { 
    id: 1, 
    name: "Landing Page", 
    path: "/", 
    clicks: 12450, 
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop",
    hotspots: [
        { x: 50, y: 40, intensity: "high", label: "Main CTA" },
        { x: 80, y: 10, intensity: "medium", label: "Nav Links" },
        { x: 20, y: 80, intensity: "low", label: "Footer Links" },
    ]
  },
  { 
    id: 2, 
    name: "Pricing Page", 
    path: "/pricing", 
    clicks: 5320, 
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2426&auto=format&fit=crop",
    hotspots: [
        { x: 30, y: 50, intensity: "high", label: "Pro Plan" },
        { x: 70, y: 50, intensity: "medium", label: "Enterprise" },
    ]
  },
  { 
    id: 3, 
    name: "Checkout", 
    path: "/checkout", 
    clicks: 2100, 
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?q=80&w=2426&auto=format&fit=crop",
    hotspots: [
        { x: 50, y: 70, intensity: "critical", label: "Pay Button" },
        { x: 50, y: 30, intensity: "medium", label: "Form Fields" },
    ]
  },
  { 
    id: 4, 
    name: "Blog", 
    path: "/blog", 
    clicks: 890, 
    image: "https://images.unsplash.com/photo-1499750310159-529801977349?q=80&w=2426&auto=format&fit=crop",
    hotspots: [
        { x: 20, y: 20, intensity: "medium", label: "Featured Post" },
    ]
  }
];

const HeatmapGalleryModal = ({ isOpen, onClose }) => {
  const [selectedPage, setSelectedPage] = useState(PAGES[0]);
  const [device, setDevice] = useState("desktop");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[100vw] w-full h-[100dvh] md:h-[90vh] md:max-w-[95vw] md:w-[1400px] p-0 overflow-hidden bg-slate-50 dark:bg-[#020617] border-0 md:border md:border-slate-200 dark:md:border-slate-800 flex flex-col md:rounded-xl">
        
        {/* HEADER */}
        <div className="px-4 py-3 md:px-6 md:py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shrink-0 z-20">
            
            <div className="flex flex-col md:flex-row md:items-center gap-4 w-full md:w-auto">
                {/* Title Area */}
                <div className="flex items-center justify-between w-full md:w-auto gap-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg shrink-0">
                            <MousePointer2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">Heatmaps</DialogTitle>
                            <p className="text-xs text-slate-500 hidden md:block">User click visualization</p>
                        </div>
                    </div>
                    {/* Mobile Close Button (Top Right) */}
                    <button onClick={onClose} className="md:hidden p-2 text-slate-500">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* MOBILE ONLY: Page Selector Dropdown */}
                <div className="md:hidden w-full">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full justify-between">
                                <span className="truncate">{selectedPage.name}</span>
                                <ChevronDown className="w-4 h-4 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-[calc(100vw-32px)]">
                            {PAGES.map((page) => (
                                <DropdownMenuItem key={page.id} onSelect={() => setSelectedPage(page)}>
                                    <span className="flex-1">{page.name}</span>
                                    {selectedPage.id === page.id && <Check className="w-4 h-4" />}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Desktop Controls */}
            <div className="flex items-center justify-between w-full md:w-auto gap-4">
                <Tabs defaultValue="desktop" onValueChange={setDevice} className="w-full md:w-auto">
                    <TabsList className="grid w-full md:w-[180px] grid-cols-2">
                        <TabsTrigger value="desktop"><Monitor className="w-4 h-4 mr-2"/> <span className="hidden sm:inline">Desk</span></TabsTrigger>
                        <TabsTrigger value="mobile"><Smartphone className="w-4 h-4 mr-2"/> <span className="hidden sm:inline">Mob</span></TabsTrigger>
                    </TabsList>
                </Tabs>
                <Button variant="outline" className="hidden md:flex text-slate-900 dark:text-white">Export</Button>
            </div>
        </div>

        {/* MAIN BODY */}
        <div className="flex-1 flex overflow-hidden relative">
            
            {/* DESKTOP SIDEBAR: PAGE LIST (Hidden on Mobile) */}
            <div className="hidden md:flex w-80 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex-col shrink-0">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                        <Input placeholder="Search pages..." className="pl-9 bg-slate-50 dark:bg-slate-900" />
                    </div>
                </div>
                <ScrollArea className="flex-1">
                    <div className="p-3 space-y-2">
                        {PAGES.map((page) => (
                            <button
                                key={page.id}
                                onClick={() => setSelectedPage(page)}
                                className={`w-full text-left p-3 rounded-xl transition-all border ${
                                    selectedPage.id === page.id 
                                    ? "bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-700 shadow-sm" 
                                    : "border-transparent hover:bg-slate-50 dark:hover:bg-slate-900/50"
                                }`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`font-semibold text-sm ${selectedPage.id === page.id ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400"}`}>
                                        {page.name}
                                    </span>
                                    <Badge variant="secondary" className="text-[10px] h-5">
                                        {page.path}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-slate-500">
                                    <span className="flex items-center gap-1"><MousePointer2 className="w-3 h-3" /> {page.clicks.toLocaleString()}</span>
                                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> 45%</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </ScrollArea>
            </div>

            {/* MAIN AREA: THE HEATMAP VISUALIZER */}
            <div className="flex-1 bg-slate-100 dark:bg-[#0B1120] relative flex items-center justify-center p-2 md:p-8 overflow-auto md:overflow-hidden">
                
                {/* 
                    Responsive Container Logic:
                    - Mobile Device Mode: Fixed width/height, scaled down on small screens
                    - Desktop Mode: Full width/height, responsive
                */}
                <div 
                    className={`
                        relative bg-white dark:bg-slate-900 shadow-2xl transition-all duration-500 ease-in-out border border-slate-200 dark:border-slate-800 overflow-hidden
                        ${device === 'mobile' 
                            ? 'w-[320px] h-[600px] sm:w-[375px] sm:h-[750px] rounded-[2rem] border-[6px] border-slate-800' 
                            : 'w-full h-full max-w-5xl rounded-lg md:rounded-xl shadow-none md:shadow-2xl'
                        }
                    `}
                >
                    {/* Website Screenshot Background */}
                    <div 
                        className="absolute inset-0 bg-cover bg-top opacity-50 grayscale transition-opacity duration-500"
                        style={{ backgroundImage: `url(${selectedPage.image})` }}
                    />

                    {/* Heatmap Overlay Layer */}
                    <div className="absolute inset-0">
                        {selectedPage.hotspots.map((spot, i) => (
                            <div 
                                key={i}
                                className="absolute group cursor-pointer"
                                style={{ 
                                    left: `${spot.x}%`, 
                                    top: `${spot.y}%`,
                                    transform: 'translate(-50%, -50%)'
                                }}
                            >
                                {/* The Glow Blob */}
                                <div 
                                    className={`rounded-full blur-xl md:blur-2xl opacity-70 animate-pulse ${
                                        spot.intensity === 'critical' ? 'w-24 h-24 md:w-32 md:h-32 bg-red-600' : 
                                        spot.intensity === 'high' ? 'w-16 h-16 md:w-24 md:h-24 bg-red-500' : 
                                        spot.intensity === 'medium' ? 'w-12 h-12 md:w-20 md:h-20 bg-yellow-500' : 
                                        'w-10 h-10 md:w-16 md:h-16 bg-blue-500'
                                    }`} 
                                />
                                
                                {/* Hover Tooltip (Positioned carefully) */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                                    <div className="bg-slate-900 text-white text-[10px] md:text-xs px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl flex items-center gap-2 border border-slate-700">
                                        <span className="font-bold">{spot.label}</span>
                                        <span className="text-slate-400">|</span>
                                        <span>32%</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Overlay Info (Bottom) - Responsive Text */}
                    <div className="absolute bottom-4 left-4 right-4 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md p-3 md:p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 shadow-lg">
                        <div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-xs md:text-sm">{selectedPage.name}</h4>
                            <p className="text-[10px] md:text-xs text-slate-500">{selectedPage.clicks.toLocaleString()} clicks recorded</p>
                        </div>
                        <div className="flex gap-2 text-[10px] md:text-xs font-bold w-full sm:w-auto justify-between sm:justify-start">
                            <span className="flex items-center gap-1 text-blue-500"><div className="w-2 h-2 bg-blue-500 rounded-full"/> Low</span>
                            <span className="flex items-center gap-1 text-yellow-500"><div className="w-2 h-2 bg-yellow-500 rounded-full"/> Med</span>
                            <span className="flex items-center gap-1 text-red-500"><div className="w-2 h-2 bg-red-500 rounded-full"/> High</span>
                        </div>
                    </div>

                </div>

            </div>
        </div>

      </DialogContent>
    </Dialog>
  );
};

export default HeatmapGalleryModal;