"use client";
import React from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const TechDebtRadar = ({ data }) => {
  if (!data) return null;

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-sm h-full">
        <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-center">Health Balance</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                        <PolarGrid stroke="#94a3b8" opacity={0.3} />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} />
                        <Radar
                            name="Site Health"
                            dataKey="A"
                            stroke="#8884d8"
                            fill="#8884d8"
                            fillOpacity={0.4}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </CardContent>
    </Card>
  );
};