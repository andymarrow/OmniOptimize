import { useTracker } from "@omni-analytics/react";
import { Link } from "react-router-dom";

export default function Home() {
  const tracker = useTracker();

  const handleCTA = () => {
    tracker?.trackCustom("cta_click", {
      button: "Shop Now",
      section: "hero",
    });
  };

  return (
    <div className="page">
      <h1>Welcome! 🎉</h1>
      <div className="hero">
        <p>
          This is a local development example using the workspace build of Omni
          Analytics SDK
        </p>
        <Link to="/products" onClick={handleCTA} className="btn btn-primary">
          Explore Products →
        </Link>
      </div>

      <div className="features">
        <h2>What's Being Tracked?</h2>
        <ul>
          <li>✅ Page navigation (clicks on links)</li>
          <li>✅ Button clicks (auto-tracked)</li>
          <li>✅ Custom events (product views, cart actions)</li>
          <li>✅ Form interactions</li>
          <li>✅ All events batched and queued</li>
        </ul>
      </div>

      <div className="info-box">
        <h3>Why Use Workspace Linking?</h3>
        <p>
          This example uses <code>workspace:*</code> in package.json. It means:
        </p>
        <ul>
          <li>🔗 Always uses local SDK source (no npm install needed)</li>
          <li>⚡ Instant code changes reflected (with hot reload)</li>
          <li>✨ Perfect for development and testing</li>
          <li>
            📦 When you publish to npm, it auto-converts to version references
          </li>
        </ul>
      </div>
    </div>
  );
}
