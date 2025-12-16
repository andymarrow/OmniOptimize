import { Routes, Route, Link } from "react-router-dom";
import { useTracker } from "@omni-analytics/react";
import { useEffect } from "react";
import Home from "./pages/Home";
import Products from "./pages/Products";
import Cart from "./pages/Cart";
import Docs from "./pages/Docs";
import "./App.css";

export default function App() {
  const tracker = useTracker();

  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-brand">📊 Omni Analytics</div>
          <div className="nav-links">
            <Link to="/" onClick={() => handleNavClick("/")}>
              Home
            </Link>
            <Link to="/products" onClick={() => handleNavClick("/products")}>
              Products
            </Link>
            <Link to="/cart" onClick={() => handleNavClick("/cart")}>
              Cart
            </Link>
            <Link to="/docs" onClick={() => handleNavClick("/docs")}>
              Docs
            </Link>
          </div>
        </div>
      </nav>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/docs" element={<Docs />} />
        </Routes>
      </main>

      <footer className="footer">
        <p>
          💡 Uses local workspace build of @omni-analytics/sdk and
          @omni-analytics/react
        </p>
        <p>Check browser console (F12) to see tracked events</p>
      </footer>
    </div>
  );
}
