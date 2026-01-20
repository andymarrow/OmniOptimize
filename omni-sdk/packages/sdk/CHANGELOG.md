# @omni-analytics/sdk

## 0.3.0

### Minor Changes

- ## Control When Tracking Happens

  You can now turn the SDK on and off whenever you need:
  - **At startup**: Pass `enabled: false` in your config to disable tracking during development or testing
  - **Anytime**: Call `enable()` or `disable()` to turn tracking on/off without reloading the page
  - **Example use case**: Disable analytics in dev, enable only in production

  When disabled, the SDK stops collecting ALL data - clicks, page views, and session recordings all pause.

  ## Protect Sensitive Elements from Being Tracked

  Use these CSS classes to control what gets captured:
  - **`om-no-capture`** - Exclude elements from being tracked at all (clicks, recordings)
  - **`om-mask`** - Hide sensitive text content (e.g., emails, addresses) in recordings
  - **`om-ignore`** - Skip elements in recordings (they won't appear at all)

  ```html
  <!-- Won't be tracked or recorded -->
  <button class="om-no-capture">Delete Account</button>

  <!-- Text will be hidden in recordings -->
  <div class="om-mask">Your credit card: 4111-1111-1111-1111</div>

  <!-- Won't appear in screen recordings -->
  <form class="om-ignore">
    <input type="password" placeholder="Enter password" />
    <button>Login</button>
  </form>
  ```

  This prevents sensitive information like passwords, payment data, or personal details from being captured in analytics.

  ## Authenticate Your Events (Required)

  You must now provide a `writeKey` when initializing the SDK:

  ```javascript
  const { tracker } = await initializeSDK({
    projectId: "my-project",
    endpoint: "https://api.example.com/events",
    writeKey: "omni-public-write-key-here", // Required - get this from your dashboard
  });
  ```

  This key authenticates all data sent to your server, ensuring only authorized sources can submit analytics.

  ## Breaking Changes
  - `writeKey` is now a required configuration parameter (SDKConfig)

## 0.2.0

### Minor Changes

- integrate rrweb for session reply
