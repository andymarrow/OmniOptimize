/\*\*

- Example: Complete Session Snapshots, Heatmaps & Retention Setup
-
- This example demonstrates:
- - Initializing the SDK with snapshot capabilities
- - Configuring heatmap data collection
- - Setting up retention metric tracking
- - Handling events on the client and server
    \*/

// ============================================================================
// 1. CLIENT-SIDE INITIALIZATION
// ============================================================================

import {
initializeSDK,
SessionSnapshotPlugin,
type SessionSnapshotPluginOptions,
} from "@omni-analytics/sdk";

/\*\*

- Initialize the Omni Analytics SDK with full snapshot support
  \*/
  export async function initializeAnalytics() {
  // Configure snapshot plugin
  const snapshotPluginOptions: SessionSnapshotPluginOptions = {
  useRrweb: true, // Use rrweb for automatic capture
  useFallbackSnapshots: true, // Fall back to manual if rrweb unavailable
  debug: true, // Enable debug logging
  };

const snapshotPlugin = new SessionSnapshotPlugin(snapshotPluginOptions);

// Initialize SDK with snapshot configuration
const { tracker, container } = await initializeSDK(
{
projectId: "my-analytics-project",
endpoint: "https://api.analytics.example.com/events",
clientId: generateAnonymousClientId(),
batchSize: 50,
batchTimeout: 10000,
debug: false,

      // Snapshot configuration
      snapshot: {
        enabled: true,
        captureInitial: true,          // Capture on page load
        captureMutations: true,        // Capture on DOM changes
        mutationThrottleMs: 5000,      // Throttle to prevent too many captures
        capturePeriodic: true,         // Periodic captures for funnel analysis
        periodicIntervalMs: 120000,    // Every 2 minutes
        maxSnapshotSizeBytes: 256 * 1024, // Limit to 256KB
      },

      // Privacy configuration
      privacy: {
        // Block entire elements from being captured
        blockSelectors: [
          ".no-track",
          "[data-no-snapshot]",
          ".payment-card-form",
          "#admin-panel",
        ],
        // Mask sensitive content
        maskSelectors: [
          "input[type=password]",
          "input[type=hidden]",
          "input[name*=ssn]",
          "input[name*=token]",
          ".pii-content",
          "[data-mask]",
        ],
        // Limit text content length
        maxNodeTextLength: 150,
      },
    },
    {
      enableAutoTracking: true,       // Enable PageView + Click plugins
      plugins: [snapshotPlugin],      // Add our snapshot plugin
    }

);

console.log("✅ Analytics initialized with snapshots");

// Log plugin status
const pluginRegistry = container.getPluginRegistry();
const plugins = (pluginRegistry as any).getPlugins?.() || [];
plugins.forEach((plugin: any) => {
console.log(`Plugin: ${plugin.name}`, plugin.getStatus?.());
});

// Set up event listeners
setupEventListeners(tracker);

return tracker;
}

/\*\*

- Generate a unique anonymous client ID
  \*/
  function generateAnonymousClientId(): string {
  const stored = localStorage.getItem("omni_client_id");
  if (stored) return stored;

const clientId = `anon-${Date.now()}-${Math.random()
    .toString(36)
    .substring(7)}`;
localStorage.setItem("omni_client_id", clientId);
return clientId;
}

// ============================================================================
// 2. EVENT LISTENERS & TRACKING
// ============================================================================

/\*\*

- Set up custom event listeners for funnel tracking
  \*/
  function setupEventListeners(tracker: any) {
  // Track signup events
  document
  .getElementById("signup-button")
  ?.addEventListener("click", () => {
  tracker.trackCustom("user_signup_initiated", {
  form_type: "standard",
  utm_source: new URLSearchParams(window.location.search).get(
  "utm_source"
  ),
  });
  });

// Track purchase events
document
.getElementById("purchase-button")
?.addEventListener("click", () => {
const cartValue = parseFloat(
document.getElementById("cart-total")?.textContent || "0"
);
tracker.trackCustom("purchase_completed", {
amount: cartValue,
currency: "USD",
items: getCartItems(),
});
});

// Track feature adoption
document
.querySelectorAll("[data-feature-track]")
.forEach((element) => {
element.addEventListener("click", () => {
const feature = element.getAttribute("data-feature-track");
tracker.trackCustom("feature_used", {
feature_name: feature,
timestamp: Date.now(),
});
});
});

// Track scroll depth for engagement
trackScrollDepth(tracker);

// Identify user after login
setupAuthTracking(tracker);
}

/\*\*

- Track scroll depth to measure engagement
  \*/
  function trackScrollDepth(tracker: any) {
  let maxScroll = 0;

window.addEventListener("scroll", () => {
const scrollHeight = document.documentElement.scrollHeight;
const scrollTop =
window.scrollY || document.documentElement.scrollTop;
const scrollPercent = (scrollTop / (scrollHeight - window.innerHeight)) \* 100;

    const depth = Math.round(scrollPercent / 10) * 10; // Round to nearest 10%

    if (depth > maxScroll) {
      maxScroll = depth;
      if (depth % 25 === 0) {
        // Track at 25%, 50%, 75%, 100%
        tracker.trackCustom("scroll_depth", {
          depth_percent: depth,
          page: window.location.pathname,
        });
      }
    }

});
}

/\*\*

- Set up user identification after authentication
  \*/
  function setupAuthTracking(tracker: any) {
  // Listen for auth events (example with Firebase)
  if (typeof window !== "undefined" && "firebase" in window) {
  (window as any).firebase.auth().onAuthStateChanged((user: any) => {
  if (user) {
  // User logged in - set userId
  tracker.setUserId(user.uid);
  tracker.trackCustom("user_authenticated", {
  provider: user.providerData[0]?.providerId,
  email: user.email,
  });
  } else {
  // User logged out
  tracker.setUserId(null);
  tracker.trackCustom("user_logged_out", {});
  }
  });
  }
  }

/\*\*

- Get current cart items (example)
  \*/
  function getCartItems(): any[] {
  const cart = document.querySelectorAll(".cart-item");
  return Array.from(cart).map((item) => ({
  product_id: item.getAttribute("data-product-id"),
  price: parseFloat(
  item.querySelector(".price")?.textContent || "0"
  ),
  quantity: parseInt(
  item.querySelector(".quantity")?.textContent || "1"
  ),
  }));
  }

// ============================================================================
// 3. MANUAL SNAPSHOT CAPTURE (Optional)
// ============================================================================

/\*\*

- Example: Manually trigger a snapshot at a key moment
  \*/
  export function captureSnapshotAtCheckpoint(
  tracker: any,
  checkpointName: string
  ) {
  // This would be useful for capturing state at critical points
  // like "checkout_started", "payment_processing", etc.

tracker.trackCustom("checkpoint_reached", {
checkpoint: checkpointName,
timestamp: Date.now(),
});

// The SessionSnapshotPlugin may also capture a snapshot automatically
// based on mutations or periodic settings
}

// ============================================================================
// 4. HEATMAP DATA STRUCTURE (Backend Processing)
// ============================================================================

/\*\*

- Example backend structure for processing heatmap events
-
- When a SessionSnapshotEvent is received:
- {
- type: "session_snapshot",
- snapshotType: "mutation",
- layoutHash: "sha256:abc123...",
- screenClass: "desktop",
- clicks: [
-     { xNorm: 0.27, yNorm: 0.35, elementSelector: "#button-cta" },
-     { xNorm: 0.45, yNorm: 0.62, elementSelector: ".nav-link" }
- ]
- }
-
- Backend should:
- 1.  Group clicks by layoutHash + screenClass
- 2.  Calculate click density at each normalized coordinate
- 3.  Store for heatmap visualization
      \*/

interface HeatmapPoint {
xNorm: number;
yNorm: number;
count: number;
intensity: number; // 0-1
selector?: string;
}

/\*\*

- Example: Generate heatmap data from stored events (backend pseudocode)
  \*/
  export async function generateHeatmapData(
  projectId: string,
  layoutHash: string,
  screenClass: "mobile" | "tablet" | "desktop"
  ): Promise<HeatmapPoint[]> {
  // This would be implemented on your backend
  // Pseudocode example:

/\*
const events = await db.collection('session_snapshots')
.where('projectId', '==', projectId)
.where('layoutHash', '==', layoutHash)
.where('screenClass', '==', screenClass)
.get();

const clickMap = new Map<string, { count: number; selector?: string }>();

events.forEach(event => {
event.clicks?.forEach(click => {
const key = `${Math.round(click.xNorm * 100)}_${Math.round(
        click.yNorm * 100
      )}`;
const existing = clickMap.get(key) || { count: 0 };
existing.count++;
existing.selector = click.elementSelector;
clickMap.set(key, existing);
});
});

const maxCount = Math.max(...Array.from(clickMap.values()).map(v => v.count));

const heatmapPoints: HeatmapPoint[] = Array.from(clickMap.entries()).map(
([key, data]) => {
const [x100, y100] = key.split('\_').map(Number);
return {
xNorm: x100 / 100,
yNorm: y100 / 100,
count: data.count,
intensity: data.count / maxCount,
selector: data.selector,
};
}
);

return heatmapPoints;
\*/

return [];
}

// ============================================================================
// 5. RETENTION & FUNNEL ANALYSIS (Backend)
// ============================================================================

/\*\*

- Example: Analyze user retention through funnel steps
  _/
  export async function analyzeFunnel(
  projectId: string,
  timeRange: { start: Date; end: Date }
  ) {
  /_
  const sessions = await db.collection('sessions')
  .where('projectId', '==', projectId)
  .where('createdAt', '>=', timeRange.start)
  .where('createdAt', '<=', timeRange.end)
  .get();

const funnelSteps = [
{ name: 'Product View', url: '/products' },
{ name: 'Add to Cart', url: '/cart' },
{ name: 'Checkout', url: '/checkout' },
{ name: 'Payment', url: '/payment' },
{ name: 'Success', url: '/success' }
];

const funnel = {};

for (const session of sessions) {
const snapshots = await db.collection('session_snapshots')
.where('sessionId', '==', session.id)
.orderBy('timestamp')
.get();

    for (let i = 0; i < funnelSteps.length; i++) {
      const step = funnelSteps[i];
      const snapshot = snapshots.find(s => s.url === step.url);

      if (!snapshot) break; // User didn't reach this step

      if (!funnel[step.name]) {
        funnel[step.name] = { count: 0, dropoff: 0 };
      }
      funnel[step.name].count++;

      // Check if user moved to next step
      if (i < funnelSteps.length - 1) {
        const nextStep = funnelSteps[i + 1];
        const nextSnapshot = snapshots.find(
          s => s.url === nextStep.url && s.timestamp > snapshot.timestamp
        );

        if (!nextSnapshot) {
          funnel[step.name].dropoff++;
        }
      }
    }

}

return funnel;
\*/
return {};
}

// ============================================================================
// 6. USAGE EXAMPLES
// ============================================================================

/\*\*

- Example 1: Basic initialization and tracking
  \*/
  export async function exampleBasicTracking() {
  const tracker = await initializeAnalytics();

// Tracker automatically captures:
// - Page views on load and navigation
// - Clicks with coordinates and selectors
// - DOM snapshots (initial, on mutation, periodic)

// You can also manually track custom events
tracker.trackCustom("lesson_started", {
lesson_id: 123,
course_id: 456,
});
}

/\*\*

- Example 2: E-commerce funnel tracking
  \*/
  export async function exampleEcommerceFunnel() {
  const tracker = await initializeAnalytics();

// Product page
tracker.trackCustom("product_viewed", {
product_id: "prod-123",
category: "electronics",
price: 99.99,
});

// Add to cart
tracker.trackCustom("item_added_to_cart", {
product_id: "prod-123",
quantity: 1,
cart_value: 99.99,
});

// Checkout initiated
captureSnapshotAtCheckpoint(tracker, "checkout_started");
tracker.trackCustom("checkout_started", {
cart_items: 1,
cart_value: 99.99,
});

// Purchase completed
tracker.trackCustom("purchase_completed", {
order_id: "order-abc123",
amount: 99.99,
items: 1,
});
}

/\*\*

- Example 3: SPA (React/Vue/Angular) tracking
  \*/
  export async function exampleSpaTracking() {
  const tracker = await initializeAnalytics();

// Automatic page view tracking handles SPA navigation via history.pushState
// Just ensure your framework triggers it

// For Vue:
// router.afterEach(() => {
// tracker.trackPageView();
// });

// For React Router v6:
// useEffect(() => {
// tracker.trackPageView();
// }, [location]);

// Manual event tracking for SPA-specific interactions
tracker.trackCustom("spa_component_rendered", {
component: "ProductsList",
items_count: 42,
});
}

/\*\*

- Example 4: Debug snapshot plugin status
  \*/
  export async function exampleDebugSnapshots() {
  const { container } = await initializeSDK({
  projectId: "test",
  endpoint: "https://api.example.com",
  });

const pluginRegistry = (container as any).getPluginRegistry();
const plugins = (pluginRegistry as any).getPlugins?.() || [];

const snapshotPlugin = plugins.find(
(p: any) => p.name === "session-snapshot"
);

if (snapshotPlugin) {
const status = snapshotPlugin.getStatus();
console.log("Snapshot Plugin Status:", {
initialized: status.initialized,
rrwebActive: status.rrwebActive,
capturedClicks: status.capturedClicks,
});
}
}

// Export for use in your app
export { initializeAnalytics as default };
