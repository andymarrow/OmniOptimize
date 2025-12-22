# Omni Analytics SDK - Getting Started

Welcome to Omni Analytics SDK! This comprehensive guide will help you integrate analytics tracking into your web applications.

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Basic Usage](#basic-usage)
- [Automatic Tracking](#automatic-tracking)
- [Manual Tracking](#manual-tracking)
- [Configuration](#configuration)
- [React Integration](#react-integration)
- [Advanced Usage](#advanced-usage)

## Installation

### Via NPM

```bash
npm install @omni-analytics/sdk
```

### Via PNPM

```bash
pnpm add @omni-analytics/sdk
```

### Via Yarn

```bash
yarn add @omni-analytics/sdk
```

### Via CDN (Script Tag)

```html
<script src="https://cdn.example.com/omni-analytics.umd.js"></script>
<script>
  const { initializeSDK } = window.OmniAnalytics;
  const { tracker } = initializeSDK({
    projectId: "my-project",
    endpoint: "https://api.example.com/events",
  });
</script>
```

## Quick Start

### 1. Initialize the SDK

The simplest way to get started - just initialize with your config:

```typescript
import { initializeSDK } from "@omni-analytics/sdk";

const { tracker } = initializeSDK({
  projectId: "my-project",
  endpoint: "https://api.example.com/events",
});
```

**That's it!** The SDK will automatically:

- ✅ Track page views on initial load
- ✅ Track SPA navigation (route changes)
- ✅ Track all user clicks with coordinates and selectors
- ✅ Batch events and send them to your endpoint

### 2. Configure Your Backend

Your endpoint should accept POST requests with this format:

```json
{
  "events": [
    {
      "eventId": "uuid-here",
      "projectId": "my-project",
      "clientId": "anon-uuid-or-user-id",
      "sessionId": "session-id",
      "userId": null,
      "type": "pageview|click|custom",
      "timestamp": 1699999999999,
      "url": "https://example.com/page",
      "referrer": "https://google.com/",
      "pageDimensions": { "w": 1200, "h": 3000 },
      "viewport": { "w": 1200, "h": 800 },
      "properties": {}
    }
  ],
  "batchId": "batch-id",
  "timestamp": 1699999999999
}
```

## Basic Usage

### Automatic Tracking

Once initialized, the SDK tracks automatically:

```typescript
// Page view - automatically on load + SPA navigation
// Click tracking - automatically on all clicks
// Data is batched and sent automatically every 10 seconds or 50 events
```

### Manual Tracking

You can also manually track custom events:

```typescript
// Track a custom event
tracker.trackCustom("user-signup", {
  plan: "premium",
  source: "homepage",
});

// Manually track page view (useful for SPAs)
tracker.trackPageView({
  title: "Products Page",
  route: "/products",
  isInitialLoad: false,
});

// Manually track click (advanced scenarios)
const element = document.querySelector("button.cta");
tracker.trackClick(element, {
  pageX: 100,
  pageY: 200,
});
```

## Configuration

### SDKConfig Options

```typescript
interface SDKConfig {
  // Required
  projectId: string; // Your project identifier
  endpoint: string; // Server endpoint for events

  // Optional
  clientId?: string; // Custom client ID (auto-generated if not provided)
  userId?: string | null; // User ID (set after authentication)
  batchSize?: number; // Events per batch (default: 50)
  batchTimeout?: number; // Time before auto-flush in ms (default: 10000)
  debug?: boolean; // Enable debug logging (default: false)
  sessionStorageKey?: string; // localStorage key for session (default: 'omni_session_id')
  captureErrors?: boolean; // Enable error tracking (default: false)
}
```

### Example with Full Config

```typescript
const { tracker } = initializeSDK({
  projectId: "my-project",
  endpoint: "https://api.example.com/events",
  clientId: "my-custom-id",
  userId: "user-123",
  batchSize: 100,
  batchTimeout: 5000,
  debug: true,
  captureErrors: true,
});
```

## React Integration

### Installation

```bash
npm install @omni-analytics/react
```

### Setup

Wrap your app with `TrackerProvider`:

```typescript
import { initializeSDK } from "@omni-analytics/sdk";
import { TrackerProvider } from "@omni-analytics/react";

const { tracker } = initializeSDK({
  projectId: "my-project",
  endpoint: "https://api.example.com/events",
});

function App() {
  return (
    <TrackerProvider tracker={tracker}>{/* Your app here */}</TrackerProvider>
  );
}
```

### Using the useTracker Hook

```typescript
import { useTracker } from "@omni-analytics/react";

function SignupButton() {
  const tracker = useTracker();

  const handleClick = () => {
    tracker.trackCustom("signup-clicked", {
      button_text: "Sign Up",
      page_section: "hero",
    });
  };

  return <button onClick={handleClick}>Sign Up</button>;
}
```

## Advanced Usage

### Setting User ID After Login

```typescript
// On login
tracker.setUserId("user-123");

// On logout
tracker.setUserId(null);
tracker.newSession(); // Optional: start new session
```

### Setting Custom Client ID

```typescript
tracker.setClientId("my-custom-identifier");
```

### Manual Flush

Force send batched events immediately:

```typescript
await tracker.flush();
```

### Getting Session ID

```typescript
const sessionId = tracker.getSessionId();
console.log("Current session:", sessionId);
```

### Starting New Session

```typescript
const newSessionId = tracker.newSession();
```

## Event Types

### Page View Events

Auto-tracked on initial load and SPA navigation:

```json
{
  "type": "pageview",
  "title": "Page Title",
  "route": "/current-path",
  "isInitialLoad": false
}
```

### Click Events

Auto-tracked on all clicks:

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

### Custom Events

Track your own events:

```typescript
tracker.trackCustom("event-name", {
  key1: "value1",
  key2: 123,
  nested: { prop: "value" },
});
```

## Event Batching

Events are automatically batched for efficiency:

- **Default batch size**: 50 events
- **Default batch timeout**: 10 seconds
- Events are sent when either condition is met

```typescript
// Customize batching
const { tracker } = initializeSDK({
  projectId: "my-project",
  endpoint: "https://api.example.com/events",
  batchSize: 100, // Send after 100 events
  batchTimeout: 5000, // Or after 5 seconds
});
```

## Debug Mode

Enable verbose logging for development:

```typescript
const { tracker } = initializeSDK({
  projectId: "my-project",
  endpoint: "https://api.example.com/events",
  debug: true,
});

// Console output:
// [OmniSDK] Config initialized: {...}
// [Tracker] Tracking event: {...}
// [EventQueue] Flushing batch with 50 events
```

## Error Handling

### Backend Response Handling

Your backend should return:

- **200 OK** - Events processed successfully
- **400 Bad Request** - Invalid batch format
- **401 Unauthorized** - Authentication failed
- **503 Service Unavailable** - Temporarily unavailable

SDK will automatically retry on network failures (with exponential backoff).

## Best Practices

1. **Initialize Once**: Initialize the SDK at app startup
2. **Set User ID on Auth**: Set user ID when user logs in
3. **Use React Integration**: Leverage hooks for React apps
4. **Batch Custom Events**: Don't track every keystroke, batch similar events
5. **Test in Debug Mode**: Enable debug logging during development
6. **Monitor Endpoint**: Watch for failed transmissions in production

## Common Issues

### Events not being sent?

1. Check that `endpoint` is correct
2. Verify backend is receiving POST requests
3. Enable debug mode: `debug: true`
4. Check browser console for errors

### High memory usage?

1. Reduce `batchTimeout` to flush more frequently
2. Reduce `batchSize` if events are large

### Clicks not being tracked?

Clicks are only tracked on elements that are valid targets. Some elements (like `<html>` or `<body>`) may be excluded.

## Next Steps

- Read the [API Reference](./API_REFERENCE.md)
- Create custom [Plugins](./PLUGIN_DEVELOPMENT.md)
- View [Architecture](./ARCHITECTURE.md)
