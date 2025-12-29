"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Check, Eye, EyeOff } from "lucide-react";

/**
 * Reusable copyable field component
 * Handles copy feedback and optional password masking
 * Single source of truth for copy logic - eliminates repeated useState calls
 */
export const CopyableField = ({
  label,
  value,
  secret = false,
  description,
  warning,
}) => {
  const [copied, setCopied] = useState(false);
  const [showValue, setShowValue] = useState(!secret); // Only show password by default if not secret

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            type={secret && !showValue ? "password" : "text"}
            value={value}
            readOnly
            className="font-mono bg-slate-50 dark:bg-slate-950 pr-10"
          />
          {secret && (
            <button
              onClick={() => setShowValue(!showValue)}
              className="absolute right-10 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              {showValue ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={handleCopy}
          title="Copy to clipboard"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </Button>
      </div>

      {description && (
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {description}
        </p>
      )}

      {warning && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-md text-xs text-amber-700 dark:text-amber-400">
          <span className="text-lg">⚠️</span>
          {warning}
        </div>
      )}
    </div>
  );
};
