"use client";
import React from "react";
import Link from "next/link";
import { 
  Sparkles, 
  Github, 
  Twitter, 
  Linkedin, 
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-800 relative overflow-hidden transition-colors duration-300">
      
      {/* Background Grid Pattern (Swaps based on theme) */}
      <div className="absolute inset-0 w-full h-full bg-grid-light dark:bg-grid-dark pointer-events-none -z-0 [mask-image:linear-gradient(to_bottom,transparent,black)]" />

      {/* 1. PRE-FOOTER (The CTA) */}
      <div className="px-4 md:px-8 relative z-10">
        <div className="max-w-7xl mx-auto py-20 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-10">
            
            <div className="max-w-2xl text-center md:text-left">
                <span className="text-brand-600 dark:text-brand-400 font-mono text-xs font-bold tracking-widest uppercase mb-4 block">
                    Get Started
                </span>
                <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight">
                    Stop guessing. <br/>
                    Start <span className="text-brand-600 dark:text-brand-500">optimizing</span>.
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-lg max-w-lg mx-auto md:mx-0">
                    Join 10,000+ developers and SEO experts building faster, smarter websites with OmniOptimize.
                </p>
            </div>

            <div className="flex flex-col gap-4 w-full md:w-auto items-center md:items-start">
                 <Link href="/register" className="w-full md:w-auto">
                    <Button className="w-full md:w-auto bg-brand-600 hover:bg-brand-700 text-white h-14 px-8 text-lg rounded-full shadow-xl shadow-brand-500/20 transition-all transform hover:scale-105">
                        Start Free Audit <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                 </Link>
                 <p className="text-slate-500 dark:text-slate-500 text-xs text-center">
                    No credit card required • 14-day free trial
                 </p>
            </div>

        </div>
      </div>

      {/* 2. MAIN LINKS SECTION */}
      <div className="px-4 md:px-8 py-16 relative z-10">
        <div className="max-w-7xl mx-auto">
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12">
                
                {/* Brand Column (Takes 2 columns on LG screens) */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <div className="flex items-center gap-2">
                         <div className="bg-brand-500/10 border border-brand-500/20 text-brand-600 dark:text-brand-500 p-2 rounded-lg">
                            <Sparkles size={24} fill="currentColor" />
                        </div>
                        <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
                            Omni<span className="text-brand-600 dark:text-brand-500">Optimize</span>
                        </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed max-w-xs">
                        The all-in-one platform for technical SEO, user behavior analytics, and code health monitoring. Built for modern engineering teams.
                    </p>
                    <div className="flex gap-4 mt-2">
                        <SocialLink icon={<Twitter size={18} />} href="#" />
                        <SocialLink icon={<Github size={18} />} href="#" />
                        <SocialLink icon={<Linkedin size={18} />} href="#" />
                    </div>
                </div>

                {/* Links Columns */}
                <div>
                    <h4 className="font-bold mb-6 text-slate-900 dark:text-white">Product</h4>
                    <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
                        <FooterLink href="#">SEO Intelligence</FooterLink>
                        <FooterLink href="#">Heatmaps</FooterLink>
                        <FooterLink href="#">Code Analysis</FooterLink>
                        <FooterLink href="#">Integrations</FooterLink>
                        <FooterLink href="#">Pricing</FooterLink>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold mb-6 text-slate-900 dark:text-white">Resources</h4>
                    <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
                        <FooterLink href="#">Documentation</FooterLink>
                        <FooterLink href="#">API Reference</FooterLink>
                        <FooterLink href="#">Blog</FooterLink>
                        <FooterLink href="#">Community</FooterLink>
                        <FooterLink href="#">Help Center</FooterLink>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold mb-6 text-slate-900 dark:text-white">Company</h4>
                    <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
                        <FooterLink href="#">About</FooterLink>
                        <FooterLink href="#">Careers</FooterLink>
                        <FooterLink href="#">Legal</FooterLink>
                        <FooterLink href="#">Privacy Policy</FooterLink>
                        <FooterLink href="#">Contact</FooterLink>
                    </ul>
                </div>

            </div>

            {/* 3. BOTTOM BAR */}
            <div className="mt-20 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
                <p className="text-slate-500 text-sm">
                    © {currentYear} OmniOptimize Inc. All rights reserved.
                </p>
                
                {/* Status Indicator - Adapts to theme */}
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </div>
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">All Systems Operational</span>
                </div>
            </div>

        </div>
      </div>
    </footer>
  );
}

// Helper Components
const SocialLink = ({ icon, href }) => (
    <a 
        href={href} 
        className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-white hover:border-brand-500 hover:bg-brand-500 transition-all duration-300 shadow-sm"
    >
        {icon}
    </a>
);

const FooterLink = ({ href, children }) => (
    <li>
        <Link 
            href={href} 
            className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors flex items-center gap-2 group"
        >
            <span className="w-0 overflow-hidden group-hover:w-2 transition-all duration-300 text-brand-500 font-bold">→</span>
            {children}
        </Link>
    </li>
);