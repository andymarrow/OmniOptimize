import React from "react";
import { useTracker } from "@omni-analytics/react";
import { Link } from "react-router-dom";

export function Home() {
  const tracker = useTracker();

  const handleCTA = () => {
    tracker?.trackCustom("cta_click", {
      button: "Shop Now",
      section: "hero",
      page: "home",
    });
  };

  return (
    <div className="page">
      <h1>Welcome to Our E-Commerce Store</h1>

      <div className="hero-section">
        <p>Discover amazing products at unbeatable prices!</p>
        <Link to="/products" onClick={handleCTA} className="primary-btn">
          🎯 Shop Now
        </Link>
      </div>

      <div className="features">
        <h2>How Real-World SDK Integration Works</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <h3>📍 Real Page Navigation</h3>
            <p>Click links above - notice the URL in address bar changes</p>
            <p>
              <small>Each page view is tracked automatically</small>
            </p>
          </div>
          <div className="feature-card">
            <h3>🖱️ Click Tracking</h3>
            <p>Every button click is automatically tracked</p>
            <p>
              <small>Even links and navigation clicks</small>
            </p>
          </div>
          <div className="feature-card">
            <h3>📊 Custom Events</h3>
            <p>Track specific user actions and conversions</p>
            <p>
              <small>Like "Shop Now" button clicks</small>
            </p>
          </div>
          <div className="feature-card">
            <h3>🔄 Auto Batching</h3>
            <p>Events are automatically batched together</p>
            <p>
              <small>Sent efficiently to your backend</small>
            </p>
          </div>
        </div>
      </div>

      <div className="info-box">
        <h3>💡 Open Browser DevTools (F12)</h3>
        <p>Check the Console tab to see all tracked events in real-time!</p>
      </div>
    </div>
  );
}
