"use client";
import React from "react";
import { CohortCell } from "./CohortCell";
import { formatDateDisplay } from "@/utils/dateFormatter";

export const CohortTable = ({ cohorts, intervals }) => {
  if (cohorts.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-500 dark:text-slate-400">
          No cohort data available
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-900">
            <th className="border border-slate-200 dark:border-slate-700 px-4 py-3 text-left font-semibold text-sm text-slate-700 dark:text-slate-300 w-32">
              Cohort Date
            </th>
            <th className="border border-slate-200 dark:border-slate-700 px-4 py-3 text-center font-semibold text-sm text-slate-700 dark:text-slate-300 w-16">
              Size
            </th>
            {intervals.map((interval) => (
              <th
                key={interval}
                className="border border-slate-200 dark:border-slate-700 px-2 py-3 text-center font-semibold text-sm text-slate-700 dark:text-slate-300"
                style={{ width: "60px" }}
              >
                Day {interval}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cohorts.map((cohort) => (
            <tr
              key={cohort.date}
              className="hover:bg-slate-50 dark:hover:bg-slate-900/50"
            >
              <td className="border border-slate-200 dark:border-slate-700 px-4 py-3 font-medium text-sm text-slate-900 dark:text-slate-100">
                {formatDateDisplay(cohort.date)}
              </td>
              <td className="border border-slate-200 dark:border-slate-700 px-4 py-3 text-center text-sm text-slate-600 dark:text-slate-400">
                {cohort.size}
              </td>
              {intervals.map((interval) => (
                <CohortCell
                  key={`${cohort.date}-${interval}`}
                  value={cohort.retention[interval] ?? null}
                  size={60}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
