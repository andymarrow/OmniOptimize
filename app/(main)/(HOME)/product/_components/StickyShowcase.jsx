"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Terminal, Search, MousePointer2, Code2, Zap, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

const sections = [
  {
    id: "seo",
    title: "Agentic SEO",
    desc: "We don't just scan for tags. We deploy autonomous AI agents that browse your site like a human (and like Googlebot) to find deep semantic issues.",
    icon: <Globe className="w-6 h-6 text-blue-500" />,
    visual: "bg-gradient-to-br from-blue-500/20 to-cyan-500/20",
    content: (
        <div className="w-full h-full flex flex-col p-6">
            <div className="flex items-center gap-3 mb-6 bg-white dark:bg-slate-900 p-3 rounded-lg w-fit shadow-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"/>
                <span className="text-xs font-mono text-slate-600 dark:text-slate-300">Agent Status: Crawling /pricing...</span>
            </div>
            <div className="space-y-3">
                <div className="h-2 w-3/4 bg-slate-300/50 dark:bg-slate-700/50 rounded"/>
                <div className="h-2 w-1/2 bg-slate-300/50 dark:bg-slate-700/50 rounded"/>
                <div className="h-32 w-full bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-4 mt-4 shadow-sm">
                    <div className="flex justify-between mb-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">Structured Data</span>
                        <span className="text-xs text-red-500 font-mono">Missing Price</span>
                    </div>
                    <div className="font-mono text-[10px] text-slate-400">
                        &lt;script type="application/ld+json"&gt;
                        <br/>
                        &nbsp;&nbsp;{`{ "@context": "https://schema.org", ... }`}
                    </div>
                </div>
            </div>
        </div>
    )
  },
  {
    id: "analytics",
    title: "4K Heatmaps",
    desc: "Forget vague bounce rates. See exactly where users are rage-clicking, scrolling, and dropping off with pixel-perfect accuracy.",
    icon: <MousePointer2 className="w-6 h-6 text-orange-500" />,
    visual: "bg-gradient-to-br from-orange-500/20 to-red-500/20",
    content: (
        <div className="w-full h-full relative overflow-hidden">
            {/* Fake UI Background */}
            <div className="absolute inset-0 p-6 opacity-30 blur-[1px]">
                <div className="w-full h-8 bg-slate-400 dark:bg-slate-600 rounded mb-4"/>
                <div className="flex gap-4">
                    <div className="w-1/3 h-40 bg-slate-300 dark:bg-slate-700 rounded"/>
                    <div className="w-2/3 h-40 bg-slate-300 dark:bg-slate-700 rounded"/>
                </div>
            </div>
            {/* Heatmap Overlay */}
            <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-red-500/60 blur-[40px] rounded-full mix-blend-multiply dark:mix-blend-screen"/>
            <div className="absolute bottom-1/3 right-1/4 w-24 h-24 bg-yellow-500/60 blur-[30px] rounded-full mix-blend-multiply dark:mix-blend-screen"/>
            
            <div className="absolute bottom-6 left-6 bg-slate-900/90 text-white px-3 py-1.5 rounded-full text-xs font-mono backdrop-blur-md border border-slate-700">
                Hotspot Detected: Checkout Button
            </div>
        </div>
    )
  },
  {
    id: "code",
    title: "Code Governance",
    desc: "The only tool that links frontend performance directly to the specific commit that caused the regression.",
    icon: <Code2 className="w-6 h-6 text-purple-500" />,
    visual: "bg-gradient-to-br from-purple-500/20 to-indigo-500/20",
    content: (
        <div className="w-full h-full bg-[#0d1117] p-6 font-mono text-xs text-slate-300 flex flex-col">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-2">
                <Terminal className="w-4 h-4 text-slate-500"/>
                <span>audit.log</span>
            </div>
            <div className="space-y-2">
                <p><span className="text-green-400">➜</span> git commit -m "update pricing"</p>
                <p className="text-slate-500">running pre-commit hooks...</p>
                <div className="p-2 bg-red-500/10 border border-red-500/20 rounded my-2">
                    <p className="text-red-400 font-bold">❌ Error: Large Layout Shift</p>
                    <p className="text-slate-400 mt-1">Image at line 42 missing width/height attributes.</p>
                </div>
                <p><span className="text-blue-400">?</span> Auto-fix applied.</p>
            </div>
        </div>
    )
  }
];

const StickyShowcase = () => {
  const [activeSection, setActiveSection] = useState(0);
  const containerRef = useRef(null);
  
  // Logic to detect which section is in view
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const sectionElements = containerRef.current.querySelectorAll(".scroll-section");
      
      sectionElements.forEach((el, index) => {
        const rect = el.getBoundingClientRect();
        // If element is roughly in the middle of viewport
        if (rect.top >= 0 && rect.top <= window.innerHeight / 2) {
          setActiveSection(index);
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div ref={containerRef} className="bg-slate-50 dark:bg-slate-950 relative">
      <div className="container mx-auto px-4 lg:flex gap-12">
        
        {/* LEFT: SCROLLABLE TEXT */}
        <div className="lg:w-1/2 py-20 pb-40">
          {sections.map((section, index) => (
            <div 
                key={section.id} 
                className="scroll-section min-h-[80vh] flex flex-col justify-center mb-20 last:mb-0"
            >
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: false, amount: 0.5 }}
                >
                    <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-colors duration-500",
                        activeSection === index ? "bg-white dark:bg-slate-800 shadow-xl" : "bg-transparent"
                    )}>
                        {section.icon}
                    </div>
                    <h2 className={cn(
                        "text-3xl md:text-4xl font-bold mb-6 transition-colors duration-500",
                        activeSection === index ? "text-slate-900 dark:text-white" : "text-slate-300 dark:text-slate-700"
                    )}>
                        {section.title}
                    </h2>
                    <p className={cn(
                        "text-lg leading-relaxed transition-colors duration-500 max-w-md",
                        activeSection === index ? "text-slate-600 dark:text-slate-400" : "text-slate-300 dark:text-slate-700"
                    )}>
                        {section.desc}
                    </p>
                </motion.div>
            </div>
          ))}
        </div>

        {/* RIGHT: STICKY VISUAL */}
        <div className="hidden lg:flex lg:w-1/2 h-screen sticky top-0 items-center justify-center py-20">
            <div className="relative w-full aspect-square max-w-[500px]">
                {sections.map((section, index) => (
                    <motion.div
                        key={section.id}
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ 
                            opacity: activeSection === index ? 1 : 0,
                            scale: activeSection === index ? 1 : 0.95,
                            y: activeSection === index ? 0 : 20,
                            zIndex: activeSection === index ? 10 : 0
                        }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        className={cn(
                            "absolute inset-0 rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800",
                            section.visual
                        )}
                    >
                        {/* Glassmorphism Container */}
                        <div className="absolute inset-0 backdrop-blur-3xl bg-white/40 dark:bg-slate-900/40" />
                        
                        {/* Actual Content */}
                        <div className="relative z-10 w-full h-full">
                            {section.content}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>

      </div>
    </div>
  );
};

export default StickyShowcase;