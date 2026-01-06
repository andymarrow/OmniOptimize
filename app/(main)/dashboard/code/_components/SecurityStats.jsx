"use client";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, ShieldAlert, Bug, FileCode } from "lucide-react";

const stats = [
  { label: "Security Score", value: "A+", sub: "Top 5% of repos", icon: ShieldCheck, color: "text-green-500", bg: "bg-green-500/10" },
  { label: "Vulnerabilities", value: "2", sub: "1 Low, 1 Medium", icon: ShieldAlert, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  { label: "Code Smells", value: "12", sub: "-3 from last week", icon: Bug, color: "text-blue-500", bg: "bg-blue-500/10" },
  { label: "Files Scanned", value: "142", sub: "Last: 10m ago", icon: FileCode, color: "text-purple-500", bg: "bg-purple-500/10" },
];

const SecurityStats = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, i) => (
        <Card key={i} className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardContent className="p-6 flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stat.value}</h3>
                    <p className="text-xs text-slate-400 mt-1">{stat.sub}</p>
                </div>
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
            </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SecurityStats;