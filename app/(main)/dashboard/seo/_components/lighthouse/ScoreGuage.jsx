import React from "react";

export const ScoreGauge = ({ score, label, size = "small" }) => {
  const radius = size === "large" ? 56 : 28;
  const stroke = size === "large" ? 10 : 5;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  
  const getColor = (s) => {
    if (s >= 90) return "text-green-500";
    if (s >= 50) return "text-orange-500";
    return "text-red-500";
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`relative ${size === "large" ? "w-36 h-36" : "w-16 h-16"} flex items-center justify-center`}>
        <svg className="w-full h-full -rotate-90">
          <circle cx="50%" cy="50%" r={radius} className="text-slate-100 dark:text-slate-800" strokeWidth={stroke} fill="transparent" stroke="currentColor" />
          <circle 
            cx="50%" cy="50%" r={radius} 
            className={`${getColor(score)} transition-all duration-1000 ease-out`}
            strokeWidth={stroke} fill="transparent" stroke="currentColor"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <span className={`absolute ${size === "large" ? "text-4xl" : "text-lg"} font-bold text-slate-700 dark:text-slate-200`}>
          {score}
        </span>
      </div>
      <span className={`text-sm font-medium ${size === "large" ? "text-slate-900 dark:text-white" : "text-slate-500"}`}>
        {label}
      </span>
    </div>
  );
};