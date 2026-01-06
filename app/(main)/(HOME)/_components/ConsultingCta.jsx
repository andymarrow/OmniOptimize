"use client";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ConsultingCta() {
  return (
    <section className="py-12 px-4 bg-white dark:bg-neutral-900 border-y border-gray-100 dark:border-white/5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        
        <div className="flex items-center gap-6">
            <div className="hidden md:flex w-16 h-16 rounded-full bg-krimson text-white dark:bg-amber-500 dark:text-black items-center justify-center font-bold text-2xl">
                ?
            </div>
            <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Buying a Jet or Starting an Airline?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                    Our consulting division helps businesses generate competitive advantages in the African market.
                </p>
            </div>
        </div>

        <Link 
            href="/consulting"
            className="group flex items-center gap-2 px-8 py-3 rounded-full border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white font-medium hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
        >
            Book a Consultation <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </Link>

      </div>
    </section>
  );
}