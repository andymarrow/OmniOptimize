"use client";
import React, { useState } from "react";
import { Check, ChevronsUpDown, PlusCircle, LayoutGrid, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useProject } from "@/app/_context/ProjectContext";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator,
} from "@/components/ui/command";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ProjectSwitcher({ className }) {
  const { projects, activeProject, setActiveProject, isLoading } = useProject();
  const createProject = useMutation(api.projects.create);
  
  const [open, setOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectUrl, setNewProjectUrl] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    try {
        await createProject({ name: newProjectName, url: newProjectUrl });
        setShowCreateModal(false);
        setNewProjectName("");
        setNewProjectUrl("");
    } catch (error) {
        console.error("Failed to create project", error);
    } finally {
        setIsCreating(false);
    }
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label="Select a project"
            className={cn(
                "w-[200px] justify-between h-9 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800", // Fix Text & BG Color
                className
            )}
          >
            {isLoading ? (
                <span className="text-xs text-slate-500">Loading...</span>
            ) : activeProject ? (
                <div className="flex items-center gap-2 truncate">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="truncate font-medium">{activeProject.name}</span>
                </div>
            ) : (
                <span className="text-slate-500 dark:text-slate-400">Select Project</span>
            )}
            <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50 text-slate-500 dark:text-slate-400" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
          <Command className="bg-white dark:bg-slate-950">
            <CommandList>
              <CommandInput placeholder="Search project..." className="text-slate-900 dark:text-white placeholder:text-slate-500" />
              <CommandEmpty className="py-2 text-center text-sm text-slate-500">No project found.</CommandEmpty>
              <CommandGroup heading="My Projects" className="text-slate-500 dark:text-slate-400">
                {projects?.map((project) => (
                  <CommandItem
                    key={project._id}
                    onSelect={() => {
                      setActiveProject(project);
                      setOpen(false);
                    }}
                    className="text-sm cursor-pointer aria-selected:bg-slate-100 dark:aria-selected:bg-slate-900 text-slate-700 dark:text-slate-200"
                  >
                    <LayoutGrid className="mr-2 h-4 w-4 text-slate-500" />
                    {project.name}
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        activeProject?._id === project._id ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
            <CommandSeparator className="bg-slate-200 dark:bg-slate-800" />
            <CommandList>
              <CommandGroup>
                <CommandItem 
                    className="cursor-pointer aria-selected:bg-slate-100 dark:aria-selected:bg-slate-900 text-slate-700 dark:text-slate-200"
                    onSelect={() => {
                        setOpen(false);
                        setShowCreateModal(true);
                    }}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Project
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* CREATE PROJECT MODAL */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
            <DialogHeader>
                <DialogTitle>Create Project</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="grid gap-4 py-4">
                <div className="grid gap-2">
                    <Label htmlFor="name" className="text-slate-700 dark:text-slate-300">Project Name</Label>
                    <Input 
                        id="name" 
                        placeholder="My Awesome App" 
                        value={newProjectName}
                        onChange={(e) => setNewProjectName(e.target.value)}
                        className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400"
                        required 
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="url" className="text-slate-700 dark:text-slate-300">Website URL</Label>
                    <Input 
                        id="url" 
                        placeholder="https://example.com" 
                        value={newProjectUrl}
                        onChange={(e) => setNewProjectUrl(e.target.value)}
                        className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400"
                        required 
                    />
                </div>
                <DialogFooter>
                    <Button type="submit" disabled={isCreating} className="text-white dark:text-black bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200">
                        {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
      </Dialog>
    </>
  );
}