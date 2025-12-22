import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { initializeSDK, destroySDK } from "@omni-analytics/sdk";
import { TrackerProvider } from "@omni-analytics/react";
import App from "./App";
import "./index.css";

// Initialize SDK once at app startup
const { tracker } = initializeSDK({
  projectId: "local-example-app",
  endpoint: "http://localhost:5000/ingest",
  debug: true,
  batchSize: 3,
  batchTimeout: 2000,
  replay: {
    enabled: true,
    debug: true,
  },
});

console.log("✅ SDK Initialized:", { tracker });

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <TrackerProvider tracker={tracker}>
      <BrowserRouter>
        <Routes>
          <Route path="/*" element={<App />} />
        </Routes>
      </BrowserRouter>
    </TrackerProvider>
  </React.StrictMode>
);
