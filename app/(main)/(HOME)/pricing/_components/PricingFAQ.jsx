"use client";
import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  { q: "Do I need a credit card to start?", a: "No. You can sign up for the Starter plan without a credit card. We only ask for payment when you upgrade to Pro." },
  { q: "Does the code analysis read my private repos?", a: "We only access repositories you explicitly grant access to via the GitHub App. We process code ephemerally and do not store your source code." },
  { q: "What happens if I exceed my heatmap limits?", a: "We will notify you when you reach 80% and 100% of your limit. Tracking will pause until the next month or until you upgrade." },
  { q: "Can I cancel anytime?", a: "Yes, you can cancel your subscription at any time. Your access will remain active until the end of your billing period." },
];

const PricingFAQ = () => {
  return (
    <section className="py-24 bg-white dark:bg-slate-950">
      <div className="container mx-auto px-4 max-w-3xl">
        <h2 className="text-3xl font-bold text-center mb-12 text-slate-900 dark:text-white">Frequently Asked Questions</h2>
        
        <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                    <AccordionTrigger className="text-left text-slate-900 dark:text-white text-lg font-medium">
                        {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-slate-600 dark:text-slate-400">
                        {faq.a}
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
      </div>
    </section>
  );
};

export default PricingFAQ;