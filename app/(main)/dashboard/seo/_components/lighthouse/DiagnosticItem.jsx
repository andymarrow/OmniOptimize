import React from "react";
import { Info } from "lucide-react";

export const DiagnosticItem = ({ title, description }) => {
  return (
    <div className="py-4 px-4 border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
            <Info className="w-4 h-4 text-slate-400" />
        </div>
        <div>
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {title}
            </h4>
            {description && (
                <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-2xl">
                    {description}
                </p>
            )}
        </div>
      </div>
    </div>
  );
};