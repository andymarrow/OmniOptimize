import React from "react";
import { ChevronDown, AlertTriangle } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const AccessibilityAudit = () => {
  return (
    <div className="mt-12 space-y-6">
        <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Accessibility Diagnostics</h3>
        </div>

        <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-white dark:bg-slate-900">
            <Accordion type="single" collapsible className="w-full">
                
                {/* Contrast Issue */}
                <AccordionItem value="contrast" className="border-b border-slate-100 dark:border-slate-800">
                    <AccordionTrigger className="px-4 hover:no-underline hover:bg-slate-50 dark:hover:bg-slate-900">
                        <div className="flex items-center gap-3 text-left">
                            <div className="w-3 h-3 bg-red-500 rounded-sm mt-0.5" />
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                Background and foreground colors do not have a sufficient contrast ratio.
                            </span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="bg-slate-50 dark:bg-slate-950/50 px-4 py-4">
                        <p className="text-xs text-slate-500 mb-3">Low-contrast text is difficult or impossible for many users to read.</p>
                        
                        {/* Failing Elements Table */}
                        <div className="space-y-3">
                            <div className="flex gap-4 items-start p-2 border border-slate-200 dark:border-slate-800 rounded bg-white dark:bg-slate-900">
                                <div className="w-16 h-10 bg-slate-200 dark:bg-slate-800 rounded flex items-center justify-center text-[10px] text-slate-500">
                                    Preview
                                </div>
                                <div className="font-mono text-xs text-slate-600 dark:text-slate-400 break-all">
                                    &lt;p class="text-gray-400"&gt;Copyright 2025&lt;/p&gt;
                                </div>
                            </div>
                            <div className="flex gap-4 items-start p-2 border border-slate-200 dark:border-slate-800 rounded bg-white dark:bg-slate-900">
                                <div className="w-16 h-10 bg-slate-200 dark:bg-slate-800 rounded flex items-center justify-center text-[10px] text-slate-500">
                                    Preview
                                </div>
                                <div className="font-mono text-xs text-slate-600 dark:text-slate-400 break-all">
                                    &lt;span class="text-slate-300"&gt;Read more&lt;/span&gt;
                                </div>
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Names and Labels Issue */}
                <AccordionItem value="labels" className="border-b-0">
                    <AccordionTrigger className="px-4 hover:no-underline hover:bg-slate-50 dark:hover:bg-slate-900">
                        <div className="flex items-center gap-3 text-left">
                            <div className="w-3 h-3 bg-red-500 rounded-sm mt-0.5" />
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                Image elements do not have [alt] attributes
                            </span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="bg-slate-50 dark:bg-slate-950/50 px-4 py-4">
                        <div className="p-3 border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 rounded text-xs text-red-600 dark:text-red-400 font-mono">
                            &lt;img src="hero-banner.png" /&gt;
                        </div>
                    </AccordionContent>
                </AccordionItem>

            </Accordion>
        </div>
    </div>
  );
};