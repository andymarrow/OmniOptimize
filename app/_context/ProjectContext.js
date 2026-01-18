"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUrlOrLocalStorageState } from "@/hooks/useUrlOrLocalStorageState";

const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  // Fetch all projects for this user
  const projects = useQuery(api.projects.getMyProjects);
  const [activeProject, setActiveProject] = useState(null);
  const [activeProjectId, setActiveProjectId, isReady] =
    useUrlOrLocalStorageState("projectId", "projectId", "");

  // Auto-select the first project when data loads
  // Sync active project from URL > localStorage > default first project
  useEffect(() => {
    if (!projects || projects.length === 0 || !isReady) return;

    // If current id matches a project, set it
    const found = projects.find((p) => p._id === activeProjectId);
    if (found) {
      if (!activeProject || activeProject._id !== found._id) {
        setActiveProjectId(found?._id || "");
        setActiveProject(found);
      }
      return;
    }

    // Fallback to first project
    const fallback = projects[0];
    setActiveProject(fallback);
    setActiveProjectId(fallback?._id || "");
  }, [projects, activeProjectId, isReady, activeProject, setActiveProjectId]);

  const handleSetActiveProject = (project) => {
    setActiveProject(project);
    setActiveProjectId(project?._id || "");
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        activeProject,
        setActiveProject: handleSetActiveProject,
        isLoading: projects === undefined || !isReady,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => useContext(ProjectContext);
