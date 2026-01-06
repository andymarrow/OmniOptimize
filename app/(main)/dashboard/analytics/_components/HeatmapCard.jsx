"use client";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, MousePointer2 } from "lucide-react";
import HeatmapGalleryModal from "./HeatmapGalleryModal"; // <--- Import the new modal

const HeatmapCard = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Card className="col-span-full lg:col-span-2 border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
        <CardHeader className="relative z-10">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <MousePointer2 className="w-4 h-4 text-red-500" /> Latest Heatmap
            </CardTitle>
            <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
              Live Rec
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-0 relative h-[250px] w-full bg-slate-100 dark:bg-slate-900">
          {/* Background Website Screenshot Placeholder */}
          <div className="absolute inset-0 opacity-50 grayscale group-hover:grayscale-0 transition-all duration-500">
            {/* Simulated Screenshot */}
            <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop')] bg-cover bg-center" />
          </div>

          {/* Heatmap Blobs (Simulated) */}
          <div className="absolute top-[30%] left-[20%] w-24 h-24 bg-red-500/60 blur-[40px] rounded-full animate-pulse" />
          <div className="absolute top-[40%] left-[25%] w-16 h-16 bg-yellow-500/60 blur-[30px] rounded-full" />
          <div className="absolute bottom-[20%] right-[30%] w-32 h-32 bg-blue-500/40 blur-[50px] rounded-full" />

          {/* Overlay Content */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent flex items-end p-6">
            <div className="w-full flex justify-between items-end">
              <div className="text-white">
                <p className="text-sm font-medium">Checkout Page</p>
                <p className="text-xs text-slate-300">1,240 clicks recorded</p>
              </div>
              {/* BUTTON TRIGGERS MODAL */}
              <Button
                size="sm"
                className="bg-white text-slate-900 hover:bg-slate-100"
                onClick={() => setShowModal(true)}
              >
                View Full Map <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* THE MODAL COMPONENT */}
      <HeatmapGalleryModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
};

export default HeatmapCard;
