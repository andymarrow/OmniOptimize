"use client";
import React, { useMemo } from "react";
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar 
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { format } from "date-fns";
import { TrendingUp, TrendingDown, Activity, Trophy, Calendar } from "lucide-react";

export default function HistoryView({ history }) {
  
  // 1. Data Transformation
  const chartData = useMemo(() => {
    if (!history || history.length === 0) return [];

    // Sort by date ascending (Oldest -> Newest) for the chart
    const sorted = [...history].sort((a, b) => 
        (a.mobile?.updatedAt || 0) - (b.mobile?.updatedAt || 0)
    );

    return sorted.map(scan => {
        const m = scan.mobile?.metrics || {};
        return {
            date: format(new Date(scan.mobile?.updatedAt || Date.now()), "MMM dd"),
            fullDate: format(new Date(scan.mobile?.updatedAt || Date.now()), "MMM dd, HH:mm"),
            
            // Scores
            mobileScore: scan.mobile?.performanceScore || 0,
            desktopScore: scan.desktop?.performanceScore || 0,
            
            // Core Web Vitals (Parse "2.5 s" to 2.5)
            lcp: parseFloat((m.lcp || "0").replace(/[^\d.]/g, "")),
            cls: parseFloat((m.cls || "0").replace(/[^\d.]/g, "")),
            tbt: parseFloat((m.tbt || "0").replace(/[^\d.]/g, "")),
        };
    });
  }, [history]);

  if (!chartData.length) {
    return (
        <div className="flex flex-col items-center justify-center h-64 text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            <Activity className="w-10 h-10 mb-2 opacity-50" />
            <p>No history data available yet.</p>
            <p className="text-xs">Run a few scans to see trends.</p>
        </div>
    );
  }

  // Calculate Insights
  const latest = chartData[chartData.length - 1];
  const previous = chartData.length > 1 ? chartData[chartData.length - 2] : latest;
  const trend = latest.mobileScore - previous.mobileScore;
  const bestScore = Math.max(...chartData.map(d => d.mobileScore));
  const avgScore = Math.round(chartData.reduce((acc, curr) => acc + curr.mobileScore, 0) / chartData.length);

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-500">
        
        {/* 2. KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                <CardContent className="p-6 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Latest Score</p>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{latest.mobileScore}</div>
                        <div className={`flex items-center text-xs mt-1 font-medium ${trend >= 0 ? "text-green-500" : "text-red-500"}`}>
                            {trend >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                            {Math.abs(trend)} pts {trend >= 0 ? "up" : "down"}
                        </div>
                    </div>
                    <div className="p-3 bg-slate-100 dark:bg-slate-900 rounded-full">
                        <Activity className="w-5 h-5 text-brand-600" />
                    </div>
                </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                <CardContent className="p-6 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">All-Time Best</p>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{bestScore}</div>
                        <p className="text-xs text-slate-400 mt-1">Target: 90+</p>
                    </div>
                    <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-full">
                        <Trophy className="w-5 h-5 text-yellow-600" />
                    </div>
                </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                <CardContent className="p-6 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Avg. Score</p>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{avgScore}</div>
                        <p className="text-xs text-slate-400 mt-1">Over {chartData.length} scans</p>
                    </div>
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                        <Activity className="w-5 h-5 text-blue-600" />
                    </div>
                </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                <CardContent className="p-6 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Last Scan</p>
                        <div className="text-lg font-bold text-slate-900 dark:text-white mt-1">{latest.date}</div>
                        <p className="text-xs text-slate-400 mt-1">{latest.fullDate.split(',')[1]}</p>
                    </div>
                    <div className="p-3 bg-slate-100 dark:bg-slate-900 rounded-full">
                        <Calendar className="w-5 h-5 text-slate-500" />
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* 3. Main Performance Chart */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
                <CardDescription>Comparing Mobile vs. Desktop scores over time.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorMobile" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorDesktop" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-slate-200 dark:stroke-slate-800" />
                            <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={12} stroke="#94a3b8" />
                            <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="#94a3b8" domain={[0, 100]} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: "#0f172a", border: "none", borderRadius: "8px", color: "#fff" }}
                                itemStyle={{ color: "#fff" }}
                            />
                            <Legend />
                            <Area type="monotone" dataKey="mobileScore" name="Mobile" stroke="#3b82f6" fillOpacity={1} fill="url(#colorMobile)" strokeWidth={3} />
                            <Area type="monotone" dataKey="desktopScore" name="Desktop" stroke="#10b981" fillOpacity={1} fill="url(#colorDesktop)" strokeWidth={3} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>

        {/* 4. Core Web Vitals Deep Dive */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* LCP Trend */}
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-base">Largest Contentful Paint (LCP)</CardTitle>
                    <CardDescription>Lower is better. Goal: &lt; 2.5s</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ left: -20 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-slate-200 dark:stroke-slate-800" />
                                <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={12} stroke="#94a3b8" />
                                <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="#94a3b8" />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: "#0f172a", border: "none", borderRadius: "8px", color: "#fff" }}
                                />
                                <Line type="monotone" dataKey="lcp" stroke="#f59e0b" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* CLS Trend */}
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-base">Cumulative Layout Shift (CLS)</CardTitle>
                    <CardDescription>Visual stability. Goal: &lt; 0.1</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ left: -20 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-slate-200 dark:stroke-slate-800" />
                                <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={12} stroke="#94a3b8" />
                                <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="#94a3b8" />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: "#0f172a", border: "none", borderRadius: "8px", color: "#fff" }}
                                />
                                <Bar dataKey="cls" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

        </div>
    </div>
  );
}