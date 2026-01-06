"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Menu, Sparkles, ChevronRight, LayoutDashboard } from "lucide-react";
import ThemeToggle from "@/components/Themetoggle";
import { useAuth, UserButton } from "@clerk/nextjs"; // <--- Imports

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const { isSignedIn, isLoaded } = useAuth(); // <--- Check Auth

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Product", href: "/product" },
    { name: "Solutions", href: "/solutions" },
    { name: "Pricing", href: "/pricing" },
    { name: "Developers", href: "/docs" },
  ];

  return (
    <nav
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300 border-b",
        scrolled
          ? "bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-slate-200 dark:border-slate-800 shadow-sm"
          : "bg-transparent border-transparent"
      )}
    >
      <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        
        {/* 1. Logo Area */}
        <Link href="/" className="flex items-center gap-2 group relative z-10">
          <div className="h-9 w-9 bg-gradient-to-tr from-brand-600 to-brand-400 rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-500/20 transition-transform group-hover:scale-105 group-hover:rotate-3">
            <Sparkles size={18} fill="currentColor" className="text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg leading-none tracking-tight text-slate-900 dark:text-white">
              OmniOptimize
            </span>
            <span className="text-[10px] text-slate-900 dark:text-white text-muted-foreground font-medium tracking-wide">
              BETA
            </span>
          </div>
        </Link>

        {/* 2. Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1 bg-slate-100/50 dark:bg-slate-900/50 p-1 rounded-full border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-sm">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="px-4 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 rounded-full transition-all duration-200"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* 3. Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
           <ThemeToggle />
           <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1" />
           
           {isLoaded && isSignedIn ? (
             <>
                <Link href="/dashboard">
                  <Button variant="ghost" className="text-slate-600 dark:text-slate-300">
                    Dashboard
                  </Button>
                </Link>
                <div className="pl-2">
                    <UserButton afterSignOutUrl="/" />
                </div>
             </>
           ) : (
             <>
               <Link href="/login">
                <Button variant="ghost" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800">
                  Sign In
                </Button>
               </Link>
               
               <Link href="/login">
                <Button className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 shadow-md transition-all">
                  Get Started <ChevronRight className="w-4 h-4 ml-1 opacity-50" />
                </Button>
               </Link>
             </>
           )}
        </div>

        {/* 4. Mobile Menu Trigger */}
        <div className="md:hidden flex items-center gap-4">
            <ThemeToggle />
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="border-slate-200 dark:border-slate-800 bg-transparent">
                  <Menu className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-0">
                
                <div className="p-6 border-b border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="flex items-center gap-2 mb-2">
                         <div className="h-8 w-8 bg-brand-500 rounded-lg flex items-center justify-center text-white">
                            <Sparkles size={16} fill="currentColor" />
                        </div>
                        <span className="font-bold text-lg">OmniOptimize</span>
                    </div>
                    <p className="text-xs text-muted-foreground">The all-in-one optimization suite.</p>
                </div>

                <div className="flex flex-col p-4 gap-2">
                  {navLinks.map((link) => (
                    <SheetClose asChild key={link.name}>
                        <Link
                        href={link.href}
                        className="flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-brand-600 transition-colors"
                        >
                        {link.name}
                        <ChevronRight className="w-4 h-4 opacity-30" />
                        </Link>
                    </SheetClose>
                  ))}
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="grid gap-3">
                        {isLoaded && isSignedIn ? (
                             <Link href="/dashboard" className="w-full">
                                <Button className="w-full bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-500/20">
                                    <LayoutDashboard className="w-4 h-4 mr-2" />
                                    Go to Dashboard
                                </Button>
                             </Link>
                        ) : (
                            <>
                                <Link href="/login" className="w-full">
                                    <Button variant="outline" className="w-full justify-start border-slate-200 dark:border-slate-800">
                                        Log in to account
                                    </Button>
                                </Link>
                                <Link href="/login" className="w-full">
                                    <Button className="w-full bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-500/20">
                                        <ChevronRight className="w-4 h-4 mr-2" />
                                        Get Started
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>

              </SheetContent>
            </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;