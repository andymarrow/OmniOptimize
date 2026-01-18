import React from "react";

export const CohortSkeleton = () => {
  const intervals = Array.from({ length: 6 });
  const rows = Array.from({ length: 5 });

  return (
    <div className="space-y-4">
      {/* Filters Skeleton */}
      <div className="flex flex-col md:flex-row gap-4 p-4 bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-700">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex flex-col gap-2 flex-1">
            <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded" />
          </div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900">
              <th className="border border-slate-200 dark:border-slate-700 px-4 py-3 w-32">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24" />
              </th>
              <th className="border border-slate-200 dark:border-slate-700 px-4 py-3 w-16">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-12" />
              </th>
              {intervals.map((_, i) => (
                <th
                  key={i}
                  className="border border-slate-200 dark:border-slate-700 px-2 py-3"
                  style={{ width: "60px" }}
                >
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-12 mx-auto" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((_, rowIdx) => (
              <tr key={rowIdx}>
                <td className="border border-slate-200 dark:border-slate-700 px-4 py-3">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24" />
                </td>
                <td className="border border-slate-200 dark:border-slate-700 px-4 py-3">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-8 mx-auto" />
                </td>
                {intervals.map((_, colIdx) => (
                  <td
                    key={colIdx}
                    className="border border-slate-200 dark:border-slate-700"
                    style={{ width: "60px", height: "60px" }}
                  >
                    <div className="h-full bg-slate-200 dark:bg-slate-700" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
