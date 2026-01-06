"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const COHORTS = [
  { month: "Jan", users: 1205, retention: [100, 45, 38, 32, 28, 25] },
  { month: "Feb", users: 1450, retention: [100, 48, 42, 38, 35] },
  { month: "Mar", users: 1800, retention: [100, 52, 48, 45] },
  { month: "Apr", users: 2100, retention: [100, 55, 52] },
];

export const CohortTab = () => {
  return (
    <div className="grid grid-cols-1 gap-6">
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">User Retention by Cohort</CardTitle>
        </CardHeader>
        <CardContent>
          {/* RESPONSIVE: Overflow container for table */}
          <div className="overflow-x-auto pb-2">
            <table className="w-full text-sm min-w-[600px]">
              {" "}
              {/* min-w prevents squishing */}
              <thead>
                <tr>
                  <th className="p-3 text-left text-slate-500 font-medium bg-slate-50 dark:bg-slate-900 rounded-l-lg">
                    Acquisition
                  </th>
                  <th className="p-3 text-left text-slate-500 font-medium bg-slate-50 dark:bg-slate-900">
                    Total Users
                  </th>
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <th
                      key={i}
                      className={`p-3 text-center text-slate-500 font-medium bg-slate-50 dark:bg-slate-900 ${i === 5 ? "rounded-r-lg" : ""}`}
                    >
                      Month {i}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {COHORTS.map((row, i) => (
                  <tr
                    key={i}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50"
                  >
                    <td className="p-3 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      {row.month}
                    </td>
                    <td className="p-3 text-slate-500">{row.users}</td>
                    {row.retention.map((val, j) => {
                      // Simple opacity based style logic
                      const bgStyle =
                        val === 100
                          ? { backgroundColor: "#f1f5f9", color: "#94a3b8" }
                          : {
                              backgroundColor: `rgba(16, 185, 129, ${val / 100})`,
                              color: val > 50 ? "white" : "black",
                            };

                      return (
                        <td key={j} className="p-2 text-center">
                          <div
                            className="w-full py-1.5 rounded text-xs font-bold transition-all"
                            style={bgStyle}
                          >
                            {val}%
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Stack these cards on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-red-50 dark:bg-red-900/10 border-l-4 border-l-red-500">
          <CardContent className="p-6">
            <h4 className="font-bold text-red-700 dark:text-red-400">
              High Churn Risk
            </h4>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
              142 Users
            </p>
            <p className="text-xs text-red-600/80 mt-1">
              Haven't logged in for 28 days.
            </p>
          </CardContent>
        </Card>
        {/* ... other cards (Loyal, Resurrected) - same structure ... */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-green-50 dark:bg-green-900/10 border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <h4 className="font-bold text-green-700 dark:text-green-400">
              Loyal Power Users
            </h4>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
              58 Users
            </p>
            <p className="text-xs text-green-600/80 mt-1">
              Active every day this week.
            </p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-blue-50 dark:bg-blue-900/10 border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <h4 className="font-bold text-blue-700 dark:text-blue-400">
              Resurrected
            </h4>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
              12 Users
            </p>
            <p className="text-xs text-blue-600/80 mt-1">
              Returned after 30+ days inactive.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
