"use client";
import React, { useEffect, useRef } from "react";
import h337 from "heatmap.js";

const HeatmapCanvas = ({ data, page, device, backgroundImage }) => {
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const heatmapRef = useRef(null);
  const heatmapContainerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !data || !data.grid) return;

    // Determine canvas dimensions based on background image or recorded page size
    const imageWidth = backgroundImage?.width || data.pageWidth;
    const imageHeight = backgroundImage?.height || data.pageHeight;

    // Calculate scaling factors to map normalized coordinates to pixel positions
    // If screenshot size differs from recorded page dimensions, scale proportionally
    const scaleX = imageWidth / data.pageWidth;
    const scaleY = imageHeight / data.pageHeight;

    // Clear previous heatmap container if it exists
    if (heatmapContainerRef.current && heatmapContainerRef.current.parentNode) {
      heatmapContainerRef.current.parentNode.removeChild(
        heatmapContainerRef.current,
      );
      heatmapContainerRef.current = null;
    }

    // Create heatmap container
    const heatmapWrapper = document.createElement("div");
    heatmapWrapper.style.top = "0";
    heatmapWrapper.style.left = "0";
    heatmapWrapper.style.width = `${imageWidth}px`;
    heatmapWrapper.style.height = `${imageHeight}px`;
    heatmapWrapper.style.pointerEvents = "none";
    heatmapWrapper.style.zIndex = "10";
    containerRef.current.appendChild(heatmapWrapper);
    heatmapContainerRef.current = heatmapWrapper;

    // Create heatmap instance with custom gradient (blue → green → yellow → red)
    heatmapRef.current = h337.create({
      container: heatmapContainerRef.current,
      radius: 50,
      maxOpacity: 0.8,
      minOpacity: 0,
      blur: 0.85,
      gradient: {
        0.0: "#0000ff",
        0.2: "#00ffff",
        0.45: "#00ff00",
        0.65: "#ffff00",
        0.85: "#ff8800",
        1.0: "#ff0000",
      },
    });

    // Force position back to absolute (heatmap.js resets it to relative)
    heatmapContainerRef.current.style.position = "absolute";

    // Convert backend grid data to heatmap.js format with scaling applied
    const maxCount = Math.max(...data.grid.map((cell) => cell.count), 1);

    const points = data.grid.map((cell) => ({
      x: Math.round(cell.xNorm * data.pageWidth * scaleX),
      y: Math.round(cell.yNorm * data.pageHeight * scaleY),
      value: cell.count,
    }));

    // Set heatmap data
    heatmapRef.current.setData({
      max: maxCount,
      data: points,
    });
  }, [data, backgroundImage]);

  return (
    <div
      id="heatmap-container"
      ref={containerRef}
      style={{
        minWidth: backgroundImage?.width
          ? `${backgroundImage.width}px`
          : `${data?.pageWidth}px`,
        minHeight: backgroundImage?.height
          ? `${backgroundImage.height}px`
          : `${data?.pageHeight}px`,
        position: "relative",
        backgroundColor: "white",
        borderRadius: device === "mobile" ? "2rem" : "0.5rem",
        border: device === "mobile" ? "6px solid #1f2937" : "1px solid #e5e7eb",
        overflow: "auto",
      }}
      className="dark:bg-slate-900 dark:border-slate-800"
    >
      {backgroundImage?.url ? (
        <img
          ref={imageRef}
          src={backgroundImage.url}
          alt="Page screenshot"
          style={{
            display: "block",
            width: `${backgroundImage.width}px`,
            height: `${backgroundImage.height}px`,
            position: "relative",
            zIndex: "1",
          }}
          onError={(e) =>
            console.error("Image failed to load:", backgroundImage.url, e)
          }
          onLoad={() => console.log("Image loaded successfully")}
        />
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#999",
          }}
        >
          No image provided
        </div>
      )}
    </div>
  );
};

export default HeatmapCanvas;
