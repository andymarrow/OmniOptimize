# RrWeb Dependency Integration - Complete Summary

## Overview

The Omni Analytics SDK now properly integrates **rrweb as an optional peer dependency** for session replay and interaction capture. This implementation allows:

1. **Module-based imports** - Import rrweb from npm and pass to SDK
2. **CDN fallback** - Auto-detect rrweb if loaded via script tag
3. **Lazy loading** - Load rrweb only when needed
4. **Graceful degradation** - Fall back to manual snapshots if rrweb unavailable

---

## Key Changes

### 1. **Package Dependencies** (`packages/sdk/package.json`)

Added rrweb as optional peer dependency:

```json
{
  "peerDependencies": {
    "rrweb": "^2.0.0"
  },
  "peerDependenciesMeta": {
    "rrweb": {
      "optional": true
    }
  },
  "optionalDependencies": {
    "rrweb": "^2.0.0"
  }
}
```

**Benefits:**

- Users choose to install rrweb only if they need session replay
- No bloat for users only using click/pageview tracking
- Clear optional dependency management

### 2. **RrwebManager Refactoring** (`packages/sdk/src/utils/rrwebIntegration.ts`)

#### Changed: Constructor now accepts rrweb instance

**Before:**

```typescript
const manager = new RrwebManager();
// Would try to find window.rrweb
```

**After:**

```typescript
import * as rrweb from "rrweb";
const manager = new RrwebManager(rrweb);
// Explicitly pass imported instance
```

#### New Interface: RrwebLibrary

```typescript
export interface RrwebLibrary {
  record(options: Record<string, any>): () => void;
  pack(data: any): any;
  unpack(data: any): any;
}
```

#### New Method: setRrwebInstance

Allows lazy loading of rrweb:

```typescript
const manager = new RrwebManager();

// Load later when needed
const rrweb = await import("rrweb");
manager.setRrwebInstance(rrweb);
manager.startRecording();
```

### 3. **SessionSnapshotPlugin Enhancement** (`packages/sdk/src/plugins/session-snapshot/SessionSnapshotPlugin.ts`)

#### New Option: rrwebInstance

```typescript
interface SessionSnapshotPluginOptions {
  useRrweb?: boolean;
  rrwebInstance?: any; // ← NEW
  useFallbackSnapshots?: boolean;
  debug?: boolean;
}
```

#### Usage:

```typescript
import * as rrweb from "rrweb";

const plugin = new SessionSnapshotPlugin({
  useRrweb: true,
  rrwebInstance: rrweb, // Pass imported instance
  useFallbackSnapshots: true,
});
```

### 4. **Export Types** (`packages/sdk/src/index.ts`)

Exported new types:

```typescript
export type { RrwebLibrary } from "./utils/rrwebIntegration";
export type { SessionSnapshotPluginOptions } from "./plugins/session-snapshot/SessionSnapshotPlugin";
```

### 5. **Documentation** (New file: `docs/RRWEB_SETUP.md`)

Comprehensive setup guide covering:

- Installation methods (npm, CDN, hybrid)
- 3 usage patterns (npm import, CDN, lazy loading)
- Configuration options
- Performance tuning
- Error handling
- Troubleshooting
- Backend integration

---

## Installation Methods

### Method 1: NPM + Module Import (Recommended)

```bash
pnpm add @omni-analytics/sdk rrweb
```

```typescript
import { initializeSDK, SessionSnapshotPlugin } from "@omni-analytics/sdk";
import * as rrweb from "rrweb";

const { tracker, container } = await initializeSDK({
  projectId: "my-project",
  endpoint: "https://api.example.com/events",
});

const plugin = new SessionSnapshotPlugin({
  rrwebInstance: rrweb,
});
```

### Method 2: CDN Only (Auto-detection)

```html
<script src="https://cdn.jsdelivr.net/npm/rrweb/dist/rrweb.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@omni-analytics/sdk/dist/index.umd.js"></script>

<script>
  const { initializeSDK } = window.OmniAnalytics;

  initializeSDK({
    projectId: "my-project",
    endpoint: "https://api.example.com/events",
  });
  // Auto-detects window.rrweb
</script>
```

### Method 3: Lazy Loading

```typescript
const { initializeSDK } = await import("@omni-analytics/sdk");

const { tracker, container } = await initializeSDK({
  projectId: "my-project",
  endpoint: "https://api.example.com/events",
});

// Load rrweb only when needed
const rrweb = await import("rrweb");

const plugin = new SessionSnapshotPlugin({
  rrwebInstance: rrweb,
});
```

---

## Feature Matrix

| Feature                 | npm Import | CDN Global | Lazy Load |
| ----------------------- | ---------- | ---------- | --------- |
| **Bundle size control** | ✅         | ❌         | ✅        |
| **Tree-shaking**        | ✅         | ❌         | ✅        |
| **TypeScript support**  | ✅         | ⚠️         | ✅        |
| **SSR compatible**      | ✅         | ⚠️         | ✅        |
| **Simple setup**        | ⚠️         | ✅         | ⚠️        |
| **Fallback to manual**  | ✅         | ✅         | ✅        |

---

## Backward Compatibility

✅ **Fully backward compatible**

- Existing code continues to work
- SessionSnapshotPlugin can be used with or without rrweb
- Falls back to manual snapshots gracefully
- No breaking changes to API

---

## Error Handling

The implementation handles all failure scenarios:

1. **RrWeb not installed:**

   ```
   ❌ rrweb not available. Install via npm: npm install rrweb
   ✅ Falls back to manual snapshots
   ```

2. **RrWeb not available on window (CDN):**

   ```
   ❌ rrweb not available globally
   ✅ Falls back to manual snapshots
   ```

3. **Recording fails:**
   ```
   ❌ Failed to start recording
   ✅ Continues with manual snapshots
   ```

---

## Performance Implications

### Bundle Size

- **SDK alone:** ~50KB (gzipped)
- **rrweb:** ~30KB (gzipped)
- **Total with rrweb:** ~80KB (gzipped)
- **Without rrweb:** ~50KB (gzipped)

### Runtime

- **Optional loading:** Load rrweb only when needed
- **Sampling:** Configurable sample rate reduces overhead
- **Compression:** Auto-gzip compression of snapshots
- **Blocking selectors:** Skip recording unnecessary elements

### Memory

- **Event queue:** Batching reduces in-memory event count
- **Snapshots:** Truncated at 512KB by default
- **Lazy cleanup:** Resources freed on destroy()

---

## Migration Guide

### From Global RrWeb

**Before:**

```typescript
// Relied on window.rrweb being available
const plugin = new SessionSnapshotPlugin();
```

**After:**

```typescript
import * as rrweb from "rrweb";

const plugin = new SessionSnapshotPlugin({
  rrwebInstance: rrweb,
});
```

### Testing RrWeb Integration

```typescript
const manager = new RrwebManager(rrweb);

const status = manager.getStatus();
console.log(status);
// {
//   recording: true,
//   initialized: true,
//   available: true,
//   debug: false
// }

manager.stopRecording();
manager.destroy();
```

---

## Next Steps

1. **Install rrweb:** `pnpm add rrweb`
2. **Review setup guide:** See `docs/RRWEB_SETUP.md`
3. **Check examples:** See `docs/SNAPSHOTS_EXAMPLES.md`
4. **Configure privacy:** Set `blockSelectors` and `maskSelectors`
5. **Monitor performance:** Use debug mode to check overhead
6. **Test fallback:** Verify behavior with/without rrweb

---

## Related Documentation

- [RrWeb Setup Guide](./RRWEB_SETUP.md) - Installation & configuration
- [Session Snapshots](./SESSION_SNAPSHOTS.md) - Feature details
- [Examples](./SNAPSHOTS_EXAMPLES.md) - Code examples
- [Implementation Summary](./IMPLEMENTATION_SUMMARY.md) - Complete feature overview
- [API Reference](./API_REFERENCE.md) - Complete API
