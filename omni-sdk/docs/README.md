# Omni Analytics SDK Documentation

Complete documentation for the Omni Analytics SDK - a highly extensible, SOLID-principled analytics SDK for deep website usage analysis.

## Quick Links

- 🚀 [Getting Started](./GETTING_STARTED.md) - Start here if you're new
- 📚 [API Reference](./API_REFERENCE.md) - Complete API documentation
- 🏗️ [Architecture](./ARCHITECTURE.md) - Internal design and structure
- 🔌 [Plugin Development](./PLUGIN_DEVELOPMENT.md) - Create custom plugins
- 📹 [Session Snapshots](./SESSION_SNAPSHOTS.md) - Session replay with DOM snapshots
- 🎯 [Heatmaps Guide](./SESSION_SNAPSHOTS.md#heatmaps) - User interaction heatmaps
- 🔧 [RrWeb Setup](./RRWEB_SETUP.md) - Install and configure rrweb for session replay
- 💡 [Examples](./SNAPSHOTS_EXAMPLES.md) - Code examples for snapshots and heatmaps
- 📋 [Implementation Summary](./IMPLEMENTATION_SUMMARY.md) - Complete feature overview
- 📖 **[RrWeb Documentation Index](./RRWEB_DOCUMENTATION_INDEX.md)** - All RrWeb guides

## What is Omni Analytics SDK?

Omni Analytics SDK is a lightweight, highly extensible analytics platform designed for capturing deep insights into user behavior on websites. It's built with SOLID principles to ensure:

- **Easy Integration** - Drop-in initialization
- **Automatic Tracking** - Page views, clicks, and more tracked automatically
- **Extensible** - Create custom plugins for any tracking need
- **Type-Safe** - Full TypeScript support
- **Framework Agnostic** - Works with any JavaScript framework
- **Performance Optimized** - Minimal overhead with automatic batching

## Key Features

### 📊 Automatic Tracking

Initialize once and the SDK automatically tracks:

- ✅ Initial page loads
- ✅ Single Page Application (SPA) navigation
- ✅ User clicks with coordinates and element selectors
- ✅ Generates heatmap-ready data
- ✅ Session management

### 🔌 Plugin System

Extend functionality without modifying core:

- Create custom plugins for any tracking need
- Built-in Page View and Click Tracking plugins
- Easy plugin lifecycle management
- Full access to Tracker and Config

### 📦 Smart Batching

Optimize network usage:

- Configurable batch size (default: 50 events)
- Configurable timeout (default: 10 seconds)
- Automatic batch flushing
- Automatic retry with exponential backoff

### 🌐 Multiple Transmission Methods

Reliable event delivery:

- Primary: Fetch API with automatic retry
- Fallback: Navigator Beacon for guaranteed delivery on page unload
- Automatic strategy selection

### ⚛️ React Integration

First-class React support:

- `TrackerProvider` context
- `useTracker` hook
- Full TypeScript support

### 📹 Session Replay & Heatmaps

Advanced user behavior analysis with **rrweb** integration:

- **Session Replay** - Capture and replay full user sessions with DOM snapshots
- **Heatmaps** - Visualize user interactions with normalized coordinates
- **Retention Metrics** - Track user journeys and funnel metrics
- **Privacy-First** - Mask sensitive inputs, block payment forms, respect user preferences
- **Optional Dependency** - Install rrweb separately for replay capabilities
- **Flexible Capture** - Initial, mutation-based, or periodic snapshots

[Learn more →](./RRWEB_SETUP.md)

### 🏗️ SOLID Architecture

Production-ready design:

- Single Responsibility Principle
- Open/Closed Principle
- Liskov Substitution Principle
- Interface Segregation Principle
- Dependency Inversion Principle

## Installation

### NPM

```bash
npm install @omni-analytics/sdk
```

### PNPM

```bash
pnpm add @omni-analytics/sdk
```

### Yarn

```bash
yarn add @omni-analytics/sdk
```

### CDN

```html
<script src="https://cdn.example.com/omni-analytics.umd.js"></script>
```

## Quick Start

### Step 1: Initialize

```typescript
import { initializeSDK } from "@omni-analytics/sdk";

const { tracker } = initializeSDK({
  projectId: "my-project",
  endpoint: "https://api.example.com/events",
});
```

### Step 2: That's It!

The SDK automatically tracks:

- Page views
- User clicks
- SPA navigation

Events are batched and sent to your endpoint.

### Step 3: Backend Handler

Your backend receives batches:

```typescript
POST /events HTTP/1.1

{
  "events": [
    {
      "eventId": "uuid",
      "projectId": "my-project",
      "clientId": "anon-uuid",
      "sessionId": "session-id",
      "type": "pageview|click",
      "timestamp": 1699999999999,
      "url": "https://example.com/page",
      // ... more fields
    }
  ],
  "batchId": "batch-id",
  "timestamp": 1699999999999
}
```

## Event Structure

All events include:

```typescript
{
  eventId: string; // Unique UUID
  projectId: string; // Your project ID
  clientId: string; // User identifier (anon or real)
  sessionId: string; // Session identifier
  userId: string | null; // Authenticated user (if available)
  type: "pageview" | "click" | "custom";
  timestamp: number; // Unix milliseconds
  url: string; // Current page URL
  referrer: string; // Document referrer
  pageDimensions: {
    // Page size
    w: number;
    h: number;
  }
  viewport: {
    // Viewport size
    w: number;
    h: number;
  }
  properties: object; // Custom properties
}
```

### Page View Event

```json
{
  "type": "pageview",
  "title": "Products Page",
  "route": "/products",
  "isInitialLoad": false
}
```

### Click Event

```json
{
  "type": "click",
  "pageX": 123,
  "pageY": 456,
  "selector": "body > main > article:nth-child(3) > button.cta",
  "xpath": "/body/main/article[3]/button[1]",
  "tagName": "button",
  "elementTextHash": "sha256(...)"
}
```

## React Integration

### Setup

```typescript
import { initializeSDK } from "@omni-analytics/sdk";
import { TrackerProvider } from "@omni-analytics/react";

const { tracker } = initializeSDK({
  projectId: "my-project",
  endpoint: "https://api.example.com/events",
});

function App() {
  return <TrackerProvider tracker={tracker}>{/* Your app */}</TrackerProvider>;
}
```

### Usage

```typescript
import { useTracker } from "@omni-analytics/react";

function SignupButton() {
  const tracker = useTracker();

  const handleClick = () => {
    tracker.trackCustom("signup-clicked", {
      page: "homepage",
      button_position: "hero",
    });
  };

  return <button onClick={handleClick}>Sign Up</button>;
}
```

## Configuration

### Basic Config

```typescript
const { tracker } = initializeSDK({
  projectId: "my-project",
  endpoint: "https://api.example.com/events",
});
```

### Full Config

```typescript
const { tracker } = initializeSDK({
  projectId: "my-project",
  endpoint: "https://api.example.com/events",

  // Optional
  clientId: "my-custom-id",
  userId: "user-123",
  batchSize: 100,
  batchTimeout: 5000,
  debug: true,
  sessionStorageKey: "my_session",
  captureErrors: true,
});
```

## Core Concepts

### Sessions

- Automatically created on first use
- Persisted in localStorage
- Can be reset at any time

```typescript
const sessionId = tracker.getSessionId();
const newId = tracker.newSession();
```

### Users

- Set user ID after authentication
- Tracked across events
- Can be cleared on logout

```typescript
// On login
tracker.setUserId("user-123");

// On logout
tracker.setUserId(null);
```

### Events

Three ways to track:

1. **Automatic** - Page views and clicks tracked automatically
2. **Manual** - Call `trackPageView()`, `trackClick()`, or `trackCustom()`
3. **Plugins** - Create custom plugins for any tracking need

## Use Cases

### E-commerce

Track:

- Product page views
- Add to cart clicks
- Checkout interactions
- Purchase completion

### SaaS

Track:

- Feature usage
- Button clicks
- Form submissions
- Navigation patterns

### Publishers

Track:

- Article views
- Reading time
- Scroll depth
- Content engagement

### Marketing

Track:

- Landing page views
- CTA clicks
- Sign-up forms
- Video plays

## Performance

The SDK is built for performance:

| Metric           | Value                    |
| ---------------- | ------------------------ |
| Initialization   | <5ms                     |
| Event tracking   | <1ms                     |
| Batch size       | 50 events (default)      |
| Batch timeout    | 10 seconds (default)     |
| Memory per event | ~200 bytes               |
| Bundle size      | 16KB (minified, gzipped) |

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## Architecture

The SDK follows SOLID principles with:

- **Config** - Centralized configuration
- **SessionManager** - Session lifecycle
- **Tracker** - High-level tracking API
- **EventQueue** - Event batching
- **ITransmitter** - Pluggable transmission
- **PluginRegistry** - Plugin management
- **Container** - Dependency injection

See [Architecture](./ARCHITECTURE.md) for details.

## Creating Plugins

Extend functionality with plugins:

```typescript
import { IPlugin, PluginContext } from "@omni-analytics/sdk";

export class MyPlugin implements IPlugin {
  name = "my-plugin";
  version = "1.0.0";

  async init(context: PluginContext) {
    // Set up tracking
  }

  async destroy() {
    // Clean up
  }
}
```

See [Plugin Development](./PLUGIN_DEVELOPMENT.md) for examples and guide.

## Troubleshooting

### Events not being sent?

1. Check endpoint is correct
2. Verify backend is receiving POST requests
3. Enable debug: `debug: true`
4. Check browser console for errors

### High memory usage?

1. Reduce `batchTimeout` to flush more frequently
2. Reduce `batchSize` if events are large
3. Check for infinite event loops

### Clicks not tracked?

Clicks are only tracked on interactive elements. Some elements like `<html>` or `<body>` may be excluded.

## Contributing

Contributions are welcome! Please:

1. Follow SOLID principles
2. Add tests for new features
3. Update documentation
4. Keep bundle size small

## License

ISC

## Support

- 📧 Email: support@example.com
- 🐛 Issues: GitHub Issues
- 💬 Discussions: GitHub Discussions

## Roadmap

- [ ] Custom event serialization
- [ ] Event sampling
- [ ] Performance metrics
- [ ] Error tracking
- [ ] Redux middleware
- [ ] Vue integration
- [ ] Svelte integration

## See Also

- [API Reference](./API_REFERENCE.md) - Complete API docs
- [Getting Started](./GETTING_STARTED.md) - Beginner guide
- [Architecture](./ARCHITECTURE.md) - Design patterns
- [Plugin Development](./PLUGIN_DEVELOPMENT.md) - Create plugins
