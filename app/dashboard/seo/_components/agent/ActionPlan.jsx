"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Clock, Calendar } from "lucide-react";

export const ActionPlan = ({ roadmap }) => {
  if (!roadmap) return null;

  return (
    <div className="space-y-4">
        {roadmap.map((phase, i) => (
            <Card key={i} className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="bg-slate-100 dark:bg-slate-900 px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
                    {i === 0 ? <Clock className="w-4 h-4 text-red-500" /> : <Calendar className="w-4 h-4 text-blue-500" />}
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">{phase.phase}</h4>
                </div>
                <CardContent className="p-4">
                    <ul className="space-y-3">
                        {phase.tasks.map((task, j) => (
                            <li key={j} className="flex items-start gap-3">
                                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                <span className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                    {task}
                                </span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        ))}
    </div>
  );
};