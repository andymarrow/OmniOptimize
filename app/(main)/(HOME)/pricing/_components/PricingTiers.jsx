"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const plans = [
  {
    id: "starter",
    name: "Starter",
    description: "For hobbyists and side projects.",
    price: { monthly: 0, yearly: 0 },
    features: [
      "1 Project",
      "Basic SEO Analysis (Homepage only)",
      "1,000 Heatmap Sessions/mo",
      "Community Support",
      "7-day Data Retention"
    ],
    notIncluded: ["Code Security Scanning", "Competitor Analysis", "AI Auto-Fix"],
    buttonText: "Start for Free",
    popular: false
  },
  {
    id: "pro",
    name: "Pro",
    description: "For growing startups and serious devs.",
    price: { monthly: 29, yearly: 24 }, // Yearly price is per month
    features: [
      "5 Projects",
      "Full Site SEO Crawl (500 pages)",
      "50,000 Heatmap Sessions/mo",
      "Code Security Scanning (GitHub)",
      "AI Auto-Fix Suggestions",
      "Priority Support",
      "30-day Data Retention"
    ],
    notIncluded: ["SSO / SAML", "Dedicated Success Manager"],
    buttonText: "Start Free Trial",
    popular: true
  },
  {
    id: "business",
    name: "Business",
    description: "For scaling teams and agencies.",
    price: { monthly: 99, yearly: 79 },
    features: [
      "Unlimited Projects",
      "Unlimited SEO Crawls",
      "Unlimited Heatmap Sessions",
      "Advanced Code Security & Compliance",
      "Competitor Intelligence",
      "SSO / SAML",
      "1-Year Data Retention"
    ],
    notIncluded: [],
    buttonText: "Contact Sales",
    popular: false
  }
];

const PricingTiers = () => {
  const [billing, setBilling] = useState("monthly"); // 'monthly' | 'yearly'

  return (
    <section className="pb-24 bg-white dark:bg-slate-950">
      <div className="container mx-auto px-4">
        
        {/* TOGGLE */}
        <div className="flex justify-center items-center mb-16 gap-4">
            <span 
                className={cn(
                    "text-sm font-medium transition-colors cursor-pointer", 
                    billing === 'monthly' ? "text-slate-900 dark:text-white" : "text-slate-500"
                )}
                onClick={() => setBilling('monthly')}
            >
                Monthly
            </span>
            
            {/* The Switch Track */}
            <button 
                onClick={() => setBilling(billing === 'monthly' ? 'yearly' : 'monthly')}
                className={cn(
                    "w-14 h-7 rounded-full p-1 flex items-center transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20",
                    billing === 'monthly' ? "bg-slate-200 dark:bg-slate-800 justify-start" : "bg-brand-600 dark:bg-brand-600 justify-end"
                )}
            >
                {/* The Sliding Knob */}
                <motion.div 
                    layout
                    transition={{ type: "spring", stiffness: 700, damping: 30 }}
                    className="w-5 h-5 bg-white rounded-full shadow-md"
                />
            </button>

            <span 
                className={cn(
                    "text-sm font-medium transition-colors cursor-pointer", 
                    billing === 'yearly' ? "text-slate-900 dark:text-white" : "text-slate-500"
                )}
                onClick={() => setBilling('yearly')}
            >
                Yearly <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full ml-1 font-bold">-20%</span>
            </span>
        </div>

        {/* CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {plans.map((plan) => (
                <div 
                    key={plan.id}
                    className={cn(
                        "relative p-8 rounded-2xl border flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl",
                        plan.popular 
                            ? "bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xl" 
                            : "bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-200 dark:border-slate-800"
                    )}
                >
                    {plan.popular && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-brand-500 to-emerald-400 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1 shadow-lg">
                            <Sparkles className="w-3 h-3" fill="currentColor" /> Most Popular
                        </div>
                    )}

                    <div className="mb-8">
                        <h3 className="text-lg font-bold mb-2">{plan.name}</h3>
                        <p className={cn("text-sm mb-6", plan.popular ? "text-slate-300 dark:text-slate-500" : "text-slate-500 dark:text-slate-400")}>
                            {plan.description}
                        </p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-bold">
                                ${billing === 'monthly' ? plan.price.monthly : plan.price.yearly}
                            </span>
                            <span className={cn("text-sm", plan.popular ? "text-slate-400 dark:text-slate-500" : "text-slate-500")}>
                                /month
                            </span>
                        </div>
                        {billing === 'yearly' && plan.price.yearly > 0 && (
                            <p className="text-xs text-brand-500 mt-2 font-medium">
                                Billed ${plan.price.yearly * 12} yearly
                            </p>
                        )}
                    </div>

                    {/* Features List */}
                    <ul className="space-y-4 mb-8 flex-1">
                        {plan.features.map((feature, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm">
                                <Check className={cn("w-5 h-5 shrink-0", plan.popular ? "text-brand-400 dark:text-brand-600" : "text-brand-600 dark:text-brand-400")} />
                                <span>{feature}</span>
                            </li>
                        ))}
                        {plan.notIncluded.map((feature, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm opacity-50">
                                <X className="w-5 h-5 shrink-0" />
                                <span>{feature}</span>
                            </li>
                        ))}
                    </ul>

                    <Button 
                        className={cn(
                            "w-full h-12 rounded-lg font-bold transition-all",
                            plan.popular 
                                ? "bg-white text-slate-900 hover:bg-slate-100 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800" 
                                : "bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                        )}
                    >
                        {plan.buttonText}
                    </Button>
                </div>
            ))}
        </div>

      </div>
    </section>
  );
};

export default PricingTiers;