"use client";
import React, { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useProject } from "@/app/_context/ProjectContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { BrainCircuit, Sparkles, Binary, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

// Feature Importance Data (Hardcoded based on your model training output)
const FEATURE_IMPORTANCE = [
    { name: "TTFB", value: 0.22, color: "#8884d8" },
    { name: "Accessibility", value: 0.17, color: "#82ca9d" },
    { name: "CLS", value: 0.13, color: "#ffc658" },
    { name: "INP", value: 0.11, color: "#ff8042" },
    { name: "FCP", value: 0.10, color: "#a4de6c" },
];

const MlView = () => {
  const { activeProject } = useProject();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // 1. Fetch Latest Scan Data
  const scans = useQuery(api.seo.getScannedUrls, 
    activeProject ? { projectId: activeProject._id } : "skip"
  );
  
  const latestScan = scans && scans.length > 0 ? scans[0] : null;
  const prediction = latestScan?.aiAnalysis?.mlPrediction;
  
  // 2. Mutation to save the result once we get it from Python
  // Ensure you renamed the mutation in convex/ml.ts to 'savePublicPrediction' or update this to match
  const savePrediction = useMutation(api.ml.savePublicPrediction); 

  const handlePredict = async () => {
    if (!latestScan || !latestScan.mobile) {
        alert("Please run a Lighthouse scan first!");
        return;
    }
    
    setIsProcessing(true);
    
    const m = latestScan.mobile;
    const metrics = m.metrics || {};
    
    // Helper to clean "2.5 s" -> 2500 
    const parseMetric = (val) => parseFloat(val?.replace(/[^\d.]/g, "") || "0");

    // Prepare payload matching your Python Pydantic Model
    const payload = {
        performance_score: m.performanceScore || 0,
        accessibility_score: m.scores?.accessibility || 0,
        best_practices_score: m.scores?.bestPractices || 0,
        // Convert seconds to what model expects (assuming raw values/ms based on your scaler logic)
        lcp_lab: parseMetric(metrics.lcp) * (metrics.lcp?.includes('s') ? 1000 : 1), 
        cls_lab: parseMetric(metrics.cls),
        inp_lab: 0, // Lab data often misses INP, sending 0 is safe if model handles it
        fcp_lab: parseMetric(metrics.fcp) * (metrics.fcp?.includes('s') ? 1000 : 1),
        ttfb_lab: parseMetric(metrics.tbt) * (metrics.tbt?.includes('s') ? 1000 : 1), 
        form_factor: "mobile"
    };

    try {
        // Direct Client-to-Localhost call
        const response = await fetch("http://127.0.0.1:8000/predict", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error("ML Server Error");
        const result = await response.json();

        // Save to DB via Convex
        await savePrediction({ scanId: latestScan._id, result });

    } catch (err) {
        console.error(err);
        alert("Failed to connect to Python Model. Ensure 'python api.py' is running on port 8000.");
    } finally {
        setIsProcessing(false);
    }
  };

  // --- 1. LOADING STATE (The "Amusing" Animation) ---
  if (isProcessing) {
    return (
        <div className="h-[500px] flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden relative">
            
            {/* Pulsing Brain */}
            <motion.div
                animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="relative z-10 p-6 bg-white dark:bg-slate-800 rounded-full shadow-2xl"
            >
                <BrainCircuit className="w-16 h-16 text-brand-600 dark:text-brand-400" />
            </motion.div>

            {/* Floating Binary */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
               {[...Array(10)].map((_, i) => (
                   <motion.div
                        key={i}
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 500, opacity: [0, 1, 0] }}
                        transition={{ duration: Math.random() * 3 + 2, repeat: Infinity, delay: Math.random() * 2 }}
                        className="absolute text-brand-500 font-mono text-xs"
                        style={{ left: `${i * 10}%` }}
                   >
                       {Math.random() > 0.5 ? "10101" : "01010"}
                   </motion.div>
               ))}
            </div>

            <h3 className="mt-8 text-lg font-bold text-slate-700 dark:text-slate-300 animate-pulse">
                Running Random Forest Classifier...
            </h3>
            <p className="text-sm text-slate-500">Calculating Feature Vectors</p>
        </div>
    );
  }

  // --- 2. EMPTY STATE (Trigger) ---
  if (!prediction) {
    return (
        <div className="h-[500px] flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-blue-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-teal-500/20">
                <Binary className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Omni ML Predictor</h3>
            <p className="text-slate-500 max-w-md text-center mb-8">
                Use our custom-trained <strong>Random Forest Model</strong> to classify your SEO potential based on 8 key feature vectors.
            </p>
            <Button 
                size="lg" 
                onClick={handlePredict} 
                className="bg-teal-600 hover:bg-teal-700 text-white shadow-lg"
            >
                <Sparkles className="w-4 h-4 mr-2" />
                Run ML Model
            </Button>
        </div>
    );
  }

  // --- 3. RESULT STATE ---
  const isGood = prediction.category === 'Good';
  const isAvg = prediction.category === 'Average';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in-50">
        
        {/* Prediction Card */}
        <Card className="lg:col-span-1 border-teal-200 dark:border-teal-900 bg-teal-50/50 dark:bg-teal-900/10 shadow-sm flex flex-col justify-center items-center text-center p-6">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 shadow-xl ${
                isGood ? "bg-green-100 text-green-600" : isAvg ? "bg-yellow-100 text-yellow-600" : "bg-red-100 text-red-600"
            }`}>
                {isGood ? <CheckCircle2 className="w-12 h-12" /> : isAvg ? <AlertTriangle className="w-12 h-12" /> : <XCircle className="w-12 h-12" />}
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-1">{prediction.category}</h2>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Predicted Category</p>
            
            <div className="mt-6 w-full bg-white dark:bg-slate-900 rounded-lg p-3 border border-slate-200 dark:border-slate-800">
                <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-500">Model Confidence</span>
                    <span className="font-mono font-bold text-teal-600">{prediction.confidence}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-500 transition-all duration-1000" style={{ width: `${prediction.confidence}%` }} />
                </div>
            </div>
        </Card>

        {/* Feature Importance Chart */}
        <Card className="lg:col-span-2 border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader>
                <CardTitle>Why this prediction?</CardTitle>
                <p className="text-sm text-slate-500">Top metrics driving the Random Forest decision.</p>
            </CardHeader>
            <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={FEATURE_IMPORTANCE} layout="vertical" margin={{ left: 20 }}>
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                        <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px' }} />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                            {FEATURE_IMPORTANCE.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>

    </div>
  );
};

export default MlView;