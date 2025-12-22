import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { HeatmapPage } from "@/pages/HeatmapPage";
import { SessionReplayPage } from "@/pages/SessionReplayPage";
import { HeatmapTestPage } from "@/pages/HeatmapTestPage";
import { Button } from "@/components/ui/button";

const queryClient = new QueryClient();

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-background">
          {/* Header / Navigation */}
          <header className="border-b backdrop-blur-md border-border bg-card sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold">Analytics Visualizer</h1>
                  <p className="text-sm text-muted-foreground">
                    Session replays & click heatmaps
                  </p>
                </div>
                <nav className="flex gap-2">
                  <Link to="/">
                    <Button variant="outline">Heatmaps</Button>
                  </Link>
                  <Link to="/replays">
                    <Button variant="outline">Replays</Button>
                  </Link>
                  <Link to="/test">
                    <Button variant="outline" size="sm">
                      Test
                    </Button>
                  </Link>
                </nav>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<HeatmapPage />} />
              <Route path="/replays" element={<SessionReplayPage />} />
              <Route path="/test" element={<HeatmapTestPage />} />
            </Routes>
          </main>

          {/* Footer */}
          <footer className="border-t border-border bg-card mt-12">
            <div className="max-w-7xl mx-auto px-4 py-6">
              <p className="text-sm text-muted-foreground text-center">
                Frontend Analytics Visualizer • Built with Vite + React +
                Zustand
              </p>
            </div>
          </footer>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
