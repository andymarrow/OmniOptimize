import { useState, useRef, useEffect } from "react";
import { useHeatmap } from "@/api";
import { useHeatmapStore } from "@/store";
import { mockHeatmapData } from "@/data";
import Heatmap from "visual-heatmap";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function HeatmapPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heatmapRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [urlInput, setUrlInput] = useState("");
  const [hoveredPoint, setHoveredPoint] = useState<any>(null);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const { selectedProjectId, setSelectedUrl, selectedUrl } = useHeatmapStore();
  const {
    data: apiData,
    isLoading,
    error,
  } = useHeatmap(selectedProjectId, selectedUrl);

  // Use API data if available, fallback to mock data when no URL is selected
  const heatmapData = apiData || (selectedUrl ? null : mockHeatmapData);

  const handleFetchHeatmap = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      setSelectedUrl(urlInput.trim());
    }
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setBackgroundImage(dataUrl);

      // Get image dimensions
      const img = new Image();
      img.onload = () => {
        setImageDimensions({ width: img.width, height: img.height });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setBackgroundImage(null);
    setImageDimensions(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Initialize and update visual-heatmap when data changes
  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous heatmap on every data change
    if (heatmapRef.current) {
      containerRef.current.innerHTML = "";
      heatmapRef.current = null;
    }

    // Don't render if no data or empty grid
    if (!heatmapData?.grid || heatmapData.grid.length === 0) return;

    // Get container dimensions
    const rect = containerRef.current.getBoundingClientRect();
    const containerWidth = rect.width || 800;
    const containerHeight = imageDimensions?.height
      ? Math.round(
          (containerWidth / imageDimensions.width) * imageDimensions.height
        )
      : 500;

    // Build heatmap config
    const heatmapConfig: any = {
      size: 50, // Radius of data point in pixels
      max: Math.max(...heatmapData.grid.map((p) => p.count), 1),
      min: 0,
      intensity: 0.5,
      gradient: [
        { color: [49, 54, 149, 0.0], offset: 0 }, // transparent dark blue
        { color: [49, 54, 149, 0.7], offset: 0.1 }, // dark blue
        { color: [69, 117, 180, 0.7], offset: 0.2 }, // blue
        { color: [116, 173, 209, 0.7], offset: 0.3 }, // light blue
        { color: [171, 217, 233, 0.7], offset: 0.4 }, // lighter blue
        { color: [224, 243, 248, 0.7], offset: 0.5 }, // very light blue
        { color: [255, 255, 191, 0.7], offset: 0.6 }, // yellow
        { color: [254, 224, 144, 0.7], offset: 0.7 }, // light orange
        { color: [253, 174, 97, 0.7], offset: 0.8 }, // orange
        { color: [244, 109, 67, 0.7], offset: 0.9 }, // red-orange
        { color: [215, 48, 39, 0.7], offset: 0.95 }, // red
        { color: [165, 0, 38, 0.7], offset: 1.0 }, // dark red
      ],
    };

    // Add background image if uploaded
    if (backgroundImage && imageDimensions) {
      heatmapConfig.backgroundImage = {
        url: backgroundImage,
        width: containerWidth,
        height: containerHeight,
      };
    }

    // Create visual-heatmap instance with Gaussian blur
    heatmapRef.current = Heatmap(containerRef.current, heatmapConfig);

    // Convert normalized coordinates to pixel coordinates
    const heatmapPoints = heatmapData.grid.map((point) => ({
      x: Math.round(point.xNorm * containerWidth),
      y: Math.round(point.yNorm * containerHeight),
      value: point.count,
    }));

    // Render the heatmap
    heatmapRef.current.renderData(heatmapPoints);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
      heatmapRef.current = null;
    };
  }, [heatmapData, selectedUrl, backgroundImage, imageDimensions]);

  // Calculate container height based on image aspect ratio
  const getContainerHeight = () => {
    if (!imageDimensions) return "500px";
    const containerWidth =
      containerRef.current?.getBoundingClientRect().width || 800;
    const aspectRatio = imageDimensions.height / imageDimensions.width;
    return `${Math.round(containerWidth * aspectRatio)}px`;
  };

  // Handle hover for detailed tooltips
  const handleContainerHover = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!heatmapData?.grid || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Scale to normalized coordinates
    const normX = x / rect.width;
    const normY = y / rect.height;

    // Find nearby grid points (within 10% of container)
    const nearby = heatmapData.grid.filter((point) => {
      const dist = Math.sqrt(
        (normX - point.xNorm) ** 2 + (normY - point.yNorm) ** 2
      );
      return dist < 0.1;
    });

    setHoveredPoint(nearby.length > 0 ? nearby[0] : null);
  };

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Heatmap Visualization</CardTitle>
          <CardDescription>
            Click heatmap with Gaussian blur - overlay on page screenshots
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* URL Input Form */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <form onSubmit={handleFetchHeatmap} className="flex gap-2 flex-1">
                <Input
                  type="url"
                  placeholder="e.g., http://localhost:5174/products"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" disabled={!urlInput.trim()}>
                  Fetch Heatmap
                </Button>
              </form>
            </div>

            {/* Image Upload */}
            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="screenshot-upload"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                {backgroundImage ? "Change Screenshot" : "Upload Screenshot"}
              </Button>
              {backgroundImage && (
                <>
                  <span className="text-xs text-muted-foreground">
                    {imageDimensions?.width} × {imageDimensions?.height}px
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveImage}
                    className="text-destructive hover:text-destructive"
                  >
                    Remove
                  </Button>
                </>
              )}
            </div>

            {/* Data Source Notice */}
            {apiData ? (
              <div className="text-xs text-green-600 bg-green-50 p-2 rounded border border-green-200">
                Displaying live data for: <strong>{selectedUrl}</strong>
              </div>
            ) : selectedUrl && isLoading ? null : (
              <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded border border-blue-200">
                Enter a URL to fetch heatmap data from the API. Showing mock
                data preview.
              </div>
            )}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              Loading heatmap data...
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="rounded-lg bg-destructive/10 p-4 text-destructive">
              <p className="font-semibold">Failed to load heatmap</p>
              <p className="text-sm">
                {error instanceof Error ? error.message : "Unknown error"}
              </p>
            </div>
          )}

          {/* Visual Heatmap Visualization */}
          {heatmapData && (
            <div className="space-y-4">
              <div className="rounded-lg border border-border overflow-hidden bg-white relative">
                <div
                  ref={containerRef}
                  style={{
                    height: imageDimensions ? getContainerHeight() : "500px",
                    width: "100%",
                    minHeight: "300px",
                    maxHeight: "800px",
                  }}
                  onMouseMove={handleContainerHover}
                  onMouseLeave={() => setHoveredPoint(null)}
                />

                {/* Hover tooltip */}
                {hoveredPoint && (
                  <div className="absolute top-4 right-4 bg-white/95 border border-border rounded-lg p-3 shadow-lg text-sm">
                    <p className="font-semibold mb-1">Click Details</p>
                    <p>
                      Element:{" "}
                      <code className="text-xs bg-muted px-1 rounded">
                        {hoveredPoint.tagName}
                      </code>
                    </p>
                    <p>Clicks: {hoveredPoint.count}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-48">
                      {hoveredPoint.selector}
                    </p>
                  </div>
                )}
              </div>

              {/* Heatmap Info */}
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Total Clicks</p>
                  <p className="text-lg font-semibold">
                    {heatmapData.clickCount}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    Unique Elements
                  </p>
                  <p className="text-lg font-semibold">
                    {heatmapData.grid.length}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Page Size</p>
                  <p className="text-lg font-semibold">
                    {heatmapData.pageWidth} × {heatmapData.pageHeight}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    Most Clicked Element
                  </p>
                  <p className="text-lg font-semibold">
                    {heatmapData.grid.reduce(
                      (max, p) => (p.count > max.count ? p : max),
                      heatmapData.grid[0]
                    )?.tagName || "N/A"}
                  </p>
                </div>
              </div>

              {/* Click Details Table */}
              <div className="rounded-lg border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium">
                        Element
                      </th>
                      <th className="px-4 py-2 text-left font-medium">
                        Selector
                      </th>
                      <th className="px-4 py-2 text-right font-medium">
                        Clicks
                      </th>
                      <th className="px-4 py-2 text-right font-medium">
                        Position
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {heatmapData.grid
                      .sort((a, b) => b.count - a.count)
                      .slice(0, 10)
                      .map((point, i) => (
                        <tr
                          key={i}
                          className="border-t border-border hover:bg-muted/30"
                        >
                          <td className="px-4 py-2">
                            <code className="text-xs bg-muted px-1 rounded">
                              {point.tagName}
                            </code>
                          </td>
                          <td className="px-4 py-2 truncate max-w-48 text-muted-foreground">
                            {point.selector}
                          </td>
                          <td className="px-4 py-2 text-right font-medium">
                            {point.count}
                          </td>
                          <td className="px-4 py-2 text-right text-muted-foreground">
                            ({Math.round(point.xNorm * 100)}%,{" "}
                            {Math.round(point.yNorm * 100)}%)
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
