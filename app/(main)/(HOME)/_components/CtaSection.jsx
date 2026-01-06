"use client";
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Plane, Phone } from 'lucide-react';

function CtaSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8  flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative w-full max-w-7xl bg-[#2D0A0A] rounded-[3rem] shadow-2xl p-10 md:p-20 overflow-hidden text-white"
      >
        {/* Background Decor: Subtle World Map or Radar lines */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
           <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
             <path d="M0 100 Q 50 50 100 100" stroke="white" strokeWidth="0.5" fill="none" />
             <path d="M0 80 Q 50 30 100 80" stroke="white" strokeWidth="0.5" fill="none" />
             <circle cx="80" cy="20" r="10" stroke="white" strokeWidth="0.5" fill="none" />
           </svg>
        </div>

        {/* Animated Glow Blobs (Red and Gold) */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-0 right-0 w-96 h-96 bg-krimson rounded-full blur-[100px] opacity-40"
        />
        <motion.div
           animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0.2, 0.1] }}
           transition={{ duration: 10, repeat: Infinity, delay: 2 }}
           className="absolute bottom-0 left-0 w-96 h-96 bg-amber-600 rounded-full blur-[120px] opacity-20"
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
          
          {/* Text Side */}
          <div className="max-w-2xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 border border-white/20 rounded-full mb-6 backdrop-blur-md">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"/>
              <span className="text-xs font-medium tracking-wider uppercase text-gray-200">24/7 Ops Center</span>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-bold leading-tight mb-6 font-sans">
              Ready for <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">Takeoff?</span>
            </h2>
            
            <p className="text-lg text-gray-300 mb-8 leading-relaxed max-w-lg mx-auto lg:mx-0">
              Experience the pinnacle of African aviation support. From overflight permits to VIP concierge, we handle the complexities so you enjoy the journey.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/contact" className="group bg-white text-[#2D0A0A] px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all flex items-center justify-center gap-2">
                Request a Quote 
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </Link>
              
              <Link href="/contact" className="px-8 py-4 border border-white/30 hover:bg-white/10 text-white rounded-full font-semibold transition-all flex items-center justify-center gap-2 backdrop-blur-sm">
                <Phone size={18} /> Talk to an Expert
              </Link>
            </div>
          </div>

          {/* Visual Side: A Stylized Plane Card */}
          <motion.div 
            whileHover={{ rotate: 2, scale: 1.02 }}
            className="hidden lg:block relative bg-white/10 backdrop-blur-lg border border-white/10 p-6 rounded-[2rem] w-80 shadow-2xl"
          >
             <div className="flex justify-between items-center mb-8">
                <div className="text-xs text-gray-400 uppercase">Flight Status</div>
                <div className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full">Confirmed</div>
             </div>
             <div className="flex items-center justify-between text-2xl font-mono font-bold mb-2">
                <span>ADD</span>
                <Plane className="text-amber-400 rotate-90" />
                <span>DXB</span>
             </div>
             <div className="flex justify-between text-sm text-gray-400 mb-8">
                <span>Addis Ababa</span>
                <span>Dubai</span>
             </div>
             <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  animate={{ x: [-100, 300] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="h-full w-1/3 bg-amber-400/80 blur-sm"
                />
             </div>
          </motion.div>

        </div>
      </motion.div>
    </section>
  );
}

export default CtaSection;