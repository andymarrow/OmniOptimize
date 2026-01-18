"use client";
import React from "react";

export const CohortCell = ({ value, size = 60 }) => {
  if (value === null) {
    return (
      <td
        style={{ width: `${size}px`, height: `${size}px` }}
        className="border border-slate-200 dark:border-slate-700 text-center"
      >
        <span className="text-xs text-slate-400">—</span>
      </td>
    );
  }

  const percentage = Math.round(value * 100);

  // Color gradient based on retention percentage
  // < 10%: #f7fcfd, 10-19%: #ccece6, 20-34%: #66c2a4, 35-49%: #238b45, 100%: #00441b
  const colors = [
    { stop: 0.0, rgb: "247, 252, 253" }, // #f7fcfd (< 10%)
    { stop: 0.1, rgb: "204, 236, 230" }, // #ccece6 (10-19%)
    { stop: 0.2, rgb: "102, 194, 164" }, // #66c2a4 (20-34%)
    { stop: 0.35, rgb: "35, 139, 69" }, // #238b45 (35-49%)
    { stop: 1.0, rgb: "0, 68, 27" }, // #00441b (100%)
  ];

  // Determine text color based on background brightness (luminance calculation)
  // Calculate perceived brightness of the background color
  const c1 = colors[0].rgb.split(", ").map(Number);
  let bgRgb = c1;
  for (let i = 0; i < colors.length - 1; i++) {
    if (value >= colors[i].stop && value <= colors[i + 1].stop) {
      const range = colors[i + 1].stop - colors[i].stop;
      const position = (value - colors[i].stop) / range;
      const c2 = colors[i + 1].rgb.split(", ").map(Number);
      bgRgb = [
        Math.round(c1[0] + (c2[0] - c1[0]) * position),
        Math.round(c1[1] + (c2[1] - c1[1]) * position),
        Math.round(c1[2] + (c2[2] - c1[2]) * position),
      ];
      break;
    }
  }

  // Calculate luminance (perceived brightness)
  const luminance = (bgRgb[0] * 299 + bgRgb[1] * 587 + bgRgb[2] * 114) / 1000;
  const textColor = luminance > 155 ? "text-slate-900" : "text-white";
  const bgColor = `rgb(${bgRgb[0]}, ${bgRgb[1]}, ${bgRgb[2]})`;

  return (
    <td
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: bgColor,
      }}
      className={`border-none text-center font-semibold text-sm transition-colors hover:opacity-75 ${textColor}`}
    >
      <span>{percentage}%</span>
    </td>
  );
};
