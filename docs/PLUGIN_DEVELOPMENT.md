# Omni Analytics SDK - Plugin Development Guide

Learn how to create custom plugins to extend the Omni Analytics SDK with additional tracking capabilities.

## Table of Contents

- [Plugin Basics](#plugin-basics)
- [Plugin Interface](#plugin-interface)
- [Creating a Plugin](#creating-a-plugin)
- [Built-in Plugins](#built-in-plugins)
- [Plugin Examples](#plugin-examples)
- [Advanced Topics](#advanced-topics)

## Plugin Basics

Plugins are the primary way to extend the SDK with custom functionality. They follow the Open/Closed Principle - you can add new features without modifying the core SDK.

### What Can Plugins Do?

- Track custom user interactions
- Collect additional page context
- Integrate with external services
- Modify event properties
- Set up custom listeners
- Clean up resources

### Plugin Lifecycle

1. **Register** - Plugin is registered with the SDK
2. **Initialize** - `init()` is called with plugin context
3. **Active** - Plugin listens and tracks events
4. **Destroy** - `destroy()` is called on SDK shutdown

## Plugin Interface

### IPlugin

Every plugin must implement the `IPlugin` interface:

```typescript
interface IPlugin {
  name: string; // Unique plugin name
  version: string; // Semantic version (e.g., "1.0.0")
  init(context: PluginContext): Promise<void>; // Initialize plugin
  destroy?(): Promise<void>; // Optional cleanup
}
```

### PluginContext

Context passed to plugins during initialization:

```typescript
interface PluginContext {
  tracker: Tracker; // Event tracker instance
  config: Config; // SDK configuration
  logger?: Logger; // Optional logger
}
```

## Creating a Plugin

### Step 1: Implement IPlugin

```typescript
import { IPlugin, PluginContext } from "@omni-analytics/sdk";

export class MyCustomPlugin implements IPlugin {
  name = "my-custom-plugin";
  version = "1.0.0";

  async init(context: PluginContext): Promise<void> {
    // Plugin initialization logic
  }

  async destroy(): Promise<void> {
    // Plugin cleanup logic
  }
}
```

### Step 2: Initialize Plugin

```typescript
import { initializeSDK } from "@omni-analytics/sdk";
import { MyCustomPlugin } from "./MyCustomPlugin";

const { tracker, container } = initializeSDK({
  projectId: "my-project",
  endpoint: "https://api.example.com/events",
});

// Register custom plugin
const plugin = new MyCustomPlugin();
container.getPluginRegistry?.().register(plugin);
```

## Built-in Plugins

### PageViewPlugin

Automatically tracks page views.

**Features:**

- Tracks initial page load
- Tracks SPA navigation via `history.pushState`
- Auto-initialized by default

**Configuration:**

```typescript
// Auto-initialized, no manual setup needed
tracker.trackPageView(); // Manual tracking
```

**Events Sent:**

```json
{
  "type": "pageview",
  "title": "Page Title",
  "route": "/current-path",
  "isInitialLoad": false
}
```

### ClickTrackingPlugin

Automatically tracks user clicks.

**Features:**

- Captures all clicks on page
- Includes element selectors (CSS and XPath)
- Records click coordinates
- Auto-initialized by default

**Configuration:**

```typescript
// Auto-initialized, no manual setup needed
```

**Events Sent:**

```json
{
  "type": "click",
  "pageX": 100,
  "pageY": 200,
  "selector": "body > button.cta",
  "xpath": "/body/button[1]",
  "tagName": "button"
}
```

## Plugin Examples

### Example 1: Form Submission Tracking

Track when users submit forms:

```typescript
import { IPlugin, PluginContext } from "@omni-analytics/sdk";

export class FormSubmissionPlugin implements IPlugin {
  name = "form-submission-plugin";
  version = "1.0.0";

  private tracker: any;

  async init(context: PluginContext): Promise<void> {
    this.tracker = context.tracker;

    // Find all forms on page
    const forms = document.querySelectorAll("form");

    forms.forEach((form) => {
      form.addEventListener("submit", (e) => {
        const formId = form.id || form.name || "unknown";
        const formAction = form.action || "unknown";

        this.tracker.trackCustom("form-submitted", {
          formId,
          formAction,
          fieldCount: form.elements.length,
        });
      });
    });
  }

  async destroy(): Promise<void> {
    // Cleanup if needed
  }
}
```

### Example 2: Scroll Depth Tracking

Track how far users scroll down the page:

```typescript
import { IPlugin, PluginContext } from "@omni-analytics/sdk";

export class ScrollDepthPlugin implements IPlugin {
  name = "scroll-depth-plugin";
  version = "1.0.0";

  private tracker: any;
  private scrollThresholds = [25, 50, 75, 100];
  private reportedThresholds = new Set<number>();

  async init(context: PluginContext): Promise<void> {
    this.tracker = context.tracker;

    window.addEventListener("scroll", () => {
      this.checkScrollDepth();
    });
  }

  private checkScrollDepth(): void {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY;

    const scrolledPercent = Math.round(
      ((scrollTop + windowHeight) / documentHeight) * 100
    );

    this.scrollThresholds.forEach((threshold) => {
      if (
        scrolledPercent >= threshold &&
        !this.reportedThresholds.has(threshold)
      ) {
        this.reportedThresholds.add(threshold);
        this.tracker.trackCustom("scroll-depth", {
          depth: threshold,
          scrolled_pixels: scrollTop,
        });
      }
    });
  }

  async destroy(): Promise<void> {
    // Remove listener if needed
  }
}
```

### Example 3: User Engagement Tracking

Track user engagement metrics:

```typescript
import { IPlugin, PluginContext } from "@omni-analytics/sdk";

export class EngagementPlugin implements IPlugin {
  name = "engagement-plugin";
  version = "1.0.0";

  private tracker: any;
  private engagementTime = 0;
  private lastActivityTime = Date.now();
  private inactivityTimeout = 30000; // 30 seconds

  async init(context: PluginContext): Promise<void> {
    this.tracker = context.tracker;

    // Track user activity
    document.addEventListener("click", () => this.onUserActivity());
    document.addEventListener("keypress", () => this.onUserActivity());
    document.addEventListener("scroll", () => this.onUserActivity());

    // Report engagement periodically
    setInterval(() => this.reportEngagement(), 60000); // Every minute

    // Report on page unload
    window.addEventListener("beforeunload", () => {
      this.reportEngagement();
    });
  }

  private onUserActivity(): void {
    this.lastActivityTime = Date.now();
  }

  private reportEngagement(): void {
    const now = Date.now();
    const timeSinceActivity = now - this.lastActivityTime;

    // Only count as engagement if user was active recently
    if (timeSinceActivity < this.inactivityTimeout) {
      this.engagementTime += 60000;
      this.tracker.trackCustom("engagement-update", {
        engagementTimeMs: this.engagementTime,
        engagementTimeMin: Math.round(this.engagementTime / 60000),
      });
    }
  }

  async destroy(): Promise<void> {
    // Final report
    this.reportEngagement();
  }
}
```

### Example 4: Video Tracking

Track video player events:

```typescript
import { IPlugin, PluginContext } from "@omni-analytics/sdk";

export class VideoTrackingPlugin implements IPlugin {
  name = "video-tracking-plugin";
  version = "1.0.0";

  private tracker: any;

  async init(context: PluginContext): Promise<void> {
    this.tracker = context.tracker;

    // Find all video elements
    const videos = document.querySelectorAll("video");

    videos.forEach((video) => {
      const videoId = video.id || "unknown";
      const videoTitle = video.title || video.src || "unknown";

      video.addEventListener("play", () => {
        this.tracker.trackCustom("video-played", {
          videoId,
          videoTitle,
        });
      });

      video.addEventListener("pause", () => {
        this.tracker.trackCustom("video-paused", {
          videoId,
          videoTitle,
          currentTime: video.currentTime,
        });
      });

      video.addEventListener("ended", () => {
        this.tracker.trackCustom("video-completed", {
          videoId,
          videoTitle,
          duration: video.duration,
        });
      });
    });
  }

  async destroy(): Promise<void> {
    // Cleanup if needed
  }
}
```

## Advanced Topics

### Accessing Configuration

Use `PluginContext` to access SDK configuration:

```typescript
async init(context: PluginContext): Promise<void> {
  const projectId = context.config.getProjectId();
  const debug = context.config.isDebugEnabled();

  if (debug) {
    console.log('Plugin initialized for project:', projectId);
  }
}
```

### Using Logger

If logger is available in context:

```typescript
async init(context: PluginContext): Promise<void> {
  context.logger?.info('MyPlugin initialized');
  context.logger?.debug('Debug information', { key: 'value' });
}
```

### Error Handling

Plugins should handle errors gracefully:

```typescript
async init(context: PluginContext): Promise<void> {
  try {
    // Plugin initialization
    const elements = document.querySelectorAll('form');
    // ...
  } catch (error) {
    context.logger?.error('Plugin initialization failed', error);
    // Don't throw - let SDK continue
  }
}
```

### Cleanup in Destroy

Always clean up resources in `destroy()`:

```typescript
private listeners: { element: Element; listener: EventListener }[] = [];

async init(context: PluginContext): Promise<void> {
  const form = document.querySelector('form');
  const listener = () => { /* ... */ };

  form.addEventListener('submit', listener);
  this.listeners.push({ element: form, listener });
}

async destroy(): Promise<void> {
  // Remove all listeners
  this.listeners.forEach(({ element, listener }) => {
    element.removeEventListener('submit', listener);
  });
}
```

### Conditional Plugin Initialization

Initialize plugins based on config:

```typescript
async init(context: PluginContext): Promise<void> {
  if (!context.config.getProjectId().startsWith('analytics-')) {
    context.logger?.info('Plugin not enabled for this project');
    return;
  }

  // Initialize plugin
}
```

### Debouncing Events

Avoid sending too many events with debouncing:

```typescript
private debounce(func: Function, wait: number): Function {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: any[]) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

async init(context: PluginContext): Promise<void> {
  window.addEventListener(
    'resize',
    this.debounce(() => {
      context.tracker.trackCustom('window-resized', {
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }, 1000)
  );
}
```

## Plugin Best Practices

1. **Single Responsibility** - Each plugin should track one thing
2. **Error Handling** - Never throw in `init()` or `destroy()`
3. **Resource Cleanup** - Always remove listeners in `destroy()`
4. **Avoid Conflicts** - Use unique class names for event handlers
5. **Performance** - Debounce frequently-fired events
6. **Debug Logging** - Use logger for troubleshooting
7. **Documentation** - Document what your plugin tracks
8. **Versioning** - Use semantic versioning for your plugin

## Testing Plugins

```typescript
import { Container, Config } from "@omni-analytics/sdk";
import { MyCustomPlugin } from "./MyCustomPlugin";

// Create test config
const config = new Config({
  projectId: "test",
  endpoint: "http://localhost:3000/events",
});

// Create container
const container = new Container(config);

// Register and init plugin
const plugin = new MyCustomPlugin();
await plugin.init({
  tracker: container.getTracker(),
  config: container.getConfig(),
});

// Test plugin behavior
const tracker = container.getTracker();
tracker.trackCustom("test-event", { foo: "bar" });

// Verify events in EventQueue
const queue = container.getEventQueue();
console.log("Queue size:", queue.getQueueSize());
```

## Publishing Plugins

To publish your plugin:

1. Create a GitHub repository
2. Add `omni-analytics-plugin` to topics
3. Create npm package
4. Publish to npm registry
5. Add to plugin registry/documentation

Example package.json:

```json
{
  "name": "@omni-analytics/plugin-myname",
  "version": "1.0.0",
  "description": "My custom plugin for Omni Analytics",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "peerDependencies": {
    "@omni-analytics/sdk": ">=0.1.0"
  },
  "keywords": ["omni-analytics", "plugin", "tracking"]
}
```

## Common Issues

### Plugin not initializing?

1. Check that plugin is registered before SDK init
2. Verify `init()` doesn't throw errors
3. Enable debug mode: `debug: true`

### Events not sent?

1. Verify tracker methods are called
2. Check that events reach EventQueue
3. Verify transmitter configuration

### Memory leaks?

1. Always remove listeners in `destroy()`
2. Clear timers and intervals
3. Remove event listeners
