import React from "react";
import CodeHeader from "./_components/CodeHeader";
import SecurityStats from "./_components/SecurityStats";
import CommitLog from "./_components/CommitLog";

export const metadata = {
  title: "Code Health | OmniOptimize",
  description: "Automated security scanning and code quality analysis.",
};

export default function CodePage() {
  return (
    <div className="space-y-6">
      <CodeHeader />
      <SecurityStats />
      <CommitLog />
    </div>
  );
}