"use client";
import React, { useEffect, useRef } from "react";
import Heatmap from "visual-heatmap";

const HeatmapCanvas = ({ data, page, device, backgroundImage }) => {
  const containerRef = useRef(null);
  const heatmapInstance = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !data || !data.grid) return;

    // Clear previous instance
    if (heatmapInstance.current) {
      containerRef.current.innerHTML = "";
    }

    // Initialize heatmap
    const heatmapConfig = {
      size: 50, //Radius of the data point, in pixels. Default: 20
      intensity: 1.0,
      gradient: [
        {
          color: [0, 0, 0, 0.0],
          offset: 0,
        },
        {
          color: [0, 0, 255, 0.32],
          offset: 0.2,
        },
        {
          color: [0, 255, 0, 0.65],
          offset: 0.45,
        },
        {
          color: [255, 255, 0, 1.0],
          offset: 0.85,
        },
        {
          color: [255, 0, 0, 1.0],
          offset: 1.0,
        },
      ],
    };

    // Add background image if provided
    if (backgroundImage) {
      heatmapConfig.backgroundImage = {
        url: backgroundImage,
        width: data.pageWidth,
        height: data.pageHeight,
        x: 0,
        y: 0,
      };
    }

    heatmapInstance.current = new Heatmap(containerRef.current, heatmapConfig);

    // Convert backend grid data to heatmap points
    const points = data.grid.map((cell) => ({
      x: cell.xNorm * data.pageWidth,
      y: cell.yNorm * data.pageHeight,
      value: cell.count,
    }));
    console.log("Heatmap points:", data);

    // Add points to heatmap
    heatmapInstance.current.renderData(points);

    // Render
    heatmapInstance.current.render();
  }, [data, backgroundImage]);

  return (
    <div
      ref={containerRef}
      style={{
        minWidth: data.pageWidth,
        minHeight: data.pageHeight,
        position: "relative",
        backgroundColor: "white",
        borderRadius: device === "mobile" ? "2rem" : "0.5rem",
        border: device === "mobile" ? "6px solid #1f2937" : "1px solid #e5e7eb",
        overflow: "auto",
      }}
      className="dark:bg-slate-900 dark:border-slate-800"
    />
  );
};

export default HeatmapCanvas;
