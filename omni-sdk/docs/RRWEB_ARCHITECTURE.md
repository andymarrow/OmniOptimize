# RrWeb Integration Architecture

## Component Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                        │
│  (React App, Vue App, Vanilla JS, etc.)                    │
└──────────────────┬──────────────────────────────────────────┘
                   │
        ┌──────────┴────────────┐
        │                       │
        ▼                       ▼
┌──────────────────┐   ┌──────────────────┐
│  import rrweb    │   │  import SDK      │
│  from 'rrweb'    │   │  from '@omni...' │
└────────┬─────────┘   └────────┬─────────┘
         │                      │
         └──────────┬───────────┘
                    │
                    ▼
        ┌───────────────────────────────────┐
        │  initializeSDK({ config })        │
        └───────────┬───────────────────────┘
                    │
        ┌───────────┴──────────────────────────────┐
        │                                          │
        ▼                                          ▼
  ┌──────────────┐                      ┌─────────────────┐
  │   Tracker    │◄──────┐              │  PluginRegistry │
  │              │       │              │                 │
  │ - pageView() │       │              │ - register()    │
  │ - click()    │       │              │ - initialize()  │
  │ - snapshot() │   Injected          │                 │
  │ - rrweb()    │       │              └────┬────────────┘
  └──────┬───────┘       │                   │
         │               │        ┌──────────┴──────────┐
         │               │        │                     │
         ▼               │        ▼                     ▼
  ┌────────────────┐     │  ┌──────────────┐  ┌──────────────────┐
  │  EventQueue    │     │  │  PageView    │  │ SessionSnapshot  │
  │                │     │  │  Plugin      │  │  Plugin          │
  │ - add()        │     │  │              │  │                  │
  │ - flush()      │     │  │ Tracks:      │  │ Tracks:          │
  │                │     │  │ - pageviews  │  │ - rrweb events   │
  └────────┬───────┘     │  │ - spa nav    │  │ - snapshots      │
           │             │  └──────────────┘  │ - heatmaps       │
           │             │                    │                  │
           │             └────────────────────┤ Uses:            │
           │                                  │ ┌──────────────┐ │
           │                                  │ │ RrwebManager │ │
           │                                  │ │              │ │
           │                                  │ │ - init()     │ │
           │                                  │ │ - record()   │ │
           │                                  │ │ - stop()     │ │
           │                                  │ └──────┬───────┘ │
           │                                  │        │         │
           │                                  │        ▼         │
           │                                  │   ┌────────────┐ │
           │                                  │   │ rrweb lib  │ │
           │                                  │   │            │ │
           │                                  │   │ - record() │ │
           │                                  │   │ - pack()   │ │
           │                                  │   │ - unpack()│ │
           │                                  │   └────────────┘ │
           │                                  └──────────────────┘
           │
           ▼
  ┌──────────────────────────────┐
  │  Transmitters                │
  │  - FetchTransmitter          │
  │  - BeaconTransmitter         │
  └──────────────┬───────────────┘
                 │
                 ▼
        ┌────────────────────┐
        │  Backend API       │
        │  /events endpoint   │
        └────────────────────┘
```

---

## Data Flow

### 1. Initialization Flow

```
App
  │
  ├─ import rrweb from 'rrweb'
  │
  ├─ initializeSDK(config)
  │  │
  │  └─ Container.init()
  │     │
  │     ├─ Create Tracker
  │     ├─ Create EventQueue
  │     ├─ Create SessionManager
  │     │
  │     └─ Create PluginRegistry
  │        │
  │        ├─ Register PageViewPlugin
  │        ├─ Register ClickTrackingPlugin
  │        │
  │        └─ Register SessionSnapshotPlugin
  │           │
  │           └─ new RrwebManager(rrweb)
  │              │
  │              └─ init({ onRecord: callback })
  │                 │
  │                 └─ startRecording()
  │                    │
  │                    └─ rrweb.record()
  │
  └─ Return { tracker, container }
```

### 2. Event Tracking Flow

```
User Action (click, scroll, input)
  │
  ├─ Automatic Detection
  │  │
  │  ├─ ClickTrackingPlugin.onClick()
  │  │  └─ tracker.trackClick(element, coords)
  │  │
  │  └─ PageViewPlugin.onNavigation()
  │     └─ tracker.trackPageView()
  │
  └─ Callback (rrweb)
     │
     └─ RrwebManager.onRecord()
        │
        ├─ Capture rrweb event
        │  └─ transformRrwebEvent()
        │
        ├─ Extract heatmap data (clicks)
        │
        └─ tracker.trackRrweb() or tracker.trackSnapshot()
           │
           └─ EventQueue.add(event)
              │
              ├─ Size check: batch full?
              │  └─ Yes: flush()
              │
              └─ Timer check: timeout reached?
                 └─ Yes: flush()
```

### 3. Event Batching & Transmission Flow

```
EventQueue.add(event)
  │
  ├─ events.push(event)
  │
  ├─ If events.length >= batchSize
  │  └─ flush()
  │
  └─ Else if no timer
     └─ setTimeout(flush, batchTimeout)

EventQueue.flush()
  │
  ├─ Create Batch
  │  ├─ events: [ ... ]
  │  ├─ batchId: uuid
  │  └─ timestamp: now
  │
  ├─ Clear events array
  │
  └─ transmit(batch)
     │
     ├─ FetchTransmitter (primary)
     │  └─ fetch(endpoint, { method: 'POST', body: batch })
     │
     └─ BeaconTransmitter (fallback)
        └─ navigator.sendBeacon(endpoint, batch)
```

---

## Class Hierarchy

```
IPlugin (Interface)
  │
  ├─ PageViewPlugin
  │
  ├─ ClickTrackingPlugin
  │
  └─ SessionSnapshotPlugin
     │
     └─ Uses: RrwebManager
        │
        └─ Manages: RrwebLibrary instance

Tracker
  │
  ├─ trackPageView()
  ├─ trackClick()
  ├─ trackCustom()
  ├─ trackSnapshot() ← NEW
  └─ trackRrweb() ← NEW

RrwebManager
  │
  ├─ constructor(rrwebInstance?)
  ├─ init(config)
  ├─ startRecording()
  ├─ stopRecording()
  ├─ setRrwebInstance(rrweb)
  ├─ isAvailable()
  ├─ isRecording()
  ├─ destroy()
  └─ getStatus()

EventQueue
  │
  ├─ add(event)
  ├─ flush()
  ├─ transmit(batch)
  └─ destroy()
```

---

## State Management

### SessionSnapshotPlugin State

```typescript
{
  // Lifecycle
  initialized: boolean
  tracker: Tracker
  config: SDKConfig

  // RrWeb Integration
  rrwebManager: RrwebManager | null
  options: SessionSnapshotPluginOptions
    ├─ useRrweb: boolean
    ├─ rrwebInstance: RrwebLibrary | null ← INJECTED
    ├─ useFallbackSnapshots: boolean
    └─ debug: boolean

  // Configuration
  snapshotConfig: SnapshotConfig
  privacyConfig: PrivacyConfig

  // Observers
  mutationObserver: MutationObserver | null
  periodicTimer: ReturnType<setInterval> | null

  // Tracking
  lastLayoutHash: string | null
  capturedClicks: HeatmapClick[]
  lastSnapshotTime: number
}
```

### RrwebManager State

```typescript
{
  // Lifecycle
  recording: boolean
  initialized: boolean
  rrwebLib: RrwebLibrary | null

  // Configuration
  onRecord: RrwebEventCallback | null
  config: RrwebManagerConfig | null

  // Recording
  rrwebStopFn: (() => void) | null
}
```

---

## Event Type Relationships

```
BaseEvent (interface)
  │
  ├─ PageViewEvent
  │  ├─ type: 'pageview'
  │  └─ Fields: url, title, route, isInitialLoad
  │
  ├─ ClickEvent
  │  ├─ type: 'click'
  │  └─ Fields: pageX, pageY, xNorm, yNorm, selector, screenClass, layoutHash
  │
  ├─ SessionSnapshotEvent ← NEW
  │  ├─ type: 'session_snapshot'
  │  ├─ snapshotType: 'initial' | 'mutation' | 'periodic' | 'rrweb'
  │  └─ Fields: dom, layoutHash, screenClass, clicks[], viewport
  │
  └─ RrwebEvent ← NEW
     ├─ type: 'rrweb'
     └─ Fields: rrwebPayload { type, data, timestamp }
```

---

## Dependency Injection Pattern

### Constructor Injection (RrwebManager)

```typescript
// Before: Relied on global
const manager = new RrwebManager();

// After: Explicit dependency
const rrweb = require("rrweb");
const manager = new RrwebManager(rrweb);
```

### Setter Injection (lazy loading)

```typescript
const manager = new RrwebManager();

// Later...
const rrweb = await import("rrweb");
manager.setRrwebInstance(rrweb);
```

### Plugin Configuration Injection

```typescript
const plugin = new SessionSnapshotPlugin({
  rrwebInstance: rrweb,
});
```

---

## Error Handling Hierarchy

```
RrwebManager.init()
  │
  ├─ Check: rrwebInstance available?
  │  └─ No: return false, fallback to manual
  │
  └─ Try: rrweb.record()
     ├─ Success: return true, recording
     └─ Error: catch, log, return false, fallback

SessionSnapshotPlugin.init()
  │
  ├─ Check: snapshotConfig.enabled?
  │  └─ No: return early
  │
  ├─ Try: setupRrweb()
  │  ├─ Success: use rrweb events
  │  └─ Fail: fallback to manual snapshots
  │
  └─ Setup fallback if enabled
     ├─ Mutation observer
     └─ Periodic snapshots
```

---

## Privacy & Security Layer

```
User DOM
  │
  ├─ RrwebManager
  │  │
  │  ├─ blockSelectors: completely remove
  │  │  └─ .payment-form, [data-sensitive]
  │  │
  │  └─ maskSelectors: hide content
  │     └─ input[type="password"], input[name*="token"]
  │
  ├─ SessionSnapshotPlugin
  │  │
  │  ├─ maskDefaultSensitiveFields()
  │  │  └─ password, cc, ssn, token fields
  │  │
  │  ├─ removeScripts()
  │  │  └─ <script>, <noscript>
  │  │
  │  ├─ removeEventHandlers()
  │  │  └─ on*, data-*, aria-*
  │  │
  │  └─ truncateDOM()
  │     └─ Max 512KB
  │
  └─ Transmission
     └─ Compress (gzip)
```

---

## Integration Points

### 1. With Tracker

```typescript
tracker.trackPageView(); // PageViewPlugin
tracker.trackClick(); // ClickTrackingPlugin
tracker.trackSnapshot(); // SessionSnapshotPlugin ← NEW
tracker.trackRrweb(); // SessionSnapshotPlugin ← NEW
tracker.trackCustom(); // Any plugin
```

### 2. With Config

```typescript
config.snapshot = {
  enabled: true,
  captureInitial: true,
  captureMutations: true,
}

config.privacy = {
  blockSelectors: [...],
  maskSelectors: [...],
}
```

### 3. With Container

```typescript
container.getTracker(); // Access tracker
container.getConfig(); // Access config
container.getPluginRegistry(); // Manage plugins
container.getEventQueue(); // Access queue
```

---

## Performance Characteristics

```
Initialization:
  ├─ SDKInit: ~50ms
  ├─ PluginInit: ~100ms
  └─ RrwebInit: ~200ms
  Total: ~350ms

Event Tracking:
  ├─ PageView: ~5ms
  ├─ Click: ~10ms
  ├─ Snapshot: ~50ms
  └─ RrWeb event: <1ms

Batching:
  ├─ Add to queue: O(1)
  ├─ Flush batch: ~100ms
  └─ Transmission: ~200ms

Memory:
  ├─ Event queue (50 events): ~50KB
  ├─ RrWeb recording: ~5-10MB
  └─ Total: ~10MB steady state
```

---

## Testing Strategy

```
Unit Tests:
  ├─ RrwebManager
  │  ├─ init() with/without instance
  │  ├─ startRecording()
  │  ├─ stopRecording()
  │  └─ setRrwebInstance()
  │
  ├─ SessionSnapshotPlugin
  │  ├─ init() with rrweb
  │  ├─ init() without rrweb (fallback)
  │  └─ handleRrwebEvent()
  │
  └─ Tracker
     ├─ trackSnapshot()
     └─ trackRrweb()

Integration Tests:
  ├─ Full initialization flow
  ├─ Event capture and batching
  ├─ Fallback scenarios
  └─ Error handling

E2E Tests:
  ├─ Real event tracking
  ├─ Snapshot capture
  ├─ Transmission to backend
  └─ Session replay playback
```

---

This architecture provides:

- ✅ Clear separation of concerns
- ✅ Dependency injection for testability
- ✅ Flexible plugin system
- ✅ Graceful error handling
- ✅ Privacy-first design
- ✅ Performance optimization
