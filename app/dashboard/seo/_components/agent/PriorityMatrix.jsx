"use client";
import React from "react";
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, Cell, ReferenceLine,CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const PriorityMatrix = ({ data }) => {
  if (!data || data.length === 0) return null;

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-sm h-full">
        <CardHeader>
            <CardTitle>Strategic Priority Matrix</CardTitle>
            <CardDescription>Focus on High Impact, Low Effort tasks (Top Left).</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" dataKey="effort" name="Effort" unit="" domain={[0, 10]} label={{ value: 'Effort ->', position: 'insideBottomRight', offset: -10 }} />
                        <YAxis type="number" dataKey="impact" name="Impact" unit="" domain={[0, 10]} label={{ value: 'Impact ->', angle: -90, position: 'insideLeft' }} />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
                        <ReferenceLine y={5} stroke="#888" strokeDasharray="3 3" />
                        <ReferenceLine x={5} stroke="#888" strokeDasharray="3 3" />
                        <Scatter name="Tasks" data={data} fill="#8884d8">
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.category === 'Speed' ? '#3b82f6' : entry.category === 'SEO' ? '#10b981' : '#f59e0b'} />
                            ))}
                        </Scatter>
                    </ScatterChart>
                </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-4 text-xs text-slate-500">
                <div className="flex items-center gap-1"><div className="w-2 h-2 bg-blue-500 rounded-full"/> Speed</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 bg-green-500 rounded-full"/> SEO</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 bg-orange-500 rounded-full"/> UX</div>
            </div>
        </CardContent>
    </Card>
  );
};

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-3 rounded-lg text-xs shadow-xl border border-slate-700">
          <p className="font-bold mb-1">{payload[0].payload.task}</p>
          <p>Impact: {payload[0].value}/10</p>
          <p>Effort: {payload[1].value}/10</p>
        </div>
      );
    }
    return null;
};