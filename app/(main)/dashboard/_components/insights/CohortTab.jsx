"use client";
import React from "react";
import { RetentionTab } from "./RetentionTab";
import { useProject } from "@/app/_context/ProjectContext";

export const CohortTab = () => {
  const { activeProject } = useProject();

  if (!activeProject) {
    return <div className="text-slate-500">No project selected</div>;
  }

  return <RetentionTab projectId={activeProject._id} />;
};
