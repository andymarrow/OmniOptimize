"use client";
import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MousePointer2,
  Smartphone,
  Monitor,
  X,
  ChevronDown,
  Check,
  Plus,
  AlertCircle,
  Loader2,
  Upload,
  Trash2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import HeatmapCanvas from "./HeatmapCanvas";
import HeatmapSkeleton from "./HeatmapSkeleton";
import toast from "react-hot-toast";

const HeatmapGalleryModal = ({ isOpen, onClose, projectId }) => {
  const [selectedPageIndex, setSelectedPageIndex] = useState(0);
  const [device, setDevice] = useState("desktop");
  const [showAddPageInput, setShowAddPageInput] = useState(false);
  const [newPageUrl, setNewPageUrl] = useState("");
  const [editIndex, setEditIndex] = useState(null);
  const [editUrl, setEditUrl] = useState("");
  const [backgroundImage, setBackgroundImage] = useState(null);
  const fileInputRef = React.useRef(null);

  // Fetch project with pages
  const project = useQuery(api.projects.getProject, { projectId });
  const pages = project?.pages || [];
  const selectedPage = pages[selectedPageIndex] || null;

  // Mutations
  const addPage = useMutation(api.analytics.addHeatmapPage);
  const updatePage = useMutation(api.analytics.updateHeatmapPage);
  const fetchHeatmapData = useAction(api.analytics.fetchHeatmapData);

  const [heatmapData, setHeatmapData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch heatmap when page changes
  useEffect(() => {
    if (!selectedPage) return;

    setLoading(true);
    setError(null);

    fetchHeatmapData({
      projectId,
      fullUrl: selectedPage.fullUrl,
    })
      .then((data) => {
        setHeatmapData(data);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [selectedPage, projectId, fetchHeatmapData]);

  const handleAddPage = async () => {
    if (!newPageUrl) return;

    try {
      const urlObj = new URL(newPageUrl);
      const route = urlObj.pathname || "/";
      await addPage({ projectId, route, fullUrl: newPageUrl });
      setNewPageUrl("");
      setShowAddPageInput(false);
    } catch (err) {
      toast.error(
        err.message === "Invalid URL"
          ? "Please enter a valid URL"
          : `Failed to add page: ${err.message}`,
      );
    }
  };

  const startEditPage = (idx) => {
    setEditIndex(idx);
    setEditUrl(pages[idx].fullUrl || "");
  };

  const cancelEdit = () => {
    setEditIndex(null);
    setEditUrl("");
  };

  const saveEdit = async () => {
    if (editIndex === null) return;
    try {
      await updatePage({ projectId, index: editIndex, fullUrl: editUrl });
      cancelEdit();
      toast.success("Page updated");
    } catch (err) {
      toast.error(err.message || "Failed to update page");
    }
  };

  // Handle image file upload
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file is an image
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file");
      return;
    }

    // Convert file to blob URL and extract dimensions
    const blobUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setBackgroundImage({
        url: blobUrl,
        width: img.width,
        height: img.height,
      });
    };
    img.onerror = () => {
      toast.error("Failed to load image");
    };
    img.src = blobUrl;
  };

  // Clear background image
  const handleClearImage = () => {
    setBackgroundImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (!project) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[100vw] w-full h-[100dvh] md:h-[90vh] md:max-w-[95vw] md:w-[1400px] p-0 overflow-hidden bg-slate-50 dark:bg-[#020617] border-0 md:border md:border-slate-200 dark:md:border-slate-800 flex flex-col md:rounded-xl text-foreground">
        {/* HEADER */}
        <div className="px-4 py-3 md:px-6 md:py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shrink-0 z-20">
          <div className="flex flex-col md:flex-row md:items-center gap-4 w-full md:w-auto">
            <div className="flex items-center justify-between w-full md:w-auto gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg shrink-0">
                  <MousePointer2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
                    Heatmaps
                  </DialogTitle>
                  <p className="text-xs text-slate-500 hidden md:block">
                    User click visualization
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="md:hidden p-2 text-slate-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* MOBILE: Page Selector */}
            <div className="md:hidden w-full">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    <span className="truncate">
                      {selectedPage?.route || "Select page"}
                    </span>
                    <ChevronDown className="w-4 h-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[calc(100vw-32px)]">
                  {pages.map((page, idx) => (
                    <DropdownMenuItem
                      key={idx}
                      onSelect={() => setSelectedPageIndex(idx)}
                    >
                      <span className="flex-1">{page.route}</span>
                      {selectedPageIndex === idx && (
                        <Check className="w-4 h-4" />
                      )}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuItem onSelect={() => setShowAddPageInput(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Page
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Desktop Controls */}
          <div className="flex flex-col md:flex-row items-start md:items-center w-full md:w-auto gap-4">
            {/* Device Toggle */}
            <Tabs
              defaultValue="desktop"
              onValueChange={setDevice}
              className="w-full md:w-auto"
            >
              <TabsList className="grid w-full md:w-[180px] grid-cols-2">
                <TabsTrigger value="desktop">
                  <Monitor className="w-4 h-4 mr-2" /> Desk
                </TabsTrigger>
                <TabsTrigger value="mobile">
                  <Smartphone className="w-4 h-4 mr-2" /> Mob
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Image Upload Controls */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                aria-label="Upload background image"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 md:flex-none"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Image
              </Button>
              {backgroundImage && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleClearImage}
                  className="flex-1 md:flex-none text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* MAIN BODY */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* DESKTOP SIDEBAR */}
          <div className="hidden md:flex w-80 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex-col shrink-0">
            <div className="p-4 space-y-3 border-b border-slate-200 dark:border-slate-800">
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() => setShowAddPageInput(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Page
              </Button>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-3 space-y-2">
                {pages.map((page, idx) => (
                  <div
                    key={idx}
                    onDoubleClick={() => startEditPage(idx)}
                    className={`w-full text-left p-3 rounded-xl transition-all border cursor-pointer ${
                      selectedPageIndex === idx
                        ? "bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-700 shadow-sm"
                        : "border-transparent hover:bg-slate-50 dark:hover:bg-slate-900/50"
                    }`}
                    onClick={() => setSelectedPageIndex(idx)}
                  >
                    {editIndex === idx ? (
                      <div className="space-y-2">
                        <Input
                          autoFocus
                          value={editUrl}
                          onChange={(e) => setEditUrl(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveEdit();
                            if (e.key === "Escape") cancelEdit();
                          }}
                          onBlur={cancelEdit}
                          placeholder="https://example.com/products"
                          className="text-sm"
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onMouseDown={saveEdit}
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onMouseDown={cancelEdit}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-start mb-1">
                          <span
                            className={`font-semibold text-sm ${
                              selectedPageIndex === idx
                                ? "text-slate-900 dark:text-white"
                                : "text-slate-600 dark:text-slate-400"
                            }`}
                          >
                            {page.route}
                          </span>
                          {page.isDefault && (
                            <Badge
                              variant="secondary"
                              className="text-[10px] h-5"
                            >
                              Default
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 truncate">
                          {page.fullUrl}
                        </p>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* MAIN AREA: HEATMAP */}
          <div className="flex-1 bg-slate-100 dark:bg-[#0B1120] relative flex justify-center p-2 md:p-8 overflow-auto">
            {loading && <HeatmapSkeleton />}
            {error && (
              <div className="flex flex-col items-center gap-2 text-center">
                <AlertCircle className="w-8 h-8 text-red-500" />
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {error === "No heatmap data available for this page"
                    ? "No heatmap data available for this page yet"
                    : error}
                </p>
              </div>
            )}
            {!loading && !error && selectedPage && heatmapData && (
              <HeatmapCanvas
                data={heatmapData}
                page={selectedPage}
                device={device}
                backgroundImage={backgroundImage}
              />
            )}
          </div>
        </div>

        {/* Add Page Modal */}
        {showAddPageInput && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-lg p-6 w-full max-w-md">
              <h3 className="font-bold text-lg mb-4 text-slate-900 dark:text-white">
                Add New Page
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Full URL
                  </label>
                  <Input
                    placeholder="https://example.com/products"
                    value={newPageUrl}
                    onChange={(e) => setNewPageUrl(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setShowAddPageInput(false);
                      setNewPageUrl("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleAddPage}
                    disabled={!newPageUrl}
                  >
                    Add Page
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default HeatmapGalleryModal;
