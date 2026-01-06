"use client";
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const SolutionsCTA = () => {
  return (
    <section className="py-24 bg-white dark:bg-slate-950">
      <div className="container mx-auto px-4 max-w-4xl text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight">
            Ready to unify your workflow?
        </h2>
        <p className="text-xl text-slate-600 dark:text-slate-400 mb-10">
            Join the engineering teams who have stopped fighting their tools and started shipping faster websites.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
                <Button className="h-14 px-8 text-lg rounded-full bg-brand-600 hover:bg-brand-500 text-white shadow-xl shadow-brand-500/20">
                    Get Started for Free <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
            </Link>
            <Link href="/contact">
                <Button variant="outline" className="h-14 px-8 text-lg rounded-full border-slate-200 dark:border-slate-800 text-slate-950 dark:text-white">
                    Contact Sales
                </Button>
            </Link>
        </div>
      </div>
    </section>
  );
};

export default SolutionsCTA;