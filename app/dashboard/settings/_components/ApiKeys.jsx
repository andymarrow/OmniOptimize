"use client";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { CopyableField } from "@/components/CopyableField";
import { useProject } from "@/app/_context/ProjectContext";

const ApiKeys = () => {
  const { activeProject } = useProject();

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader>
          <CardTitle>Project & API Keys</CardTitle>
          <CardDescription>
            Use these credentials to authenticate requests from your
            application.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Project ID */}
          <CopyableField
            label="Project ID"
            value={activeProject?._id || "Loading..."}
            description="Unique identifier for your project. Required for API requests."
          />

          {/* Publishable Key */}
          <CopyableField
            label="Publishable Key"
            value="pk_live_51Mx8s9D8s7F6G5H4J3K2L1"
            description="Safe to include in client-side code (React/Next.js)."
          />

          {/* Secret Key */}
          <CopyableField
            label="Secret Key"
            value="sk_live_51Mx8s9D8s7F6G5H4J3K2L1_VERY_SECRET"
            secret={true}
            warning="Never share your secret key or commit it to GitHub."
          />
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200 dark:border-red-900/30 shadow-sm">
        <CardHeader>
          <CardTitle className="text-red-600 dark:text-red-400 text-base">
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900 dark:text-white">
                Roll API Keys
              </p>
              <p className="text-sm text-slate-500">
                This will invalidate existing keys immediately.
              </p>
            </div>
            <Button variant="destructive" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" /> Roll Keys
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiKeys;
