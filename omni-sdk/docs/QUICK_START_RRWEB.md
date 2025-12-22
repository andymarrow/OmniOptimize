# Quick Reference: RrWeb Integration

## Installation

```bash
# Install SDK and rrweb
pnpm add @omni-analytics/sdk rrweb
```

## Basic Setup (React App)

```typescript
// src/App.tsx
import { useEffect } from "react";
import { initializeSDK, SessionSnapshotPlugin } from "@omni-analytics/sdk";
import * as rrweb from "rrweb";

export function App() {
  useEffect(() => {
    (async () => {
      // Initialize SDK
      const { tracker } = await initializeSDK({
        projectId: "my-project",
        endpoint: "https://api.example.com/events",
        snapshot: {
          enabled: true,
          captureInitial: true,
        },
        privacy: {
          blockSelectors: [".credit-card-form"],
          maskSelectors: ['input[type="password"]'],
        },
      });

      // Setup snapshots with rrweb
      const plugin = new SessionSnapshotPlugin({
        rrwebInstance: rrweb,
        debug: true,
      });

      console.log("Analytics initialized");
    })();
  }, []);

  return <div>{/* Your app */}</div>;
}
```

## Tracker API

```typescript
// Page views (automatic)
tracker.trackPageView();

// Clicks (automatic)
tracker.trackClick(element, { pageX, pageY });

// Custom events
tracker.trackCustom("user_signup", { plan: "pro" });

// Snapshots (automatic via plugin)
// But can track manually:
tracker.trackSnapshot({
  type: "session_snapshot",
  snapshotType: "periodic",
  timestamp: Date.now(),
  sessionId: "session-123",
  clientId: "client-123",
  url: window.location.href,
  screenClass: "desktop",
  layoutHash: "hash-123",
  dom: "<html>...</html>",
  domCompression: "gzip",
  domSize: { original: 1000, compressed: 500, truncated: false },
  maskMetadata: { maskedSelectors: [], truncated: false, domSize: 500 },
  viewport: { width: 1440, height: 900 },
  pageDimensions: { w: 1440, h: 2500 },
  schemaVersion: "1.0",
});

// RrWeb events (automatic via plugin)
tracker.trackRrweb({
  type: "rrweb",
  timestamp: Date.now(),
  sessionId: "session-123",
  clientId: "client-123",
  url: window.location.href,
  rrwebPayload: {
    /* rrweb event */
  },
  schemaVersion: "1.0",
});

// Flush events
await tracker.flush();
```

## Plugin Configuration

```typescript
// With rrweb
new SessionSnapshotPlugin({
  useRrweb: true,
  rrwebInstance: rrweb, // From: import * as rrweb from 'rrweb'
  useFallbackSnapshots: true, // Fallback if rrweb unavailable
  debug: false,
});

// Without rrweb (manual snapshots)
new SessionSnapshotPlugin({
  useRrweb: false,
  useFallbackSnapshots: true,
  debug: false,
});
```

## SDK Configuration

```typescript
await initializeSDK({
  projectId: "my-project",
  endpoint: "https://api.example.com/events",
  batchSize: 50,
  batchTimeout: 10000,
  debug: false,

  // Snapshot config
  snapshot: {
    enabled: true,
    captureInitial: true, // On page load
    captureMutations: false, // On DOM changes
    mutationThrottleMs: 3000,
    capturePeriodic: true, // At intervals
    periodicIntervalMs: 60000, // 1 minute
    maxSnapshotSizeBytes: 512000, // 512KB
  },

  // Privacy config
  privacy: {
    blockSelectors: [".payment-form"], // Remove entirely
    maskSelectors: ['input[type="password"]'], // Mask content
    maxNodeTextLength: 200,
  },
});
```

## Event Types

### PageViewEvent

```typescript
{
  type: 'pageview',
  eventId: 'uuid',
  projectId: 'project-123',
  clientId: 'client-123',
  sessionId: 'session-123',
  timestamp: 1234567890,
  url: 'https://example.com',
  referrer: 'https://google.com',
  title: 'Page Title',
  route: '/products',
  isInitialLoad: true,
  pageDimensions: { w: 1440, h: 2500 },
  viewport: { w: 1440, h: 900 },
}
```

### ClickEvent

```typescript
{
  type: 'click',
  eventId: 'uuid',
  projectId: 'project-123',
  pageX: 100,
  pageY: 200,
  xNorm: 0.27,           // For heatmaps
  yNorm: 0.35,           // For heatmaps
  selector: 'button.cta',
  tagName: 'button',
  screenClass: 'desktop', // mobile|tablet|desktop
  layoutHash: 'hash-123',
  // ... base event fields
}
```

### SessionSnapshotEvent

```typescript
{
  type: 'session_snapshot',
  snapshotType: 'initial',           // initial|mutation|periodic|rrweb
  timestamp: 1234567890,
  sessionId: 'session-123',
  clientId: 'client-123',
  url: 'https://example.com',
  screenClass: 'desktop',
  layoutHash: 'hash-123',
  dom: '<html>...</html>',           // Serialized DOM
  domCompression: 'gzip',            // gzip|deflate|none
  domSize: {
    original: 102400,
    compressed: 20480,
    truncated: false,
  },
  clicks: [                           // Heatmap data
    { xNorm: 0.5, yNorm: 0.5, elementSelector: 'button' }
  ],
  viewport: { width: 1440, height: 900 },
  pageDimensions: { w: 1440, h: 2500 },
}
```

### RrwebEvent

```typescript
{
  type: 'rrweb',
  timestamp: 1234567890,
  sessionId: 'session-123',
  clientId: 'client-123',
  url: 'https://example.com',
  rrwebPayload: {
    type: 2,           // rrweb event type
    data: { /* ... */ }, // rrweb event data
  },
  schemaVersion: '1.0',
}
```

## Debugging

```typescript
// Enable debug logging
const { tracker, container } = await initializeSDK({
  projectId: "my-project",
  endpoint: "https://api.example.com/events",
  debug: true, // ← Enable debug
});

// Check plugin status
const plugin = new SessionSnapshotPlugin({ debug: true });
const status = plugin.getStatus();
console.log(status);
// {
//   name: "session-snapshot",
//   version: "1.0.0",
//   initialized: true,
//   config: { snapshotConfig, privacyConfig }
// }

// Check RrwebManager status
const manager = new RrwebManager(rrweb);
const status = manager.getStatus();
console.log(status);
// {
//   recording: boolean,
//   initialized: boolean,
//   available: boolean,
//   debug: boolean,
// }
```

## Common Patterns

### Lazy Load RrWeb

```typescript
const plugin = new SessionSnapshotPlugin();

// Load rrweb when user scrolls or interacts
document.addEventListener(
  "scroll",
  async () => {
    const rrweb = await import("rrweb");
    plugin.setRrwebInstance(rrweb);
  },
  { once: true }
);
```

### Custom Event Tracking

```typescript
tracker.trackCustom("feature_enabled", {
  feature: "dark_mode",
  enabled: true,
  duration: 3600000, // 1 hour in ms
});
```

### Session Management

```typescript
// Start new session (e.g., after login)
const newSessionId = tracker.newSession();

// Set user ID (after authentication)
tracker.setUserId("user-123");

// Unset user ID (after logout)
tracker.setUserId(null);
```

### Batch Flushing

```typescript
// Manual flush
await tracker.flush();

// Flush on page unload
window.addEventListener("beforeunload", () => {
  tracker.flush();
});
```

## Troubleshooting

| Issue                 | Solution                                              |
| --------------------- | ----------------------------------------------------- |
| "rrweb not available" | `pnpm add rrweb` or check CDN script                  |
| Large event payloads  | Enable compression, reduce sample rate                |
| Performance issues    | `captureMutations: false`, increase periodic interval |
| Memory usage          | Reduce snapshot size with `blockSelectors`            |
| Missing events        | Check batch timeout, ensure flush on unload           |

## Resources

- 📖 [RrWeb Setup Guide](./RRWEB_SETUP.md)
- 📚 [Session Snapshots](./SESSION_SNAPSHOTS.md)
- 💡 [Examples](./SNAPSHOTS_EXAMPLES.md)
- 📋 [Full Implementation](./IMPLEMENTATION_SUMMARY.md)
- 🔗 [API Reference](./API_REFERENCE.md)
