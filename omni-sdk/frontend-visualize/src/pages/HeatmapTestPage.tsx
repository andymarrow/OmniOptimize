import { useRef, useEffect } from "react";
import Heatmap from "visual-heatmap";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function HeatmapTestPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heatmapRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create visual-heatmap instance
    heatmapRef.current = Heatmap(containerRef.current, {
      size: 40, // Radius of data point in pixels
      max: 100,
      min: 0,
      intensity: 1.0,
      gradient: [
        { color: [59, 130, 246, 0.0], offset: 0 }, // transparent blue at 0
        { color: [59, 130, 246, 1.0], offset: 0.2 }, // blue
        { color: [6, 182, 212, 1.0], offset: 0.4 }, // cyan
        { color: [16, 185, 129, 1.0], offset: 0.6 }, // green
        { color: [245, 158, 11, 1.0], offset: 0.8 }, // amber
        { color: [239, 68, 68, 1.0], offset: 1.0 }, // red
      ],
    });

    // Test data points (pixel coordinates)
    const testData = [
      { x: 100, y: 150, value: 50 },
      { x: 200, y: 200, value: 100 },
      { x: 300, y: 150, value: 75 },
      { x: 400, y: 250, value: 60 },
      { x: 500, y: 200, value: 80 },
      { x: 600, y: 300, value: 45 },
      { x: 700, y: 250, value: 90 },
    ];

    // Render the heatmap with data
    heatmapRef.current.renderData(testData);

    return () => {
      // Cleanup
      if (heatmapRef.current) {
        heatmapRef.current = null;
      }
    };
  }, []);

  return (
    <div className="w-full space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Visual Heatmap Test</CardTitle>
          <CardDescription>
            Gaussian blur heatmap using visual-heatmap library
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-border overflow-hidden bg-white">
            <div
              ref={containerRef}
              style={{ height: "500px", width: "100%" }}
            />
          </div>
          <div className="text-sm text-muted-foreground">
            <p>Displaying 7 test points with Gaussian blur</p>
            <p>Color gradient: Blue (low) → Red (high)</p>
            <p>Can be overlaid on page screenshots</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
