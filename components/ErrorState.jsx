"use client";
import React from "react";
import { AlertCircle, RefreshCw, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export const ErrorState = ({
  title = "Well, this is awkward...",
  message = "Our server just tripped over its own shoelaces.",
  onRetry = null,
  onContact = null,
  showRefresh = true,
  showContact = true,
  backgroundImage,
}) => {
  return (
    <div
      className="relative min-h-96 rounded-lg overflow-hidden flex items-end justify-center p-6"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "clamp(150px, 50%, 300px)",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
    >
      {/* Dark overlay for contrast */}
      <div className="absolute inset-0 bg-black/20 dark:bg-black/10" />

      {/* Content */}
      <div className="relative z-10 max-w-md text-center space-y-4">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white drop-shadow-lg uppercase">
            {title}
          </h2>
          <p className="text-sm text-emerald-100 drop-shadow-lg">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          {showRefresh && onRetry && (
            <Button
              onClick={onRetry}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
              size="sm"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          )}

          {showContact && onContact && (
            <Button
              onClick={onContact}
              variant="outline"
              className="border-emerald-400 text-emerald-100 hover:bg-emerald-900/30 gap-2"
              size="sm"
            >
              <Mail className="w-4 h-4" />
              Contact Us
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorState;
