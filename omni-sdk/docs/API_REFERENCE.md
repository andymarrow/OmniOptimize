# Omni Analytics SDK - API Reference

Complete API documentation for the Omni Analytics SDK.

## Table of Contents

- [SDK Initialization](#sdk-initialization)
- [Tracker API](#tracker-api)
- [Configuration](#configuration)
- [Types](#types)
- [Container API](#container-api)

## SDK Initialization

### `initializeSDK(config: SDKConfig)`

Initialize the Omni Analytics SDK with configuration.

**Parameters:**

- `config` (SDKConfig) - Configuration object

**Returns:**

```typescript
{
  tracker: Tracker;
  container: Container;
}
```

**Example:**

```typescript
import { initializeSDK } from "@omni-analytics/sdk";

const { tracker } = initializeSDK({
  projectId: "my-project",
  endpoint: "https://api.example.com/events",
});
```

### `getSDK()`

Get the global SDK instance after initialization.

**Returns:** `Container`

**Throws:** Error if SDK not initialized

**Example:**

```typescript
import { getSDK } from "@omni-analytics/sdk";

const container = getSDK();
const tracker = container.getTracker();
```

### `destroySDK()`

Destroy the global SDK instance and cleanup resources.

**Returns:** `void`

**Example:**

```typescript
import { destroySDK } from "@omni-analytics/sdk";

destroySDK();
```

## Tracker API

The main interface for tracking events.

### `tracker.trackPageView(payload?)`

Track a page view event.

**Parameters:**

```typescript
interface PageViewPayload {
  title?: string; // Page title (auto-detected if not provided)
  route?: string; // Route/path (auto-detected if not provided)
  isInitialLoad?: boolean; // true for initial load, false for SPA navigation
}
```

**Returns:** `void`

**Example:**

```typescript
// Auto-detected
tracker.trackPageView();

// Custom values
tracker.trackPageView({
  title: "Products Page",
  route: "/products",
  isInitialLoad: false,
});
```

### `tracker.trackClick(element, coordinates?)`

Track a click event on an element.

**Parameters:**

- `element` (Element) - DOM element that was clicked
- `coordinates?` (object) - Optional custom coordinates
  - `pageX?: number` - X coordinate relative to page
  - `pageY?: number` - Y coordinate relative to page

**Returns:** `void`

**Example:**

```typescript
const button = document.querySelector("button.cta");
tracker.trackClick(button);

// With custom coordinates
tracker.trackClick(button, {
  pageX: 100,
  pageY: 200,
});
```

### `tracker.trackCustom(eventName, properties?)`

Track a custom event.

**Parameters:**

- `eventName` (string) - Name of the event
- `properties?` (object) - Custom properties to include

**Returns:** `void`

**Example:**

```typescript
tracker.trackCustom("user-signup", {
  plan: "premium",
  source: "homepage",
  referrer: "google",
});
```

### `tracker.setUserId(userId)`

Set or update the user ID.

**Parameters:**

- `userId` (string | null) - User ID or null to clear

**Returns:** `void`

**Example:**

```typescript
// On login
tracker.setUserId("user-123");

// On logout
tracker.setUserId(null);
```

### `tracker.setClientId(clientId)`

Set or update the client ID.

**Parameters:**

- `clientId` (string) - Custom client identifier

**Returns:** `void`

**Example:**

```typescript
tracker.setClientId("my-custom-id");
```

### `tracker.getSessionId()`

Get the current session ID.

**Returns:** `string`

**Example:**

```typescript
const sessionId = tracker.getSessionId();
console.log("Session:", sessionId);
```

### `tracker.newSession()`

Start a new session.

**Returns:** `string` - New session ID

**Example:**

```typescript
const newSessionId = tracker.newSession();
console.log("New session started:", newSessionId);
```

### `tracker.flush()`

Manually flush all queued events.

**Returns:** `Promise<void>`

**Example:**

```typescript
// Send all pending events immediately
await tracker.flush();
```

## Configuration

### SDKConfig Interface

```typescript
interface SDKConfig {
  // Required
  projectId: string;
  endpoint: string;

  // Optional
  clientId?: string;
  userId?: string | null;
  batchSize?: number; // Default: 50
  batchTimeout?: number; // Default: 10000 (ms)
  debug?: boolean; // Default: false
  sessionStorageKey?: string; // Default: 'omni_session_id'
  captureErrors?: boolean; // Default: false
}
```

### Default Values

```typescript
{
  projectId: string;                         // Required
  endpoint: string;                          // Required
  clientId: 'anon-{uuid}',                   // Auto-generated
  userId: null,
  batchSize: 50,
  batchTimeout: 10000,
  debug: false,
  sessionStorageKey: 'omni_session_id',
  captureErrors: false,
}
```

## Types

### Event

Base event structure:

```typescript
interface Event {
  eventId: string; // Unique event ID (UUID)
  projectId: string; // Project identifier
  clientId: string; // Client/user identifier
  sessionId: string; // Session identifier
  userId: string | null; // Authenticated user ID
  type: "pageview" | "click" | "input" | "route" | "custom";
  timestamp: number; // Milliseconds since epoch
  url: string; // Current page URL
  referrer: string; // Document referrer
  pageDimensions: { w: number; h: number }; // Page size
  viewport: { w: number; h: number }; // Viewport size
  properties?: Record<string, any>; // Custom properties
}
```

### PageViewEvent

```typescript
interface PageViewEvent extends Event {
  type: "pageview";
  title: string; // Page title
  route: string; // Route/path
  isInitialLoad: boolean; // true = initial load, false = SPA nav
}
```

### ClickEvent

```typescript
interface ClickEvent extends Event {
  type: "click";
  pageX: number; // X coordinate
  pageY: number; // Y coordinate
  selector: string; // CSS selector
  xpath?: string; // XPath selector
  elementTextHash?: string; // Hash of element text
  tagName: string; // HTML tag name
}
```

### Batch

```typescript
interface Batch {
  events: Event[]; // Array of events
  batchId: string; // Unique batch ID
  timestamp: number; // Batch creation time
}
```

## Container API

Direct access to the DI container (advanced usage).

### `container.getTracker()`

Get the Tracker instance.

**Returns:** `Tracker`

### `container.getConfig()`

Get the Config instance.

**Returns:** `Config`

### `container.getSessionManager()`

Get the SessionManager instance.

**Returns:** `SessionManager`

### `container.getEventQueue()`

Get the EventQueue instance.

**Returns:** `EventQueue`

### `container.getTransmitters()`

Get the list of transmitters.

**Returns:** `ITransmitter[]`

### `container.destroy()`

Destroy the container and cleanup.

**Returns:** `void`

## React API

### TrackerProvider

Provides Tracker instance to React components.

**Props:**

```typescript
interface TrackerProviderProps {
  tracker: Tracker;
  children: ReactNode;
}
```

**Example:**

```typescript
import { TrackerProvider } from "@omni-analytics/react";

<TrackerProvider tracker={tracker}>
  <App />
</TrackerProvider>;
```

### useTracker Hook

Access the Tracker instance in React components.

**Returns:** `Tracker`

**Throws:** Error if not within `TrackerProvider`

**Example:**

```typescript
import { useTracker } from "@omni-analytics/react";

function MyComponent() {
  const tracker = useTracker();

  const handleClick = () => {
    tracker.trackCustom("my-event");
  };

  return <button onClick={handleClick}>Click me</button>;
}
```

### useTrackerContext Hook

Access the full tracker context.

**Returns:** `{ tracker: Tracker }`

**Example:**

```typescript
import { useTrackerContext } from "@omni-analytics/react";

function MyComponent() {
  const { tracker } = useTrackerContext();
  // ...
}
```

## Plugin API

### IPlugin Interface

Implement this to create custom plugins:

```typescript
interface IPlugin {
  name: string; // Plugin name
  version: string; // Semantic version
  init(context: PluginContext): Promise<void>;
  destroy?(): Promise<void>;
}
```

### PluginContext

```typescript
interface PluginContext {
  tracker: Tracker;
  config: Config;
  logger?: Logger;
}
```

See [Plugin Development Guide](./PLUGIN_DEVELOPMENT.md) for more details.

## Transmitter API

### ITransmitter Interface

Implement custom transmitters:

```typescript
interface ITransmitter {
  send(batch: Batch): Promise<void>;
  isAvailable(): boolean;
  getPriority?(): number; // Higher = preferred
}
```

## Error Handling

The SDK handles errors gracefully:

1. **Network errors** - Automatically retries with exponential backoff
2. **Invalid config** - Throws error on initialization
3. **Queue overflow** - Events are dropped with console warning
4. **Transmitter unavailable** - Tries next transmitter in chain

## Performance Considerations

- Events are batched by default (50 events or 10 seconds)
- Use `batchSize` and `batchTimeout` to tune performance
- SDK stores session ID in localStorage (minimal overhead)
- Automatic click tracking uses event delegation (single listener)

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES2015+ (requires transpilation for older browsers)
- CDN version includes polyfills

Supported browsers:

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+
