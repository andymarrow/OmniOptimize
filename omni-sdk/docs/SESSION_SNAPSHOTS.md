# Session Snapshots, Heatmaps & Retention Metrics Guide

## Overview

The Omni Analytics SDK now includes comprehensive session replay and heatmap capabilities through:

1. **RrWeb Integration** - Automatic DOM capture and interaction tracking for session replay
2. **Heatmap Data** - Normalized click coordinates and layout hashing for responsive heatmap analysis
3. **Retention Metrics** - Periodic snapshots for funnel and retention analysis

This guide explains how to set up and use these features.

---

## 1. Basic Setup

### Install RrWeb (Required for Session Replay)

First, add rrweb to your HTML via CDN:

```html
<!-- Add before your app script -->
<script src="https://cdn.jsdelivr.net/npm/rrweb@2.0.0/dist/rrweb.min.js"></script>
```

Or install via npm:

```bash
npm install rrweb
```

### Initialize the SDK with Snapshots

```typescript
import { initializeSDK } from "@omni-analytics/sdk";

const { tracker } = await initializeSDK({
  projectId: "my-project",
  endpoint: "https://api.example.com/events",

  // Enable snapshots
  snapshot: {
    enabled: true,
    captureInitial: true, // Capture on page load
    captureMutations: true, // Capture on DOM changes
    capturePeriodic: true, // Capture at intervals
    mutationThrottleMs: 3000, // Throttle mutation captures
    periodicIntervalMs: 60000, // 1 minute intervals
    maxSnapshotSizeBytes: 512 * 1024, // 512KB max
  },

  // Privacy settings
  privacy: {
    blockSelectors: [".no-track", "[data-no-track]"],
    maskSelectors: [".sensitive"],
    maxNodeTextLength: 200,
  },
});
```

---

## 2. Session Snapshot Plugin

The `SessionSnapshotPlugin` automatically captures snapshots with minimal configuration.

### Plugin Options

```typescript
import { SessionSnapshotPlugin } from "@omni-analytics/sdk";

const snapshotPlugin = new SessionSnapshotPlugin({
  useRrweb: true, // Enable rrweb integration (default: true)
  useFallbackSnapshots: true, // Fall back to manual snapshots if rrweb unavailable
  debug: true, // Enable debug logging
});

const { tracker, container } = await initializeSDK(config, {
  plugins: [snapshotPlugin],
});
```

### How It Works

1. **RrWeb Mode** (if available):

   - Automatically captures all DOM mutations
   - Tracks clicks, scrolls, inputs, and form changes
   - Sends raw rrweb events to backend for session replay

2. **Fallback Mode** (if rrweb unavailable):
   - Captures initial snapshots on page load
   - Captures on significant layout mutations
   - Sends periodic snapshots at configured intervals

### Check Plugin Status

```typescript
const snapshotPlugin = container
  .getPluginRegistry()
  .getPlugins()
  .find((p) => p.name === "session-snapshot");

console.log(snapshotPlugin.getStatus());
// Output:
// {
//   name: "session-snapshot",
//   version: "1.0.0",
//   initialized: true,
//   rrwebActive: true,
//   capturedClicks: 5
// }
```

---

## 3. Event Types

### SessionSnapshotEvent (For Heatmaps & Replay)

```typescript
{
  type: "session_snapshot",
  snapshotType: "initial" | "mutation" | "periodic" | "rrweb",
  timestamp: 1702488839425,
  sessionId: "session-abc123",
  clientId: "client-xyz",
  userId: null,
  url: "https://example.com/products",
  referrer: "https://example.com/",

  // Snapshot data
  screenClass: "desktop",
  layoutHash: "sha256:abc123...",
  dom: "base64-encoded-or-gzipped-dom",
  domCompression: "gzip" | "deflate" | "none",

  // DOM size info
  domSize: {
    original: 45670,
    compressed: 12340,
    truncated: false
  },

  // Privacy metadata
  maskMetadata: {
    maskedSelectors: ["input[type=password]"],
    truncated: false,
    domSize: 12340,
    compressionType: "gzip"
  },

  // Viewport and page info
  viewport: { width: 1440, height: 900 },
  pageDimensions: { w: 1440, h: 2500 },
  scrollX: 0,
  scrollY: 450,

  // Heatmap data: normalized click coordinates
  clicks: [
    {
      xNorm: 0.27,  // Normalized X (0-1)
      yNorm: 0.35,  // Normalized Y (0-1)
      elementSelector: "#root > div > button.cta",
      timestamp: 1702488839400
    }
  ],

  schemaVersion: "1.0"
}
```

### RrwebEvent (For Session Replay)

```typescript
{
  type: "rrweb",
  timestamp: 1702488839425,
  sessionId: "session-abc123",
  clientId: "client-xyz",
  userId: null,
  url: "https://example.com/products",
  referrer: "https://example.com/",

  // Raw rrweb payload
  rrwebPayload: {
    type: 3,  // rrweb event type (3 = IncrementalSnapshot)
    data: {
      source: 0,  // rrweb mutation source
      adds: [...],
      removes: [...],
      texts: [...]
    },
    timestamp: 1702488839425
  },

  schemaVersion: "1.0"
}
```

---

## 4. Heatmap Implementation

### Backend Ingestion

Heatmaps require processing normalized click coordinates:

```javascript
// Backend pseudocode
function processHeatmapEvent(snapshot) {
  const layoutHash = snapshot.layoutHash;
  const screenClass = snapshot.screenClass;

  for (const click of snapshot.clicks) {
    // Store normalized coordinates grouped by layout + screen class
    db.heatmaps.insert({
      projectId: snapshot.projectId,
      layoutHash,
      screenClass,
      xNorm: click.xNorm,
      yNorm: click.yNorm,
      selector: click.elementSelector,
      timestamp: click.timestamp,
      sessionId: snapshot.sessionId,
    });
  }

  // Group clicks by layout to build responsive heatmaps
  const layoutHeatmap = db.heatmaps
    .find({ layoutHash, screenClass })
    .aggregate([
      {
        $group: {
          _id: { xNorm: "$xNorm", yNorm: "$yNorm" },
          count: { $sum: 1 },
          selectors: { $push: "$selector" },
        },
      },
    ]);

  return layoutHeatmap;
}
```

### Frontend Rendering (Example with Canvas)

```typescript
function renderHeatmap(canvas, layoutHash, screenClass, heatmapData) {
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;

  // Draw heat gradient
  for (const point of heatmapData) {
    const x = point.xNorm * width;
    const y = point.yNorm * height;
    const intensity = Math.min(1, point.count / maxClicks);

    // Draw gradient circle
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, 50);
    gradient.addColorStop(0, `rgba(255, 0, 0, ${intensity})`);
    gradient.addColorStop(1, "rgba(255, 0, 0, 0)");

    ctx.fillStyle = gradient;
    ctx.fillRect(x - 50, y - 50, 100, 100);
  }
}
```

---

## 5. Manual Snapshot Capture

If you need to capture snapshots programmatically:

```typescript
import { SessionSnapshotEvent } from "@omni-analytics/sdk";

const snapshot: SessionSnapshotEvent = {
  type: "session_snapshot",
  snapshotType: "periodic",
  timestamp: Date.now(),
  sessionId: tracker.getSessionId(),
  clientId: config.getClientId(),
  userId: config.getUserId(),
  url: window.location.href,
  referrer: document.referrer,
  screenClass: "desktop",
  layoutHash: "sha256:abc123",
  dom: btoa(document.documentElement.outerHTML),
  domCompression: "none",
  domSize: { original: 45670, compressed: 45670, truncated: false },
  maskMetadata: { maskedSelectors: [], truncated: false, domSize: 45670 },
  viewport: { width: window.innerWidth, height: window.innerHeight },
  pageDimensions: {
    w: document.documentElement.scrollWidth,
    h: document.documentElement.scrollHeight,
  },
  schemaVersion: "1.0",
};

tracker.trackSnapshot(snapshot);
```

---

## 6. Privacy & Security

### Default Masked Fields

The SDK automatically masks:

- `input[type="password"]`
- `input[type="hidden"]`
- `input[autocomplete*="cc-"]`
- `input[autocomplete="ssn"]`
- `input[name*="password"]`
- `input[name*="token"]`
- `input[name*="secret"]`

### Custom Masking

```typescript
const { tracker } = await initializeSDK(config, {
  privacy: {
    blockSelectors: [".credit-card-form", "[data-sensitive]"],
    maskSelectors: [".pii-field", "[data-mask]"],
    maxNodeTextLength: 100,
  },
});
```

### Per-Element Privacy

Opt out of snapshots on specific elements:

```html
<!-- This element won't be captured -->
<div data-analytics-snapshot="off">Sensitive content</div>
```

---

## 7. Retention & Funnel Metrics

Use periodic snapshots for funnel analysis:

```javascript
// Backend: Analyze snapshot sequences
function analyzeFunnel(sessions) {
  // Group snapshots by funnel step
  const steps = [
    { url: "/products", step: 1 },
    { url: "/cart", step: 2 },
    { url: "/checkout", step: 3 },
    { url: "/success", step: 4 },
  ];

  const funnel = {};

  for (const session of sessions) {
    const snapshots = session.snapshots.sort(
      (a, b) => a.timestamp - b.timestamp
    );

    for (let i = 0; i < snapshots.length; i++) {
      const current = snapshots[i];
      const next = snapshots[i + 1];

      if (!funnel[current.url]) {
        funnel[current.url] = { total: 0, dropoff: 0 };
      }

      funnel[current.url].total++;

      // Check if user moved to next step
      if (next && !isNextStep(current, next)) {
        funnel[current.url].dropoff++;
      }
    }
  }

  // Calculate conversion rates
  const conversions = Object.entries(funnel).map(([url, data]) => ({
    url,
    conversionRate: (data.total - data.dropoff) / data.total,
    dropoffRate: data.dropoff / data.total,
  }));

  return conversions;
}
```

---

## 8. Configuration Examples

### Minimal Setup (RrWeb Only)

```typescript
const { tracker } = await initializeSDK({
  projectId: "my-project",
  endpoint: "https://api.example.com/events",
  snapshot: {
    enabled: true,
    captureInitial: true,
  },
});
```

### Production Setup (All Features)

```typescript
const { tracker } = await initializeSDK(
  {
    projectId: "my-project",
    endpoint: "https://api.example.com/events",
    batchSize: 50,
    batchTimeout: 10000,

    snapshot: {
      enabled: true,
      captureInitial: true,
      captureMutations: true,
      mutationThrottleMs: 5000,
      capturePeriodic: true,
      periodicIntervalMs: 120000, // 2 minutes
      maxSnapshotSizeBytes: 256 * 1024, // 256KB for performance
    },

    privacy: {
      blockSelectors: [".no-track", "[data-no-snapshot]", ".payment-form"],
      maskSelectors: ["input[type=password]", "input[name*=ssn]", ".pii"],
      maxNodeTextLength: 150,
    },
  },
  {
    enableAutoTracking: true,
  }
);
```

---

## 9. Troubleshooting

### RrWeb Not Initializing

```typescript
const plugin = new SessionSnapshotPlugin({ debug: true });
// Check console for:
// "[SessionSnapshotPlugin] rrweb not available globally..."

// Solution: Ensure rrweb is loaded before SDK initialization
// <script src="https://cdn.jsdelivr.net/npm/rrweb@2.0.0/dist/rrweb.min.js"></script>
```

### Large Snapshot Sizes

```typescript
// Reduce size limits
snapshot: {
  maxSnapshotSizeBytes: 128 * 1024, // 128KB instead of 512KB
},

privacy: {
  maxNodeTextLength: 50, // Shorter text
},
```

### Performance Issues

```typescript
// Reduce capture frequency
snapshot: {
  captureMutations: false, // Disable mutation snapshots
  capturePeriodic: true,
  periodicIntervalMs: 300000, // 5 minutes instead of 1
},

// Adjust rrweb sampling
// In SessionSnapshotPlugin:
// sampleRate: 0.5, // Capture 50% of events
```

---

## 10. API Reference

### Tracker Methods

```typescript
// Track a DOM snapshot
tracker.trackSnapshot(snapshot: SessionSnapshotEvent): void

// Track a rrweb event
tracker.trackRrweb(event: RrwebEvent): void

// Get current session ID
tracker.getSessionId(): string

// Start new session
tracker.newSession(): string

// Flush queued events
tracker.flush(): Promise<void>
```

### RrwebManager

```typescript
import { RrwebManager } from "@omni-analytics/sdk";

const manager = new RrwebManager();

// Check if rrweb is available
manager.isAvailable(): boolean

// Initialize
manager.init(config): boolean

// Start/stop recording
manager.startRecording(): boolean
manager.stopRecording(): void

// Get status
manager.getStatus(): { recording: boolean; initialized: boolean; ... }

// Cleanup
manager.destroy(): void
```

---

## Event Flow Diagram

```
┌─────────────────────────────────────┐
│        Page Load / Interaction      │
└────────────┬────────────────────────┘
             │
             ├──→ RrWeb (if available)
             │    └──→ Captures DOM + Interactions
             │        └──→ RrwebEvent → EventQueue
             │
             ├──→ Fallback Manual Capture
             │    ├── Initial Snapshot
             │    ├── Mutation Detection
             │    └── Periodic Snapshots
             │        └──→ SessionSnapshotEvent → EventQueue
             │
             └──→ Click Tracking Plugin
                  └──→ Normalized Coordinates
                      └──→ Captured for Heatmaps
                          └──→ Included in Snapshots

         ┌─────────────────────┐
         │    EventQueue       │
         │  (Batches Events)   │
         └──────────┬──────────┘
                    │
         ┌──────────┴──────────┐
         │                     │
    Transmitter          Transmitter
    (Fetch API)          (Beacon API)
         │                     │
         └──────────┬──────────┘
                    │
          ┌─────────▼─────────┐
          │  Analytics Backend │
          │  - Store Events    │
          │  - Process         │
          │  - Generate        │
          │    Heatmaps,       │
          │    Funnels, etc    │
          └────────────────────┘
```

---

## Summary

The SessionSnapshotPlugin provides:

✅ **Session Replay** - Full DOM capture via rrweb
✅ **Heatmaps** - Normalized click coordinates grouped by layout
✅ **Retention Metrics** - Periodic snapshots for funnel analysis
✅ **Privacy-First** - Automatic masking of sensitive fields
✅ **Adaptive** - Falls back to manual capture if rrweb unavailable
✅ **Performant** - Batching, compression, and throttling built-in

For questions or issues, refer to the API Reference section or check debug logs with `debug: true`.
