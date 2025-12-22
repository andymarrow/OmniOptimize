import { useState, useEffect, useRef } from "react";
import { useSession } from "@/api";
import { useSessionStore } from "@/store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import rrwebPlayer from "rrweb-player";
import "rrweb-player/dist/style.css";

// Wrapper component for rrweb-player
function RrwebPlayerWrapper({
  events,
  width,
  height,
}: {
  events: any[];
  width: number;
  height: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<InstanceType<typeof rrwebPlayer> | null>(null);

  useEffect(() => {
    if (!containerRef.current || events.length === 0) return;

    // Cleanup previous player
    if (playerRef.current) {
      playerRef.current = null;
    }

    // Create new player instance
    playerRef.current = new rrwebPlayer({
      target: containerRef.current,
      props: {
        events,
        width,
        height,
        autoPlay: false,
        showController: true,
        speedOption: [1, 2, 4, 8],
      },
    });

    return () => {
      if (playerRef.current) {
        playerRef.current = null;
      }
    };
  }, [events, width, height]);

  return <div ref={containerRef} className="w-full" />;
}

export function SessionReplayPage() {
  const [sessionIdInput, setSessionIdInput] = useState("");

  const {
    selectedSessionId,
    setSelectedSessionId,
    selectedReplayId,
    setSelectedReplayId,
  } = useSessionStore();
  const { data: sessionData, isLoading, error } = useSession(selectedSessionId);

  const handleFetchSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (sessionIdInput.trim()) {
      setSelectedSessionId(sessionIdInput.trim());
    }
  };

  // Select first replay when session data loads
  useEffect(() => {
    if (
      sessionData?.replays &&
      sessionData.replays.length > 0 &&
      !selectedReplayId
    ) {
      setSelectedReplayId(sessionData.replays[0].replayId);
    }
  }, [sessionData, selectedReplayId, setSelectedReplayId]);

  // Get selected replay data
  const selectedReplay = sessionData?.replays.find(
    (r) => r.replayId === selectedReplayId
  );

  // Transform rrweb events for player
  const playerEvents =
    selectedReplay?.events.map((event) => ({
      ...event.rrwebPayload,
      timestamp: event.rrwebPayload.timestamp,
    })) || [];

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Session Replay</CardTitle>
          <CardDescription>
            Enter a session ID to view all replays
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Session ID Input Form */}
          <form onSubmit={handleFetchSession} className="flex gap-2">
            <Input
              type="text"
              placeholder="e.g., session-1766317002115-womexft0bkd"
              value={sessionIdInput}
              onChange={(e) => setSessionIdInput(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={!sessionIdInput.trim()}>
              Fetch Session
            </Button>
          </form>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              Loading session data...
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="rounded-lg bg-destructive/10 p-4 text-destructive">
              <p className="font-semibold">Failed to load session</p>
              <p className="text-sm">
                {error instanceof Error ? error.message : "Unknown error"}
              </p>
            </div>
          )}

          {/* Session Data */}
          {sessionData && (
            <div className="space-y-4">
              {/* Session Metadata */}
              <div className="rounded-lg bg-gray-50 p-4 space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground">Session ID</p>
                  <p className="font-mono text-sm">{sessionData.session.id}</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Created</p>
                    <p className="text-sm">
                      {new Date(sessionData.session.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Events</p>
                    <p className="text-sm font-semibold">
                      {sessionData.eventCount}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Replays</p>
                    <p className="text-sm font-semibold">
                      {sessionData.replays.length}
                    </p>
                  </div>
                </div>
              </div>

              {/* Replay Selector & Player */}
              {sessionData.replays.length > 0 ? (
                <Tabs
                  value={selectedReplayId}
                  onValueChange={setSelectedReplayId}
                >
                  <TabsList className="w-full grid grid-cols-2 sm:grid-cols-4 gap-1 bg-transparent">
                    {sessionData.replays.map((replay, idx) => (
                      <TabsTrigger
                        key={replay.replayId}
                        value={replay.replayId}
                      >
                        <span className="text-xs">Replay {idx + 1}</span>
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {sessionData.replays.map((replay) => (
                    <TabsContent
                      key={replay.replayId}
                      value={replay.replayId}
                      className="space-y-4"
                    >
                      {/* Replay Metadata */}
                      <div className="rounded-lg border border-border p-3 space-y-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">
                            Replay ID:
                          </span>{" "}
                          <span className="font-mono">{replay.replayId}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="text-muted-foreground">
                              Duration:
                            </span>
                            <p className="font-semibold">
                              {new Date(
                                new Date(replay.endTime).getTime() -
                                  new Date(replay.startTime).getTime()
                              )
                                .toISOString()
                                .substr(11, 8)}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Events:
                            </span>
                            <p className="font-semibold">{replay.eventCount}</p>
                          </div>
                        </div>
                      </div>

                      {/* RRWeb Player */}
                      {playerEvents.length > 0 ? (
                        <div className="rounded-lg border border-border overflow-hidden bg-white">
                          <RrwebPlayerWrapper
                            events={playerEvents}
                            width={800}
                            height={600}
                          />
                        </div>
                      ) : (
                        <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
                          No replay events available
                        </div>
                      )}
                    </TabsContent>
                  ))}
                </Tabs>
              ) : (
                <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
                  No replays found for this session
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {!sessionData && !isLoading && !error && (
            <div className="flex items-center justify-center rounded-lg border border-dashed border-border py-12">
              <div className="text-center">
                <p className="text-muted-foreground">
                  Enter a session ID above to view replays
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
