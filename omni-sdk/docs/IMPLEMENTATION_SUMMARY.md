# Session Snapshots, Heatmaps & Retention Implementation - Summary

## What Was Implemented

The Omni Analytics SDK has been successfully extended with comprehensive session replay, heatmap, and retention metrics capabilities.

---

## 1. New Event Types

### SessionSnapshotEvent

**File:** `packages/sdk/src/types/events/snapshot.ts`

Captures DOM snapshots with:

- **Serialized DOM** - Sanitized, compressed HTML for replay
- **Layout Hash** - Deterministic hash for grouping similar layouts
- **Screen Class** - Mobile/tablet/desktop classification
- **Heatmap Data** - Normalized click coordinates (0-1 range)
- **Scroll Position** - ScrollX/ScrollY tracking
- **Compression** - gzip/deflate/none encoding
- **Privacy Metadata** - Masked selectors, truncation info

```typescript
export interface SessionSnapshotEvent {
  type: "session_snapshot";
  snapshotType: "initial" | "mutation" | "periodic" | "rrweb";
  timestamp: number;
  layoutHash: string;
  screenClass: ScreenClass;
  dom: string;
  clicks: HeatmapClick[]; // ← NEW: Normalized click data
  pageDimensions: { w: number; h: number };
  scrollX?: number;
  scrollY?: number;
  // ... other fields
}
```

### RrwebEvent

**File:** `packages/sdk/src/types/events/snapshot.ts`

Raw rrweb events for session replay:

- Captures full DOM mutations
- Tracks interactions (clicks, scrolls, inputs)
- Maintains temporal ordering

```typescript
export interface RrwebEvent {
  type: "rrweb";
  timestamp: number;
  sessionId: string;
  clientId: string;
  rrwebPayload: {
    type: number;
    data: Record<string, any>;
    timestamp?: number;
  };
  schemaVersion: string;
}
```

### HeatmapClick Interface

**File:** `packages/sdk/src/types/events/snapshot.ts`

Normalized click coordinates for heatmaps:

```typescript
export interface HeatmapClick {
  xNorm: number; // 0-1: (pageX + scrollX) / pageWidth
  yNorm: number; // 0-1: (pageY + scrollY) / pageHeight
  elementSelector?: string;
  timestamp: number;
}
```

---

## 2. Tracker API Extensions

**File:** `packages/sdk/src/tracker/Tracker.ts`

Added two new tracking methods:

```typescript
// Track DOM snapshot events
trackSnapshot(snapshot: SessionSnapshotEvent): void

// Track rrweb events directly
trackRrweb(rrwebEvent: RrwebEvent): void
```

Both methods:

- Auto-populate projectId, clientId, sessionId
- Normalize viewport dimensions
- Add to EventQueue for batching/transmission
- Support debug logging

---

## 3. RrWeb Integration Utility

**File:** `packages/sdk/src/utils/rrwebIntegration.ts`

New `RrwebManager` class provides:

**Features:**

- Detects rrweb availability globally
- Configurable initialization
- Start/stop recording control
- Event sampling for performance
- Automatic fallback handling

**API:**

```typescript
class RrwebManager {
  isAvailable(): boolean;
  init(config: RrwebManagerConfig): boolean;
  startRecording(): boolean;
  stopRecording(): void;
  isRecording(): boolean;
  getStatus(): StatusInfo;
  destroy(): void;
}
```

**Configuration:**

```typescript
interface RrwebManagerConfig {
  onRecord: (event: any) => void;
  enabled?: boolean;
  debug?: boolean;
  sampleRate?: number; // 0-1
  blockSelectors?: string[];
  maskSelectors?: string[];
}
```

**Helper Function:**

```typescript
transformRrwebEvent(
  rrwebEvent: any,
  sessionId: string,
  clientId: string,
  userId: string | null,
  url: string,
  referrer?: string
): RrwebEvent
```

---

## 4. SessionSnapshotPlugin Enhancements

**File:** `packages/sdk/src/plugins/session-snapshot/SessionSnapshotPlugin.ts`

Complete rewrite with:

**New Capabilities:**

- ✅ Full rrweb integration for automatic capture
- ✅ Fallback manual snapshots if rrweb unavailable
- ✅ Heatmap click normalization and aggregation
- ✅ Privacy masking with configurable selectors
- ✅ DOM compression (gzip/deflate)
- ✅ Mutation detection with throttling
- ✅ Periodic snapshots for funnel analysis

**Constructor Options:**

```typescript
interface SessionSnapshotPluginOptions {
  useRrweb?: boolean; // default: true
  useFallbackSnapshots?: boolean; // default: true
  debug?: boolean; // default: false
}
```

**Public Methods:**

```typescript
init(context: PluginContext): Promise<void>
destroy(): Promise<void>
captureClickForHeatmap(pageX: number, pageY: number, selector?: string): void
getStatus(): PluginStatus
```

**Snapshot Modes:**

1. **rrweb mode** - Automatic capture of all interactions
2. **initial** - Single snapshot after page load/navigation
3. **mutation** - Triggered by significant DOM changes
4. **periodic** - Fixed intervals for funnel analysis

---

## 5. Type Exports

**File:** `packages/sdk/src/types/index.ts`

New exports:

```typescript
export type {
  SessionSnapshotEvent,
  RrwebEvent,
  SnapshotType,
  ScreenClass,
  MaskMetadata,
  HeatmapClick,
} from "./events/snapshot";

export type { SDKConfig, SnapshotConfig, PrivacyConfig } from "./config";

export { RrwebManager, transformRrwebEvent } from "./utils/rrwebIntegration";
export type { RrwebManagerConfig } from "./utils/rrwebIntegration";

export { SessionSnapshotPlugin } from "../plugins/session-snapshot/SessionSnapshotPlugin";
export type { SessionSnapshotPluginOptions } from "../plugins/session-snapshot/SessionSnapshotPlugin";
```

---

## 6. Main Entry Point Updates

**File:** `packages/sdk/src/index.ts`

New exports:

```typescript
export { SessionSnapshotPlugin } from "./plugins/session-snapshot/SessionSnapshotPlugin";
export { RrwebManager, transformRrwebEvent } from "./utils/rrwebIntegration";
export type { RrwebManagerConfig } from "./utils/rrwebIntegration";
```

---

## 7. Documentation

### SESSION_SNAPSHOTS.md

Comprehensive guide covering:

- ✅ Basic setup & RrWeb installation
- ✅ Plugin configuration options
- ✅ Event type schemas (SessionSnapshotEvent, RrwebEvent)
- ✅ Heatmap implementation (backend & frontend examples)
- ✅ Manual snapshot capture
- ✅ Privacy & security best practices
- ✅ Retention & funnel metrics
- ✅ Configuration examples
- ✅ Troubleshooting guide
- ✅ Complete API reference
- ✅ Event flow diagram

### SNAPSHOTS_EXAMPLES.md

Practical examples including:

- ✅ Complete client initialization
- ✅ Event listener setup
- ✅ Custom event tracking
- ✅ User authentication tracking
- ✅ Scroll depth tracking
- ✅ Heatmap data generation (backend)
- ✅ Funnel analysis (backend)
- ✅ Multiple usage examples
- ✅ E-commerce funnel example
- ✅ SPA tracking example

---

## 8. Event Flow Architecture

```
User Interaction
├── DOM Mutation / Click / Scroll
│
├─→ RrWeb Capture (if enabled & available)
│   └─→ Automatic: Full DOM + All Interactions
│       └─→ RrwebEvent
│
└─→ Fallback Manual Capture
    ├─→ Initial: Page load + Navigation
    ├─→ Mutation: Significant layout changes
    └─→ Periodic: Regular intervals
        └─→ SessionSnapshotEvent (with clicks normalized)

SessionSnapshotEvent
├── Snapshot Data
│   ├── DOM (serialized, compressed)
│   ├── Layout Hash (for grouping)
│   ├── Screen Class (responsive design)
│   └── Viewport/Scroll Position
└── Heatmap Data
    └── Clicks with Normalized Coordinates
        └── xNorm, yNorm (0-1 range)
        └── elementSelector
        └── timestamp

RrwebEvent
└── Raw rrweb payload (for replay)

     ↓

EventQueue (Batching)
├── Batch Size: 50 events
├── Batch Timeout: 10 seconds
└── Auto-flush on limits

     ↓

Transmitter (FetchAPI/Beacon)

     ↓

Backend Processing
├── Heatmap Generation
│   └── Group clicks by layoutHash + screenClass
├── Session Replay
│   └── Reconstruct DOM from rrweb events
└── Retention/Funnel Analysis
    └── Track progression through funnels
```

---

## 9. Key Features Summary

| Feature         | Type                        | Capture Method                 | Use Case                        |
| --------------- | --------------------------- | ------------------------------ | ------------------------------- |
| Session Replay  | RrwebEvent                  | rrweb mutations                | Understand user interactions    |
| Heatmaps        | SessionSnapshotEvent.clicks | Click tracking + normalization | Identify high-interaction areas |
| Funnel Analysis | SessionSnapshotEvent        | Periodic snapshots             | Measure conversion rates        |
| Retention       | SessionSnapshotEvent        | Time-series snapshots          | Track user progression          |
| DOM Snapshots   | SessionSnapshotEvent.dom    | Serialization + compression    | Diagnostics & debugging         |

---

## 10. Privacy & Security Features

✅ **Automatic Masking:**

- Passwords, hidden inputs, tokens
- CC numbers, SSN fields
- Custom selectors configurable

✅ **DOM Sanitization:**

- Script tags removed
- Event handlers stripped
- Cross-origin iframes blocked

✅ **Size Management:**

- DOM truncation (configurable limit)
- Text length limiting
- Gzip compression

✅ **User Control:**

- Per-element opt-out: `data-analytics-snapshot="off"`
- Block selectors for entire sections
- Custom mask selectors

---

## 11. Performance Considerations

✅ **Throttling:**

- Mutation snapshots: 3-5 second throttle
- Click batching: Accumulated in memory until snapshot
- Scroll position: Sampled, not logged individually

✅ **Optimization:**

- Compression (gzip/deflate)
- Size limiting (256-512KB default)
- Text truncation
- requestIdleCallback for non-blocking capture

✅ **Sampling:**

- RrWeb event sampling (configurable sampleRate)
- Adaptive based on performance

---

## 12. Configuration Examples

### Minimal (RrWeb Only)

```typescript
snapshot: {
  enabled: true,
  captureInitial: true
}
```

### Development (All Features)

```typescript
snapshot: {
  enabled: true,
  captureInitial: true,
  captureMutations: true,
  mutationThrottleMs: 3000,
  capturePeriodic: true,
  periodicIntervalMs: 60000,
  maxSnapshotSizeBytes: 512 * 1024
}
```

### Production (Optimized)

```typescript
snapshot: {
  enabled: true,
  captureInitial: true,
  captureMutations: true,
  mutationThrottleMs: 5000,
  capturePeriodic: true,
  periodicIntervalMs: 300000, // 5 minutes
  maxSnapshotSizeBytes: 256 * 1024
}
```

---

## 13. Backend Integration Points

**Expected Event Schema:**

```typescript
{
  eventId: string;
  projectId: string;
  clientId: string;
  sessionId: string;
  userId: string | null;
  type: "session_snapshot" | "rrweb";
  timestamp: number;
  url: string;
  referrer: string;
  pageDimensions: { w: number; h: number };
  viewport: { w: number; h: number };

  // For SessionSnapshotEvent
  snapshotType?: "initial" | "mutation" | "periodic" | "rrweb";
  screenClass?: "mobile" | "tablet" | "desktop";
  layoutHash?: string;
  dom?: string; // base64 or compressed
  clicks?: Array<{ xNorm: number; yNorm: number; ... }>;

  // For RrwebEvent
  rrwebPayload?: { type: number; data: any; };

  schemaVersion: string;
}
```

**Processing:**

1. **Session Replay** - Store RrwebEvent payloads, reconstruct DOM on demand
2. **Heatmaps** - Extract clicks from SessionSnapshotEvent, group by layoutHash
3. **Retention** - Time-series analysis of SessionSnapshotEvent.timestamp
4. **Diagnostics** - Store DOM snapshots for debugging

---

## 14. Testing Recommendations

### Unit Tests

- RrwebManager initialization
- Heatmap click normalization
- Privacy masking logic
- Tracker methods (trackSnapshot, trackRrweb)

### Integration Tests

- Plugin initialization with/without rrweb
- Event batching and transmission
- Fallback to manual snapshots
- DOM serialization & compression

### E2E Tests

- Full flow: Page load → Snapshots → Backend
- Heatmap data accuracy
- Privacy masking verification
- Performance benchmarks

---

## 15. Troubleshooting Checklist

| Issue                     | Solution                                                      |
| ------------------------- | ------------------------------------------------------------- |
| RrWeb not initializing    | Check CDN load: `window.rrweb` exists?                        |
| Large snapshot sizes      | Reduce `maxSnapshotSizeBytes`, limit text length              |
| Performance impact        | Disable mutations, increase periodic interval                 |
| Privacy concerns          | Configure `blockSelectors`, `maskSelectors`                   |
| Heatmap coordinates wrong | Verify normalization formula: `(pageX + scrollX) / pageWidth` |

---

## 16. Files Created/Modified

### New Files

- ✅ `packages/sdk/src/utils/rrwebIntegration.ts`
- ✅ `docs/SESSION_SNAPSHOTS.md`
- ✅ `docs/SNAPSHOTS_EXAMPLES.md`

### Modified Files

- ✅ `packages/sdk/src/types/events/snapshot.ts` - Enhanced event types
- ✅ `packages/sdk/src/types/common.ts` - Added event types
- ✅ `packages/sdk/src/tracker/Tracker.ts` - Added tracking methods
- ✅ `packages/sdk/src/plugins/session-snapshot/SessionSnapshotPlugin.ts` - Complete rewrite
- ✅ `packages/sdk/src/types/index.ts` - New exports
- ✅ `packages/sdk/src/index.ts` - New exports

---

## 17. Next Steps for Integration

1. **Backend Setup**

   - Create event ingestion endpoint
   - Implement heatmap aggregation logic
   - Set up DOM decompression for replay

2. **Frontend Testing**

   - Load RrWeb via CDN
   - Initialize SDK with snapshot config
   - Verify events are batched/transmitted

3. **Heatmap Visualization**

   - Implement canvas/SVG heatmap rendering
   - Build layout selector UI
   - Create time-based filtering

4. **Retention Dashboard**

   - Build funnel visualization
   - Implement conversion metrics
   - Add cohort analysis

5. **Session Replay Player**
   - Build rrweb playback UI
   - Add timeline scrubbing
   - Implement speed controls

---

## 18. Performance Metrics to Track

- Snapshot size (compressed vs uncompressed)
- Number of events per batch
- Heatmap click density
- Event transmission latency
- Memory usage impact

---

## Conclusion

The SDK now provides:

✅ **Production-ready** session replay via rrweb
✅ **Responsive** heatmaps with normalized coordinates
✅ **Privacy-first** design with configurable masking
✅ **High-performance** batching and compression
✅ **Flexible** fallback to manual capture
✅ **Well-documented** with examples and guides
✅ **Type-safe** with full TypeScript support
✅ **Minimal disruption** to existing click/pageview logic

All while maintaining backward compatibility with existing event types and transmission system.
