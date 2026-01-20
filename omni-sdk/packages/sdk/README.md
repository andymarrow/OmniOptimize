# Omni Analytics SDK

A lightweight, privacy-first analytics SDK for tracking user behavior on your website. Built for self-hosted deployments with full control over your data.

## What It Does

The Omni Analytics SDK helps you understand how users interact with your website:

- **Track Page Views** - See which pages users visit and how they navigate
- **Record Clicks** - Understand what buttons and links users click on
- **Session Replay** - Watch recordings of user sessions to see exactly how they interact with your site
- **Custom Events** - Track specific actions that matter to your business

## Getting Started

### 1. Install the SDK

```bash
npm install @omni-analytics/sdk
# or
pnpm add @omni-analytics/sdk
```

### 2. Initialize in Your App

```javascript
import { initializeSDK } from "@omni-analytics/sdk";

const { tracker } = await initializeSDK({
  projectId: "my-website",
  endpoint: "https://analytics.example.com/ingest",
  writeKey: "your-write-key-here",
});
```

That's it! The SDK will automatically start tracking:

- Page views
- User clicks
- Session activity

### 3. Track Custom Events

```javascript
// Track when a user completes an action
tracker.trackCustom("user_signup", {
  plan: "premium",
  referral_source: "google",
});

// Track conversions
tracker.trackCustom("purchase_completed", {
  amount: 99.99,
  product_id: "product-123",
});
```

## Control What Gets Tracked

### Turn Tracking On/Off

Disable analytics in development or specific environments:

```javascript
// Disable during development
const { tracker, container } = await initializeSDK({
  projectId: "my-website",
  endpoint: "https://analytics.example.com/ingest",
  writeKey: "your-write-key-here",
  enabled: false, // Disable tracking
});

// Or enable/disable anytime
container.disable(); // Stop tracking
container.enable(); // Start tracking again
```

### Hide Sensitive Information

Use CSS classes to prevent sensitive elements from being tracked:

```html
<!-- Won't be tracked or recorded -->
<button class="om-no-capture">Delete My Data</button>

<!-- Text content will be hidden in recordings -->
<div class="om-mask">Credit Card: 4111-1111-1111-1111</div>

<!-- Element will be ignored (skipped over in recordings) -->
<div class="om-ignore">Additional notes or metadata</div>
```

Use these classes on:

- Payment forms
- Password inputs
- Sensitive personal information
- Admin functions

## For React Apps

If you're using React, use the `@omni-analytics/react` package for easier integration:

```bash
pnpm add @omni-analytics/react
```

```jsx
import { TrackerProvider, useTracker } from "@omni-analytics/react";
import { initializeSDK } from "@omni-analytics/sdk";

// In your root component
export default function App() {
  const [tracker, setTracker] = React.useState(null);

  React.useEffect(() => {
    initializeSDK({
      projectId: "my-website",
      endpoint: "https://analytics.example.com/ingest",
      writeKey: "your-write-key-here",
    }).then(({ tracker }) => setTracker(tracker));
  }, []);

  return (
    <TrackerProvider tracker={tracker}>
      <YourApp />
    </TrackerProvider>
  );
}

// In any component
function MyComponent() {
  const tracker = useTracker();

  return (
    <button onClick={() => tracker.trackCustom("button_clicked")}>
      Click Me
    </button>
  );
}
```

## Configuration Options

```javascript
initializeSDK({
  // Required
  projectId: "your-project-id", // Your website identifier
  endpoint: "https://api.example.com", // Where to send analytics data
  writeKey: "your-write-key", // API authentication key

  // Optional
  enabled: true, // Enable/disable tracking (default: true)
  debug: false, // Show debug logs (default: false)
  userId: null, // User ID after login
  clientId: "anon-xxx", // Unique visitor ID (auto-generated)
  batchSize: 50, // Events per batch (default: 50)
  batchTimeout: 10000, // Time before flushing batch (ms)

  // Session configuration (optional)
  session: {
    inactivityTimeoutMs: 1800000, // 30 minutes of inactivity = new session
  },

  // Session replay/recording
  replay: {
    enabled: true, // Enable session recordings
  },
});
```

## Privacy & Security

✅ **Self-hosted** - Your data stays on your servers  
✅ **No third parties** - No data sent to external analytics platforms  
✅ **User control** - Users can opt-out using CSS classes  
✅ **Anonymous** - Tracks behavior, not identity (unless you set userId)

### How to Handle User Privacy

1. **Respect Do-Not-Track** - Check browser DNT headers and disable if set:

   ```javascript
   const dnt = navigator.doNotTrack === "1";
   const enabled = !dnt;
   ```

2. **Add Privacy Controls** - Let users opt-out:

   ```javascript
   function enableAnalytics() {
     container.enable();
     localStorage.setItem("analytics_enabled", "true");
   }

   function disableAnalytics() {
     container.disable();
     localStorage.setItem("analytics_enabled", "false");
   }
   ```

3. **Mask Sensitive Data** - Always use `om-mask` for sensitive inputs

## Troubleshooting

### Events not being sent?

1. Check `writeKey` is correct
2. Check `endpoint` is accessible
3. Enable debug mode: `debug: true`
4. Check browser console for errors

### Too many logs in production?

Debug logs only show when `debug: true`. Disable it in production configs:

```javascript
debug: process.env.NODE_ENV === "development";
```

### Session recordings not starting?

Make sure replay is enabled in config:

```javascript
replay: {
  enabled: true;
}
```

## API Reference

### Tracker Methods

```javascript
// Track page views
tracker.trackPageView({
  title: "Custom Title",
  route: "/custom-path",
});

// Track clicks on elements
tracker.trackClick(element, {
  pageX: 100,
  pageY: 200,
});

// Track custom events
tracker.trackCustom("event_name", {
  property1: "value1",
  property2: 123,
});

// Flush all pending events immediately
await tracker.flush();

// Set or update user ID (e.g., after login)
tracker.setUserId("user-123");

// Get current session ID
const sessionId = tracker.getSessionId();
```

### Container Methods

```javascript
// Disable tracking
container.disable();

// Re-enable tracking
container.enable();

// Destroy SDK (cleanup)
await container.destroy();
```

## Performance

The SDK is optimized for minimal impact:

- ⚡ **Small footprint** - Lightweight JavaScript
- 🔄 **Batches events** - Reduces network requests
- 🎯 **Selective sampling** - Record only % of sessions if needed
- 🚫 **Respects user preferences** - Disables when requested

## License

ISC - See LICENSE file for details
