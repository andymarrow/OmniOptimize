"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const FUNNEL_DATA = [
  { name: "Landed", value: 5000, drop: "0%", color: "#3b82f6" },
  { name: "Viewed Product", value: 3200, drop: "36%", color: "#60a5fa" },
  { name: "Add to Cart", value: 1800, drop: "44%", color: "#93c5fd" },
  { name: "Checkout Start", value: 1200, drop: "33%", color: "#bfdbfe" },
  { name: "Purchase", value: 950, drop: "21%", color: "#10b981" }, // Green for success
];

const FORM_DATA = [
  { field: "Email", status: "good", dropoff: 2 },
  { field: "Password", status: "good", dropoff: 5 },
  { field: "Phone Number", status: "critical", dropoff: 62 },
  { field: "Company Name", status: "warning", dropoff: 12 },
];

export const FunnelTab = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full overflow-y-auto">
        
        {/* Custom Conversion Funnel */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm h-full">
            <CardHeader>
                <CardTitle className="text-base">Checkout Conversion Funnel</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={FUNNEL_DATA} layout="vertical" margin={{ left: 40, right: 40 }}>
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
                        <Tooltip 
                            cursor={{fill: 'transparent'}} 
                            contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff' }} 
                        />
                        <Bar dataKey="value" barSize={40} radius={[0, 4, 4, 0]}>
                            {FUNNEL_DATA.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>

        {/* Form Analytics */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm h-full">
            <CardHeader>
                <CardTitle className="text-base">Signup Form Friction</CardTitle>
                <p className="text-xs text-slate-500">Field-level abandonment rates</p>
            </CardHeader>
            <CardContent className="space-y-6">
                {FORM_DATA.map((field, i) => (
                    <div key={i} className="group">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="font-medium text-slate-700 dark:text-slate-300">{field.field}</span>
                            <span className={`${field.status === 'critical' ? 'text-red-500 font-bold' : field.status === 'warning' ? 'text-orange-500' : 'text-slate-500'}`}>
                                {field.dropoff}% Drop-off
                            </span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                            <div 
                                className={`h-full rounded-full transition-all duration-1000 ${
                                    field.status === 'critical' ? 'bg-red-500' : 
                                    field.status === 'warning' ? 'bg-orange-400' : 'bg-slate-300 dark:bg-slate-600'
                                }`} 
                                style={{ width: `${field.dropoff}%` }} 
                            />
                        </div>
                        {field.status === 'critical' && (
                            <div className="mt-2 text-xs bg-red-50 dark:bg-red-900/10 text-red-600 p-2 rounded border border-red-100 dark:border-red-900/30">
                                <strong>Insight:</strong> 62% of users quit here. Consider making "Phone Number" optional or removing strict validation.
                            </div>
                        )}
                    </div>
                ))}
            </CardContent>
        </Card>

    </div>
  );
};
