"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GitMerge, Search, ArrowRight } from "lucide-react";

export const SearchTab = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full overflow-y-auto">
      {/* Internal Search */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Internal Site Search</CardTitle>
          <p className="text-xs text-slate-500">
            What users are typing in your search bar
          </p>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {[
              {
                term: "Dark Mode",
                count: 420,
                result: "0 Results",
                status: "miss",
              },
              {
                term: "Refund Policy",
                count: 150,
                result: "Found /legal/refunds",
                status: "hit",
              },
              {
                term: "API Keys",
                count: 85,
                result: "Found /settings/api",
                status: "hit",
              },
              {
                term: "Delete Account",
                count: 12,
                result: "0 Results",
                status: "miss",
              },
            ].map((item, i) => (
              <li
                key={i}
                className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-white dark:bg-slate-800 rounded shadow-sm">
                    <Search className="w-4 h-4 text-slate-400" />
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    "{item.term}"
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    {item.count} searches
                  </div>
                  <div
                    className={`text-[10px] font-medium ${item.status === "miss" ? "text-red-500" : "text-green-500"}`}
                  >
                    {item.result}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Attribution / Path */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">
            Reverse Path Analysis (Goal: Purchase)
          </CardTitle>
          <p className="text-xs text-slate-500">
            Most common path leading to success
          </p>
        </CardHeader>
        <CardContent>
          <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-800 space-y-8">
            <div className="relative">
              <div className="absolute -left-[31px] top-0 w-4 h-4 bg-slate-200 dark:bg-slate-700 rounded-full border-4 border-white dark:border-slate-950" />
              <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-400 uppercase">
                  Step 1
                </span>
                <div className="font-bold text-slate-700 dark:text-slate-200">
                  Google Organic Search
                </div>
                <div className="text-xs text-slate-500">
                  60% of purchasers start here
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -left-[31px] top-0 w-4 h-4 bg-slate-200 dark:bg-slate-700 rounded-full border-4 border-white dark:border-slate-950" />
              <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-400 uppercase">
                  Step 2
                </span>
                <div className="font-bold text-slate-700 dark:text-slate-200">
                  Blog Post: "Top 10 Trends"
                </div>
                <div className="text-xs text-slate-500">Avg time: 2m 30s</div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -left-[31px] top-0 w-4 h-4 bg-slate-200 dark:bg-slate-700 rounded-full border-4 border-white dark:border-slate-950" />
              <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-400 uppercase">
                  Step 3
                </span>
                <div className="font-bold text-slate-700 dark:text-slate-200">
                  Product Page (Hoodie)
                </div>
                <div className="text-xs text-slate-500">
                  Added to cart immediately
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -left-[31px] top-0 w-4 h-4 bg-green-500 rounded-full border-4 border-white dark:border-slate-950 shadow-lg shadow-green-500/50" />
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-900/50">
                <span className="text-xs font-bold text-green-600 dark:text-green-400 uppercase">
                  Goal Reached
                </span>
                <div className="font-bold text-green-800 dark:text-green-300">
                  Checkout Success
                </div>
                <div className="text-xs text-green-600/70">
                  Conversion Value: $120
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
