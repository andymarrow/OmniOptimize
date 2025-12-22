import { HeatmapGridPoint } from "@/types";

/**
 * Simple Gaussian blur using convolution
 * Used to smooth heatmap intensity values
 */
export function applyGaussianBlur(
  canvas: HTMLCanvasElement,
  radius: number = 20
): HTMLCanvasElement {
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const width = canvas.width;
  const height = canvas.height;

  // Create blurred copy
  const blurredData = new Uint8ClampedArray(data);

  // Simple box blur (faster than true Gaussian)
  const r = Math.floor(radius);
  for (let i = 0; i < 4; i++) {
    for (let y = r; y < height - r; y++) {
      for (let x = r; x < width - r; x++) {
        let sum = 0;
        for (let dy = -r; dy <= r; dy++) {
          for (let dx = -r; dx <= r; dx++) {
            const idx = ((y + dy) * width + (x + dx)) * 4 + i;
            sum += data[idx];
          }
        }
        const idx = (y * width + x) * 4 + i;
        blurredData[idx] = Math.round(sum / ((2 * r + 1) * (2 * r + 1)));
      }
    }
  }

  const blurredImageData = new ImageData(blurredData, width, height);
  ctx.putImageData(blurredImageData, 0, 0);

  return canvas;
}

/**
 * Convert HSL to RGB for heatmap coloring
 * h: 0-360, s: 0-100, l: 0-100
 */
export function hslToRgb(
  h: number,
  s: number,
  l: number
): [number, number, number] {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0,
    g = 0,
    b = 0;

  if (h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    g = 0;
    b = c;
  } else {
    r = c;
    g = 0;
    b = x;
  }

  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ];
}

/**
 * Map intensity (0-1) to heatmap color (blue → red)
 */
export function intensityToColor(intensity: number): string {
  // Map intensity to hue: 240 (blue) → 0 (red)
  const hue = 240 * (1 - Math.max(0, Math.min(1, intensity)));
  const [r, g, b] = hslToRgb(hue, 100, 50);
  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Render heatmap grid to canvas with Gaussian blur effect
 */
export function renderHeatmapToCanvas(
  canvas: HTMLCanvasElement,
  gridPoints: HeatmapGridPoint[],
  pageWidth: number,
  pageHeight: number,
  gridSize: number
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Set canvas size
  const padding = 60;
  canvas.width = pageWidth + padding * 2;
  canvas.height = pageHeight + padding * 2;

  // Fill background
  ctx.fillStyle = "#f5f5f5";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw axes
  ctx.strokeStyle = "#ccc";
  ctx.lineWidth = 1;
  ctx.font = "12px sans-serif";
  ctx.fillStyle = "#66768";

  // X axis
  ctx.beginPath();
  ctx.moveTo(padding, padding + pageHeight);
  ctx.lineTo(padding + pageWidth, padding + pageHeight);
  ctx.stroke();

  // Y axis
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, padding + pageHeight);
  ctx.stroke();

  // Find max count for normalization
  const maxCount = Math.max(...gridPoints.map((p) => p.count), 1);

  // Draw grid points with Gaussian blur using radial gradients
  gridPoints.forEach((point) => {
    const x = padding + point.xNorm * pageWidth;
    const y = padding + point.yNorm * pageHeight;
    const intensity = point.count / maxCount;
    const radius = Math.max(8, intensity * 25); // Blur radius scales with intensity

    // Create radial gradient for Gaussian blur effect
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);

    // Get color for this intensity
    const color = intensityToColor(intensity);
    const opacity = Math.max(0.5, intensity);

    // Parse RGB from intensityToColor output
    const rgbMatch = color.match(/\d+/g);
    if (rgbMatch && rgbMatch.length >= 3) {
      const r = rgbMatch[0];
      const g = rgbMatch[1];
      const b = rgbMatch[2];

      // Create gradient: opaque at center, fade to transparent at edges
      gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${opacity})`);
      gradient.addColorStop(0.6, `rgba(${r}, ${g}, ${b}, ${opacity * 0.5})`);
      gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  // Draw axis labels
  ctx.fillStyle = "#666";
  ctx.textAlign = "center";
  ctx.fillText("Width →", padding + pageWidth / 2, padding + pageHeight + 40);

  ctx.save();
  ctx.translate(padding - 40, padding + pageHeight / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = "center";
  ctx.fillText("Height ↓", 0, 0);
  ctx.restore();

  // Grid info
  ctx.fillStyle = "#999";
  ctx.font = "11px monospace";
  ctx.textAlign = "left";
  ctx.fillText(
    `Grid: ${gridSize}px | Points: ${gridPoints.length} | Max: ${maxCount} clicks`,
    padding + 10,
    padding - 10
  );
}
