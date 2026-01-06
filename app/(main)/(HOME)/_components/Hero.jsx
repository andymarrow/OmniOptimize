"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Search, CheckCircle2, Terminal, LayoutDashboard, Globe, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import AnalysisDemoModal from "./AnalysisDemoModal";

const Hero = () => {
  const [url, setUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto-rotate cards every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleAnalyze = (e) => {
    e.preventDefault();
    
    // VALIDATION FIX:
    // If empty, return. If user typed "wego.com", we accept it.
    if (!url || url.trim() === "") return;
    
    // Optional: Auto-prepend https:// for visual cleanliness in the modal later
    let cleanUrl = url;
    if (!url.startsWith("http")) {
        cleanUrl = `https://${url}`;
    }

    setIsAnalyzing(true);
    
    setTimeout(() => {
      setIsAnalyzing(false);
      setShowModal(true);
    }, 800);
  };

  // --- CARD DATA ---
  const cards = [
    {
      id: "dashboard",
      title: "Real-time Analytics",
      icon: <LayoutDashboard className="w-4 h-4 text-blue-400" />,
      content: (
        <div className="relative w-full h-full bg-slate-50 dark:bg-slate-900 flex flex-col">
            <div className="h-8 border-b border-slate-200 dark:border-slate-800 flex items-center px-4 gap-2 bg-white dark:bg-slate-950">
                <div className="flex gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-400" /><div className="w-2.5 h-2.5 rounded-full bg-yellow-400" /><div className="w-2.5 h-2.5 rounded-full bg-green-400" /></div>
            </div>
            <div className="flex-1 relative">
                <Image src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop" alt="Dashboard" fill className="object-cover opacity-90" />
                <div className="absolute inset-0 bg-blue-500/10 mix-blend-multiply" />
            </div>
        </div>
      )
    },
    {
      id: "seo",
      title: "SEO Intelligence",
      icon: <Globe className="w-4 h-4 text-green-400" />,
      content: (
        <div className="relative w-full h-full bg-slate-900 flex flex-col">
             <div className="h-8 border-b border-slate-700 flex items-center px-4 gap-2 bg-slate-950">
                <div className="w-20 h-2 bg-slate-800 rounded-full" />
            </div>
            <div className="flex-1 relative">
                <Image src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop" alt="SEO" fill className="object-cover opacity-80" />
                <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 backdrop-blur-md p-3 rounded-lg border border-slate-700">
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-400">Health Score</span>
                        <span className="text-lg font-bold text-green-400">98/100</span>
                    </div>
                    <div className="w-full h-1 bg-slate-800 rounded-full mt-2"><div className="w-[98%] h-full bg-green-500 rounded-full" /></div>
                </div>
            </div>
        </div>
      )
    },
    {
      id: "code",
      title: "Code Security",
      icon: <Terminal className="w-4 h-4 text-purple-400" />,
      content: (
        <div className="relative w-full h-full bg-[#0d1117] flex flex-col p-4 font-mono text-[10px] text-slate-300">
             <div className="flex items-center gap-2 mb-4 text-slate-500 border-b border-slate-800 pb-2">
                <Shield className="w-3 h-3" /> security.config.ts
             </div>
             <p><span className="text-pink-400">export const</span> config = &#123;</p>
             <p className="pl-4">mode: <span className="text-yellow-300">'strict'</span>,</p>
             <p className="pl-4">ai_scan: <span className="text-blue-400">true</span>,</p>
             <p className="pl-4">auto_fix: <span className="text-blue-400">true</span></p>
             <p>&#125;;</p>
             <div className="mt-4 p-2 bg-red-500/10 border border-red-500/20 rounded text-red-300 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                1 Vulnerability Found
             </div>
        </div>
      )
    }
  ];

  const getPosition = (index) => {
    if (index === activeIndex) return "center";
    if (index === (activeIndex + 1) % 3) return "right";
    return "left";
  };

  const variants = {
    center: { x: 0, scale: 1, zIndex: 30, rotate: 0, opacity: 1, filter: "blur(0px)" },
    left: { x: -160, scale: 0.85, zIndex: 10, rotate: -6, opacity: 0.6, filter: "blur(2px)" },
    right: { x: 160, scale: 0.85, zIndex: 10, rotate: 6, opacity: 0.6, filter: "blur(2px)" }
  };

  return (
    <section className="relative pt-32 pb-40 md:pt-48 md:pb-64 overflow-hidden bg-background">
      
      <div className="absolute inset-0 w-full h-full bg-grid-light dark:bg-grid-dark pointer-events-none -z-20 [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_70%)]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] md:w-[1000px] h-[600px] bg-brand-500/10 blur-[100px] rounded-full pointer-events-none -z-10" />

      <div className="container mx-auto px-4 md:px-6 flex flex-col items-center text-center relative z-10">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md text-slate-600 dark:text-slate-300 text-sm font-medium mb-8 shadow-sm"
        >
          <span className="flex h-2 w-2 rounded-full bg-brand-500 animate-pulse"></span>
          <span>OmniOptimize v1.0 Public Beta</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 dark:text-white mb-6 max-w-5xl"
        >
          Your Website, <br className="hidden md:block" />
          <span className="relative">
            <span className="relative z-10">Perfected by </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-emerald-400">
               Intelligence
            </span>
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mb-10 leading-relaxed"
        >
          Deep technical SEO, real-time user heatmaps, and automated code reviews. 
          The complete toolkit for modern engineering teams.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full max-w-xl relative mb-24 z-30"
        >
          <form
            onSubmit={handleAnalyze}
            className="group flex items-center p-1.5 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none focus-within:ring-2 focus-within:ring-brand-500/20 transition-all"
          >
            <div className="pl-3 pr-2 text-slate-400 group-focus-within:text-brand-500 transition-colors">
              <Search className="w-5 h-5" />
            </div>
            
            {/* FIXED: Changed type="url" to type="text" to prevent strict browser blocking */}
            <Input
              type="text" 
              placeholder="e.g. wego.com.et"
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent h-12 text-base text-slate-900 dark:text-white placeholder:text-slate-400"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            
            <Button
              size="lg"
              className="bg-brand-600 hover:bg-brand-700 text-white font-medium px-6 h-11 rounded-lg transition-all shadow-md hover:shadow-lg"
              disabled={isAnalyzing}
            >
              {isAnalyzing ? "Processing..." : (
                <span className="flex items-center gap-1">Analyze <ArrowRight className="w-4 h-4" /></span>
              )}
            </Button>
          </form>
          
          <div className="mt-6 flex items-center justify-center gap-6 text-sm text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5 hover:text-brand-500 transition-colors cursor-default">
              <CheckCircle2 className="w-4 h-4" /> No credit card required
            </span>
            <span className="flex items-center gap-1.5 hover:text-brand-500 transition-colors cursor-default">
              <Terminal className="w-4 h-4" /> Open Source SDK
            </span>
          </div>
        </motion.div>

        {/* CAROUSEL */}
        <div className="relative w-full max-w-5xl h-[350px] md:h-[450px] flex justify-center items-center perspective-1000">
            {cards.map((card, index) => {
                const position = getPosition(index);
                return (
                    <motion.div
                        key={card.id}
                        initial={false}
                        animate={variants[position]}
                        transition={{ duration: 0.6, ease: "easeInOut" }}
                        className="absolute w-[280px] md:w-[600px] aspect-[16/10] bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden cursor-pointer"
                        onClick={() => setActiveIndex(index)}
                    >
                        {card.content}
                        <motion.div 
                            animate={{ opacity: position === 'center' ? 1 : 0 }}
                            className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-950/80 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-xs font-medium border border-slate-800 flex items-center gap-2"
                        >
                            {card.icon} {card.title}
                        </motion.div>
                    </motion.div>
                );
            })}
        </div>

        <div className="flex justify-center gap-2 mt-8">
            {cards.map((_, idx) => (
                <button 
                    key={idx}
                    onClick={() => setActiveIndex(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${idx === activeIndex ? 'w-8 bg-brand-500' : 'w-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'}`}
                />
            ))}
        </div>
      </div>

      <AnalysisDemoModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        url={url} 
      />
    </section>
  );
};

export default Hero;