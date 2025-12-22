# RrWeb Integration Setup Guide

## Overview

The Omni Analytics SDK now supports **rrweb** as an **optional peer dependency** for advanced session replay and interaction capture. RrWeb automatically captures:

- Full DOM mutations
- User interactions (clicks, scrolls, inputs, form changes)
- Viewport size changes
- Network requests (configurable)
- Accurate temporal ordering for playback

This guide explains how to install, configure, and use rrweb with the SDK.

---

## Installation

### Option 1: NPM/PNPM (Recommended for SSR & Build Tools)

Install both the SDK and rrweb:

```bash
# Using pnpm
pnpm add @omni-analytics/sdk rrweb

# Using npm
npm install @omni-analytics/sdk rrweb

# Using yarn
yarn add @omni-analytics/sdk rrweb
```

### Option 2: CDN (For browsers without build tools)

Include both libraries via CDN:

```html
<!-- RrWeb Library -->
<script src="https://cdn.jsdelivr.net/npm/rrweb@latest/dist/rrweb.min.js"></script>

<!-- Omni SDK -->
<script src="https://cdn.jsdelivr.net/npm/@omni-analytics/sdk@latest/dist/index.umd.js"></script>
```

### Option 3: Hybrid (Load rrweb via CDN, SDK via NPM)

```bash
pnpm add @omni-analytics/sdk
```

Then include rrweb via CDN script tag before your app script.

---

## Basic Usage

### Method 1: Using NPM Import (Recommended)

```typescript
import { initializeSDK, SessionSnapshotPlugin } from '@omni-analytics/sdk';
import * as rrweb from 'rrweb';

// Initialize SDK
const { tracker, container } = await initializeSDK({
  projectId: 'my-project',
  endpoint: 'https://api.example.com/events',
  snapshot: {
    enabled: true,
    captureInitial: true,
  },
});

// Create SessionSnapshotPlugin with rrweb instance
const snapshotPlugin = new SessionSnapshotPlugin({
  useRrweb: true,
  rrwebInstance: rrweb, // Pass the imported rrweb instance
  useFallbackSnapshots: true, // Fallback if rrweb fails
  debug: true,
});

// Register the plugin
const pluginRegistry = container.getPluginRegistry();
pluginRegistry.register(snapshotPlugin);

// Already initialized, but you can call init manually if needed
await snapshotPlugin.init({
  tracker,
  config: container.getConfig(),
});
```

### Method 2: Global CDN (Auto-detection)

If rrweb is loaded via CDN (available as `window.rrweb`), the plugin auto-detects it:

```html
<script src="https://cdn.jsdelivr.net/npm/rrweb@latest/dist/rrweb.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@omni-analytics/sdk@latest/dist/index.umd.js"></script>

<script>
  const { initializeSDK } = window.OmniAnalytics;

  initializeSDK({
    projectId: 'my-project',
    endpoint: 'https://api.example.com/events',
    snapshot: { enabled: true },
  }).then(({ tracker, container }) => {
    console.log('SDK initialized with rrweb');
  });
</script>
```

### Method 3: Lazy Loading rrweb

For performance, load rrweb only when needed:

```typescript
import { initializeSDK, SessionSnapshotPlugin } from '@omni-analytics/sdk';

const { tracker, container } = await initializeSDK({
  projectId: 'my-project',
  endpoint: 'https://api.example.com/events',
});

// Load rrweb dynamically
const rrweb = await import('rrweb');

// Create and register plugin
const snapshotPlugin = new SessionSnapshotPlugin({
  useRrweb: true,
  rrwebInstance: rrweb,
});

const pluginRegistry = container.getPluginRegistry();
pluginRegistry.register(snapshotPlugin);
```

---

## Configuration

### RrWeb Manager Options

```typescript
interface RrwebManagerConfig {
  // Callback when rrweb event is recorded
  onRecord: (event: any) => void;

  // Enable/disable recording
  enabled?: boolean;

  // Debug logging
  debug?: boolean;

  // Sample rate (0-1, default: 1.0 = capture all)
  sampleRate?: number;

  // Mask sensitive input values
  maskInputOptions?: Record<string, boolean>;

  // Selectors to block/exclude from recording
  blockSelectors?: string[];

  // Selectors to mask/hide content
  maskSelectors?: string[];
}
```

### SessionSnapshotPlugin Options

```typescript
interface SessionSnapshotPluginOptions {
  // Enable rrweb capture
  useRrweb?: boolean;

  // Optional rrweb instance (from npm import)
  rrwebInstance?: any;

  // Fallback to manual snapshots if rrweb unavailable
  useFallbackSnapshots?: boolean;

  // Debug logging
  debug?: boolean;
}
```

### SDK Snapshot Configuration

```typescript
interface SnapshotConfig {
  // Enable/disable snapshots
  enabled?: boolean;

  // Capture initial snapshot on pageview
  captureInitial?: boolean;

  // Enable mutation-triggered snapshots (requires manual setup)
  captureMutations?: boolean;

  // Min time between mutation snapshots (ms)
  mutationThrottleMs?: number;

  // Enable periodic snapshots
  capturePeriodic?: boolean;

  // Interval for periodic snapshots (ms)
  periodicIntervalMs?: number;

  // Max snapshot size before truncation
  maxSnapshotSizeBytes?: number;
}
```

### Privacy Configuration

```typescript
interface PrivacyConfig {
  // Selectors to completely remove from snapshots
  blockSelectors?: string[];

  // Selectors to mask/hide
  maskSelectors?: string[];

  // Disable snapshots entirely
  disableSnapshots?: boolean;

  // Max text length per node
  maxNodeTextLength?: number;
}
```

---

## Advanced Configuration Example

```typescript
import { initializeSDK, SessionSnapshotPlugin } from '@omni-analytics/sdk';
import * as rrweb from 'rrweb';

const { tracker, container } = await initializeSDK({
  projectId: 'my-project',
  endpoint: 'https://api.example.com/events',
  debug: true,

  // Snapshot configuration
  snapshot: {
    enabled: true,
    captureInitial: true,
    captureMutations: true,
    mutationThrottleMs: 3000,
    capturePeriodic: true,
    periodicIntervalMs: 60000, // 1 minute
    maxSnapshotSizeBytes: 512 * 1024, // 512KB
  },

  // Privacy configuration
  privacy: {
    // Block payment/sensitive forms completely
    blockSelectors: [
      '[data-payment-form]',
      '.credit-card-form',
    ],
    
    // Mask sensitive fields
    maskSelectors: [
      'input[type="password"]',
      'input[name*="ssn"]',
      '[data-sensitive]',
    ],
    
    maxNodeTextLength: 200,
  },
});

// Create plugin with rrweb
const snapshotPlugin = new SessionSnapshotPlugin({
  useRrweb: true,
  rrwebInstance: rrweb,
  useFallbackSnapshots: true,
  debug: true,
});

const pluginRegistry = container.getPluginRegistry();
pluginRegistry.register(snapshotPlugin);
```

---

## Handling Missing RrWeb

The SDK gracefully handles missing rrweb in multiple ways:

### 1. Automatic Fallback

```typescript
const snapshotPlugin = new SessionSnapshotPlugin({
  useRrweb: true,
  useFallbackSnapshots: true, // Falls back to manual snapshots
  debug: true,
});
```

If rrweb is not available, the plugin will:
- Log a warning
- Fall back to manual DOM snapshot capture
- Continue tracking with periodic snapshots
- Maintain heatmap data collection

### 2. Manual Fallback Check

```typescript
const rrwebManager = new RrwebManager(rrweb);

if (!rrwebManager.isAvailable()) {
  console.warn('RrWeb not available, using manual snapshots');
  // Implement manual snapshot logic
}

if (rrwebManager.isRecording()) {
  console.log('RrWeb is recording');
}
```

### 3. Error Handling

```typescript
try {
  const snapshotPlugin = new SessionSnapshotPlugin({
    useRrweb: true,
    rrwebInstance: rrweb,
  });
  
  await snapshotPlugin.init({
    tracker,
    config: container.getConfig(),
  });
} catch (error) {
  console.error('Failed to initialize snapshots:', error);
  // Implement fallback logic
}
```

---

## Performance Considerations

### 1. Sample Rate

Reduce sampling to decrease bandwidth:

```typescript
new RrwebManager(rrweb).init({
  onRecord: callback,
  sampleRate: 0.5, // Capture 50% of events
});
```

### 2. Block Unnecessary Elements

```typescript
new SessionSnapshotPlugin({
  rrwebInstance: rrweb,
  // ... other config
})

// In SDK config
snapshot: {
  // ... other config
  blockSelectors: [
    '.ads', // Block ads
    '.tracking-pixels', // Block tracking pixels
    'video', // Block video elements
    'iframe[src*="facebook"]', // Block 3rd party iframes
  ],
}
```

### 3. Compression

Snapshots are automatically compressed (gzip when available):

```typescript
// Backend receives compressed data
{
  "type": "session_snapshot",
  "domCompression": "gzip",
  "domSize": {
    "original": 102400,     // 100KB uncompressed
    "compressed": 20480,    // 20KB compressed
    "truncated": false
  }
}
```

### 4. Periodic vs. Continuous

Use periodic snapshots for less critical views:

```typescript
snapshot: {
  captureInitial: true,      // Always capture on page load
  captureMutations: false,   // Skip expensive mutation tracking
  capturePeriodic: true,     // Periodic snapshots every 1 min
  periodicIntervalMs: 60000,
}
```

---

## Troubleshooting

### Issue: "rrweb is not available"

**Solutions:**

1. Ensure rrweb is installed:
   ```bash
   pnpm add rrweb
   ```

2. If using CDN, check script order:
   ```html
   <script src="rrweb.min.js"></script> <!-- FIRST -->
   <script src="sdk.js"></script>        <!-- SECOND -->
   ```

3. Pass rrweb instance explicitly:
   ```typescript
   import * as rrweb from 'rrweb';
   new SessionSnapshotPlugin({ rrwebInstance: rrweb })
   ```

### Issue: Large snapshot payloads

**Solutions:**

1. Enable compression (automatic)
2. Increase `maxSnapshotSizeBytes` threshold
3. Reduce capture frequency
4. Block unnecessary elements:
   ```typescript
   blockSelectors: ['iframe', 'video', '.ads']
   ```

### Issue: Performance degradation

**Solutions:**

1. Reduce sample rate:
   ```typescript
   sampleRate: 0.2 // 20% sampling
   ```

2. Disable mutation snapshots (expensive):
   ```typescript
   captureMutations: false
   ```

3. Increase periodic interval:
   ```typescript
   periodicIntervalMs: 120000 // 2 minutes
   ```

4. Use lazy loading:
   ```typescript
   const rrweb = await import('rrweb');
   ```

---

## Migration from Global RrWeb

If you were using rrweb via global `window.rrweb`, migrate to module import:

**Before:**
```html
<script src="rrweb.js"></script>
<script>
  // RrWeb was on window.rrweb
  const recording = rrweb.record({ /* ... */ });
</script>
```

**After:**
```typescript
import * as rrweb from 'rrweb';

new SessionSnapshotPlugin({
  rrwebInstance: rrweb,
  // ... other config
});
```

---

## Testing RrWeb Integration

```typescript
import { initializeSDK, SessionSnapshotPlugin } from '@omni-analytics/sdk';
import * as rrweb from 'rrweb';

// Test setup
const { tracker, container } = await initializeSDK({
  projectId: 'test-project',
  endpoint: 'http://localhost:3000/events',
  snapshot: { enabled: true },
});

const snapshotPlugin = new SessionSnapshotPlugin({
  useRrweb: true,
  rrwebInstance: rrweb,
  debug: true,
});

const status = snapshotPlugin.getStatus();
console.log('Plugin Status:', status);
// Output:
// {
//   name: "session-snapshot",
//   version: "1.0.0",
//   initialized: true,
//   enabled: true,
//   rrwebRecording: true,
// }

// Check event batching
setTimeout(() => {
  tracker.flush().then(() => console.log('Events flushed'));
}, 5000);
```

---

## Backend Integration

When receiving rrweb events, you'll need to:

1. **Store raw rrweb events** for replay playback
2. **Extract heatmap data** from SessionSnapshotEvent
3. **Aggregate for retention metrics** using periodic snapshots

Example event shape:

```json
{
  "type": "rrweb",
  "timestamp": 1639484400000,
  "sessionId": "session-abc123",
  "clientId": "anon-user-123",
  "url": "https://example.com/products",
  "rrwebPayload": {
    "type": 2,
    "data": {
      "node": {
        "type": 0,
        "id": 1,
        "childNodes": []
      },
      "isFullSnapshot": false
    }
  }
}
```

---

## Additional Resources

- [RrWeb GitHub](https://github.com/rrweb-io/rrweb)
- [RrWeb Documentation](https://docs.rrweb.io/)
- [Session Snapshots Guide](./SESSION_SNAPSHOTS.md)
- [Examples](./SNAPSHOTS_EXAMPLES.md)
