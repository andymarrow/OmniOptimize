import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import { initializeSDK } from "@omni-analytics/sdk";
import { TrackerProvider, useTracker } from "@omni-analytics/react";
import { Home } from "./pages/Home";
import { Products } from "./pages/Products";
import { Cart } from "./pages/Cart";
import "./App.css";

// ============================================================================
// Initialize SDK once at module load
// ============================================================================
const { tracker } = initializeSDK({
  projectId: "ecommerce-real-world-demo",
  endpoint: "http://localhost:3000/api/events",
  debug: true,
  batchSize: 5,
  batchTimeout: 3000,
});

// ============================================================================
// Navigation Header with Router Links
// ============================================================================
function Navigation() {
  const location = useLocation();
  const tracker = useTracker();

  // Track page views when URL changes
  React.useEffect(() => {
    tracker?.trackCustom("page_view", {
      page: location.pathname,
      timestamp: new Date().toISOString(),
    });
  }, [location.pathname, tracker]);

  return (
    <nav className="navigation">
      <div className="nav-brand">📊 Analytics Demo Store</div>
      <div className="nav-links">
        <Link
          to="/"
          className={`nav-link ${location.pathname === "/" ? "active" : ""}`}
        >
          🏠 Home
        </Link>
        <Link
          to="/products"
          className={`nav-link ${
            location.pathname === "/products" ? "active" : ""
          }`}
        >
          🛍️ Products
        </Link>
        <Link
          to="/cart"
          className={`nav-link ${
            location.pathname === "/cart" ? "active" : ""
          }`}
        >
          🛒 Cart
        </Link>
      </div>
    </nav>
  );
}

// ============================================================================
// Main App Content (Inside Router & TrackerProvider)
// ============================================================================
function AppContent() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>🎯 Real-World SDK Integration Example</h1>
        <p>See page navigation, click tracking, and custom events in action</p>
      </header>

      <Navigation />

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/cart" element={<Cart />} />
        </Routes>
      </main>

      <footer className="app-footer">
        <p>✨ Open DevTools (F12) → Console to see all events being tracked</p>
        <p>© 2024 E-Commerce Demo with Omni Analytics SDK</p>
      </footer>
    </div>
  );
}

// ============================================================================
// Root App with Router & Provider
// ============================================================================
export default function App() {
  return (
    <BrowserRouter>
      <TrackerProvider tracker={tracker}>
        <AppContent />
      </TrackerProvider>
    </BrowserRouter>
  );
}
