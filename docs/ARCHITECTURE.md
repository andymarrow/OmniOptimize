# Omni Analytics SDK - Architecture

This document describes the internal architecture of the Omni Analytics SDK, designed following SOLID principles.

## Table of Contents

- [Design Principles](#design-principles)
- [Architecture Overview](#architecture-overview)
- [Core Modules](#core-modules)
- [Data Flow](#data-flow)
- [Plugin System](#plugin-system)
- [Dependency Injection](#dependency-injection)

## Design Principles

The SDK strictly adheres to SOLID principles:

### Single Responsibility Principle (SRP)

Each module has a single, well-defined responsibility:

- **Config** - Configuration management only
- **SessionManager** - Session lifecycle only
- **Tracker** - Event tracking interface only
- **EventQueue** - Event batching and flushing only
- **ITransmitter** - Event transmission abstraction only
- **PluginRegistry** - Plugin management only

### Open/Closed Principle (OCP)

The SDK is open for extension but closed for modification:

- New event types can be added via plugins
- New transmitters can be implemented without modifying core
- Custom plugins extend functionality without changing core code

### Liskov Substitution Principle (LSP)

Implementations are substitutable for their interfaces:

- Any `ITransmitter` can replace another
- Any `IPlugin` can be registered and used
- Components depend on abstractions, not implementations

### Interface Segregation Principle (ISP)

Interfaces are focused and minimal:

- `ITransmitter` - Only `send()` and `isAvailable()`
- `IPlugin` - Only `init()` and optional `destroy()`
- Plugins only receive what they need in `PluginContext`

### Dependency Inversion Principle (DIP)

High-level modules depend on abstractions:

- `Tracker` depends on `ITransmitter` abstraction
- `EventQueue` depends on `ITransmitter` abstraction
- All dependencies are injected via `Container`

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                   SDK Initialization                 │
│              Container (DI & Orchestration)          │
└────────────┬────────────────────────────────┬────────┘
             │                                │
     ┌───────▼──────────┐        ┌────────────▼──────┐
     │  Plugin System   │        │  Tracker (Public) │
     │  ├─ Registry     │        │  ├─ trackPageView │
     │  ├─ PageView     │        │  ├─ trackClick    │
     │  └─ ClickTracker │        │  └─ trackCustom   │
     └────────┬─────────┘        └────────┬───────────┘
              │                           │
              └───────────┬───────────────┘
                          │
                  ┌───────▼────────┐
                  │   Config       │
                  │   SessionMgr   │
                  │   EventQueue   │
                  └───────┬────────┘
                          │
                  ┌───────▼────────────────┐
                  │   ITransmitter         │
                  │   ├─ Fetch (primary)   │
                  │   └─ Beacon (fallback) │
                  └────────────────────────┘
                          │
                          ▼
                    Backend Server
```

## Core Modules

### 1. Config Module

**File:** `src/config/Config.ts`

Manages all SDK configuration.

**Responsibilities:**

- Validate required config
- Store configuration values
- Provide getters for accessing config
- Support runtime updates (userId, clientId)

**Key Features:**

- Immutable after creation (except userId/clientId)
- Auto-generates anonymous clientId if not provided
- Validates projectId and endpoint

```typescript
// Initialization
const config = new Config({
  projectId: "my-project",
  endpoint: "https://api.example.com/events",
  debug: true,
});

// Runtime updates
config.setUserId("user-123");
config.setClientId("custom-id");
```

### 2. SessionManager Module

**File:** `src/session/SessionManager.ts`

Manages session lifecycle and persistence.

**Responsibilities:**

- Generate unique session IDs
- Persist session to localStorage
- Provide session ID to other modules
- Support session lifecycle (new, clear)

**Key Features:**

- Auto-generates on first access
- Persists across page reloads
- Graceful fallback if localStorage unavailable
- Format: `session-{timestamp}-{random}`

```typescript
// Get or create session
const sessionId = sessionManager.getSessionId();

// Start new session
const newId = sessionManager.startNewSession();

// Clear session
sessionManager.clearSession();
```

### 3. EventQueue Module

**File:** `src/queue/EventQueue.ts`

Batches events and manages transmission.

**Responsibilities:**

- Accumulate events in queue
- Auto-flush when batch size reached
- Auto-flush when timeout exceeded
- Select best available transmitter
- Handle transmission failures gracefully

**Key Features:**

- Configurable batch size (default: 50)
- Configurable timeout (default: 10 seconds)
- Automatic retry selection of transmitters
- Logs transmission errors without crashing

**Data Structure:**

```typescript
// Internal queue
events: Event[] = [];

// Transmission when:
// 1. events.length >= batchSize, OR
// 2. timeout expires
```

### 4. Tracker Module

**File:** `src/tracker/Tracker.ts`

Public interface for tracking events.

**Responsibilities:**

- Provide high-level tracking methods
- Enrich events with context (URL, viewport, etc.)
- Delegate to EventQueue
- Support user/client ID management

**Key Features:**

- Auto-enriches events with page context
- Generates unique event IDs
- Supports both auto and manual tracking
- Debug logging support

**Public Methods:**

```typescript
tracker.trackPageView(payload?)
tracker.trackClick(element, coordinates?)
tracker.trackCustom(eventName, properties?)
tracker.setUserId(userId)
tracker.setClientId(clientId)
tracker.getSessionId()
tracker.newSession()
tracker.flush()
```

### 5. Transmitter Module

**File:** `src/transmitter/`

Defines transmission strategies.

**ITransmitter Interface:**

- `send(batch: Batch): Promise<void>` - Send batch
- `isAvailable(): boolean` - Check environment support
- `getPriority?(): number` - Transmission priority

**Implementations:**

**FetchTransmitter** (Priority: 10)

- Uses modern Fetch API
- Includes automatic retry with exponential backoff
- Supports timeout configuration
- Preferred in modern browsers

**BeaconTransmitter** (Priority: 5)

- Uses Navigator Beacon API
- Guaranteed delivery on page unload
- No response body
- Fallback for older browsers

**Selection Logic:**

1. Sort by priority (highest first)
2. Check `isAvailable()` for each
3. Use first available transmitter
4. Retry next if transmission fails

### 6. DI Container Module

**File:** `src/di/Container.ts`

Manages dependency injection and module wiring.

**Responsibilities:**

- Create and wire all modules
- Manage module lifecycle
- Provide access to modules via getters
- Support custom implementations

**Key Features:**

- Single responsibility per getter
- Supports custom transmitters
- Supports custom implementations
- Cleanup on destroy

```typescript
const container = new Container(config);
const tracker = container.getTracker();
const config = container.getConfig();
container.destroy(); // Cleanup
```

### 7. Plugin System

**File:** `src/plugins/`

Extensibility framework for custom tracking.

**Key Components:**

**PluginRegistry**

- Manages plugin registration
- Handles plugin lifecycle (init, destroy)
- Tracks initialization state
- Provides status information

**IPlugin Interface**

```typescript
interface IPlugin {
  name: string;
  version: string;
  init(context: PluginContext): Promise<void>;
  destroy?(): Promise<void>;
}
```

**PluginContext**

```typescript
interface PluginContext {
  tracker: Tracker;
  config: Config;
  logger?: Logger;
}
```

**Built-in Plugins:**

**PageViewPlugin**

- Tracks initial page load
- Intercepts `history.pushState` for SPA navigation
- Sends page view event on navigation

**ClickTrackingPlugin**

- Listens to document-level click events
- Captures element metadata (selector, XPath, tag)
- Sends click event with coordinates

## Data Flow

### Event Creation Flow

```
User Action (Page Load / Click / Custom)
    ↓
Tracker.track(event)
    ├─ Enrich with page context
    ├─ Generate event ID
    └─ Pass to EventQueue
         ↓
    EventQueue.add(event)
    ├─ Add to events array
    ├─ Check if should flush
    │  ├─ Size >= batchSize? → flush
    │  └─ Timeout? → flush
    └─ Continue
         ↓
    EventQueue.flush()
    ├─ Create Batch
    ├─ Select transmitter
    │  ├─ FetchTransmitter? (try first)
    │  └─ BeaconTransmitter? (fallback)
    └─ Call transmitter.send(batch)
         ↓
    ITransmitter.send(batch)
    ├─ POST to endpoint
    ├─ On success → clear queue
    └─ On failure → log error
         ↓
    Backend Server
    ├─ Process batch
    └─ Respond 200 OK
```

### Batch Structure

```typescript
{
  events: [
    { /* event 1 */ },
    { /* event 2 */ },
    // ... up to batchSize
  ],
  batchId: "batch-1234567890-abc",
  timestamp: 1699999999999
}
```

## Plugin System

### Plugin Lifecycle

```
1. Register Plugin
   pluginRegistry.register(plugin)

2. Initialize Plugin
   await plugin.init(pluginContext)
   ├─ Plugin sets up listeners
   ├─ Plugin registers event handlers
   └─ Plugin becomes active

3. Emit Events
   Plugin sends events via tracker
   ├─ pageViewPlugin → trackPageView()
   └─ clickPlugin → trackClick()

4. Destroy Plugin (on SDK destroy)
   await plugin.destroy()
   ├─ Plugin removes listeners
   ├─ Plugin cleans up resources
   └─ Plugin becomes inactive
```

### Creating Custom Plugins

See [Plugin Development Guide](./PLUGIN_DEVELOPMENT.md) for detailed examples.

## Dependency Injection

### Container Setup

```typescript
// 1. Config
const config = new Config(sdkConfig);

// 2. SessionManager
const sessionManager = new SessionManager(config.getSessionStorageKey());

// 3. Transmitters
const transmitters = [
  new FetchTransmitter(config.getEndpoint()),
  new BeaconTransmitter(config.getEndpoint()),
];

// 4. EventQueue
const eventQueue = new EventQueue(
  transmitters,
  config.getBatchSize(),
  config.getBatchTimeout()
);

// 5. Tracker
const tracker = new Tracker(config, sessionManager, eventQueue);

// 6. All wired together in Container
```

### Benefits

1. **Testability** - Easy to mock dependencies
2. **Flexibility** - Swap implementations easily
3. **Maintainability** - Clear dependencies
4. **Scalability** - Add new modules without changing existing ones

## Error Handling

### Graceful Degradation

1. **Network errors** → Retry with exponential backoff
2. **Both transmitters fail** → Log error, continue
3. **localStorage unavailable** → Use memory-only session
4. **Plugin init fails** → Log error, continue with other plugins
5. **Invalid config** → Throw error at initialization

### Debug Logging

Enable with `debug: true` to see:

- SDK initialization
- Config values
- Event tracking
- Queue flushing
- Transmitter attempts
- Error conditions

## Performance Characteristics

| Operation       | Time     | Notes                |
| --------------- | -------- | -------------------- |
| SDK Init        | <5ms     | Fast initialization  |
| Event Track     | <1ms     | Minimal overhead     |
| Batch Creation  | <1ms     | Simple serialization |
| Fetch Transmit  | 50-300ms | Network dependent    |
| Beacon Transmit | <1ms     | Fire and forget      |

## Memory Usage

- **Per Event** - ~200 bytes (JSON serialized)
- **Per Batch** - ~10KB (typical 50 events)
- **Session Storage** - <1KB (localStorage)
- **Plugin Listeners** - ~100 bytes each

Batching prevents memory accumulation by flushing regularly.

## Extensibility Points

1. **Custom Transmitters** - Implement `ITransmitter`
2. **Custom Plugins** - Implement `IPlugin`
3. **Event Enrichment** - Modify `Tracker` methods
4. **Custom Config** - Extend `Config` class
5. **Alternative Storage** - Extend `SessionManager`

See individual module documentation for details.
