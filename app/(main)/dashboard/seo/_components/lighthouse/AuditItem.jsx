"use client";
import React from "react";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

// Helper to format values based on type
const renderCell = (value, type) => {
    if (!value) return <span className="text-slate-300 dark:text-slate-600">-</span>;

    // Handle Code Snippets (HTML)
    if (type === 'code' || (typeof value === 'string' && value.startsWith('<'))) {
        return (
            <code className="block bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-blue-300 p-2 rounded text-[10px] font-mono break-all whitespace-pre-wrap border border-slate-200 dark:border-slate-800">
                {value}
            </code>
        );
    }

    // Handle Links/URLs
    if (type === 'url' || (typeof value === 'string' && value.startsWith('http'))) {
        return (
            <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline break-all">
                {value}
            </a>
        );
    }

    // Handle Bytes
    if (type === 'bytes') {
        return <span className="font-mono text-slate-600 dark:text-slate-300">{Math.round(value / 1024)} KiB</span>;
    }

    // Handle Milliseconds
    if (type === 'ms') {
        return <span className="font-mono text-slate-600 dark:text-slate-300">{Math.round(value)} ms</span>;
    }

    // Default text - ensure it's visible in dark mode
    return <span className="text-slate-700 dark:text-slate-300">{value}</span>;
};

export const AuditItem = ({ audit }) => {
  const { title, displayValue, description, details } = audit;
  
  // Status Colors
  const isError = audit.score !== null && audit.score < 0.5;
  const isWarn = audit.score !== null && audit.score >= 0.5 && audit.score < 0.9;
  
  const icon = isError ? <div className="w-3 h-3 rounded-sm bg-red-500 mt-1" /> 
             : isWarn ? <div className="w-3 h-3 rounded-sm bg-orange-500 mt-1" />
             : <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-600 mt-1" />;

  return (
    <AccordionItem value={audit.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
      <AccordionTrigger className="px-4 py-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:no-underline group [&>svg]:text-slate-400 dark:[&>svg]:text-slate-500">
        <div className="flex items-start gap-4 text-left w-full">
            <div className="shrink-0 pt-1">{icon}</div>
            
            <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                    <span className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                        {title}
                    </span>
                    {displayValue && (
                        <span className="text-xs font-mono text-red-600 dark:text-red-400 whitespace-nowrap shrink-0">
                            {displayValue}
                        </span>
                    )}
                </div>
            </div>
        </div>
      </AccordionTrigger>
      
      <AccordionContent className="px-4 pb-4 pt-0 bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-800">
        <div className="pl-7 space-y-4 pt-4">
            {/* Description */}
            {description && (
                <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed prose dark:prose-invert max-w-none">
                    {/* Basic Markdown Parser for Links */}
                    {description.split(/(\[.*?\]\(.*?\))/g).map((part, i) => {
                        const match = part.match(/\[(.*?)\]\((.*?)\)/);
                        if (match) {
                            return <a key={i} href={match[2]} target="_blank" className="text-blue-500 dark:text-blue-400 hover:underline">{match[1]}</a>;
                        }
                        return part;
                    })}
                </div>
            )}

            {/* DYNAMIC TABLE RENDERING */}
            {details?.items && details.items.length > 0 && details.headings && (
                <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-white dark:bg-slate-950 shadow-sm mt-4">
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                            {/* Headers from Google API */}
                            <thead className="bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                    {details.headings.map((heading, i) => (
                                        <th key={i} className={`p-3 whitespace-nowrap ${heading.itemType === 'numeric' || heading.valueType === 'bytes' || heading.valueType === 'ms' ? 'text-right' : 'text-left'}`}>
                                            {heading.label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            
                            {/* Rows */}
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {details.items.map((item, rowIndex) => (
                                    <tr key={rowIndex} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                                        {details.headings.map((heading, colIndex) => {
                                            // 1. Get the value based on the key (e.g., "url", "totalBytes")
                                            let val = item[heading.key];
                                            
                                            // 2. Fallback: If null, try to find 'snippet' if this is a 'node' column
                                            if (!val && heading.valueType === 'node' && item.snippet) {
                                                val = item.snippet;
                                            }
                                            // 3. Fallback: If missing 'url' but has 'label' (common in resource summary)
                                            if (!val && heading.key === 'url' && item.label) {
                                                val = item.label;
                                            }

                                            return (
                                                <td key={colIndex} className={`p-3 align-top ${heading.itemType === 'numeric' || heading.valueType === 'bytes' || heading.valueType === 'ms' ? 'text-right' : 'text-left'}`}>
                                                    {renderCell(val, heading.valueType || heading.itemType)}
                                                    
                                                    {/* If it's a node, add the label if it exists (e.g. "Zoeken op YouTube") */}
                                                    {heading.valueType === 'node' && item.nodeLabel && (
                                                        <div className="mt-1 text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                                                            {item.nodeLabel}
                                                        </div>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {details.items.length >= 15 && (
                        <div className="p-2 text-center text-[10px] text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                            Showing top 15 items
                        </div>
                    )}
                </div>
            )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};