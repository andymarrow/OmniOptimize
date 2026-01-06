"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Play,
  MousePointerClick,
  AlertCircle,
  Clock,
  Monitor,
  Smartphone,
  MapPin,
  Zap,
} from "lucide-react";
import { formatDurationMs, truncateClientId } from "@/utils/formatters";
import { SkeletonPulse } from "@/components/skeleton/dashboardSkeletons";
import ErrorState from "@/components/ErrorState";
import { RrwebPlayer } from "@/components/RrwebPlayer";

const TIMELINE_EVENTS = [];

const SessionPlayer = ({ replayEvents, pageUrl, loading = false }) => {
  if (loading) {
    return (
      <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex flex-col h-[300px] sm:h-[450px] shadow-lg">
        <div className="bg-slate-900 px-4 py-2 flex items-center gap-2 border-b border-slate-800">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
          </div>
          <div className="flex-1 bg-slate-800 h-6 rounded text-[10px] text-slate-400 flex items-center px-3 font-mono mx-4 truncate border border-slate-700">
            Loading...
          </div>
        </div>
        <div className="flex-1 bg-slate-100 dark:bg-[#0B1120] flex items-center justify-center">
          <SkeletonPulse className="w-3/4 h-3/4 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!replayEvents || replayEvents.length === 0) {
    return (
      <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex flex-col h-[300px] sm:h-[450px] shadow-lg">
        <div className="bg-slate-900 px-4 py-2 flex items-center gap-2 border-b border-slate-800">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
          </div>
          <div className="flex-1 bg-slate-800 h-6 rounded text-[10px] text-slate-400 flex items-center px-3 font-mono mx-4 truncate border border-slate-700">
            {pageUrl || "about:blank"}
          </div>
        </div>
        <div className="flex-1 bg-slate-100 dark:bg-[#0B1120] flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-slate-400 dark:text-slate-500 mb-3" />
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              No replay data available
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex flex-col h-[300px] sm:h-[450px] shadow-lg">
      <div className="bg-slate-900 px-4 py-2 flex items-center gap-2 border-b border-slate-800">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
        </div>
        <div className="flex-1 bg-slate-800 h-6 rounded text-[10px] text-slate-400 flex items-center px-3 font-mono mx-4 truncate border border-slate-700">
          {pageUrl || "about:blank"}
        </div>
      </div>

      {/* player goes hrre */}
      <div clsssName="w-full h-full overflow-hidden">
      <RrwebPlayer events={replayEvents} autoPlay={true} />
      </div>
    </div>
  );
};

// Skeleton for session card list
const SessionCardSkeleton = () => (
  <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
    <CardContent className="p-3">
      <div className="space-y-3">
        <div className="flex justify-between items-start">
          <SkeletonPulse className="h-4 w-24" />
          <SkeletonPulse className="h-5 w-12 rounded" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <SkeletonPulse className="h-3 w-16" />
          <SkeletonPulse className="h-3 w-16" />
          <SkeletonPulse className="h-3 w-20" />
          <SkeletonPulse className="h-3 w-16" />
        </div>
      </div>
    </CardContent>
  </Card>
);

// Normalize device string
const normalizeDevice = (device) => {
  if (!device) return "Unknown";
  return device.charAt(0).toUpperCase() + device.slice(1).toLowerCase();
};

export const SessionReplayTab = ({
  sessions = [],
  loading = false,
  error = null,
  sessionDetails = null,
  loadingDetails = false,
  detailsError = null,
  onSessionSelect = () => {},
}) => {
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [selectedReplayIndex, setSelectedReplayIndex] = useState(0);

  // Handle session selection
  const handleSelectSession = (sessionId) => {
    setSelectedSessionId(sessionId);
    setSelectedReplayIndex(0);
    onSessionSelect(sessionId);
  };

  if (error) {
    return (
      <ErrorState
        title="Unable to load sessions"
        message={error}
        showRefresh={false}
      />
    );
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-3 flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <SessionCardSkeleton key={i} />
          ))}
        </div>
        <div className="lg:col-span-6 flex flex-col gap-4">
          <SkeletonPulse className="h-[450px] w-full rounded-xl" />
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonPulse key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        </div>
        <div className="lg:col-span-3 flex flex-col gap-4">
          <SkeletonPulse className="h-[450px] w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!sessions || sessions.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] text-center">
        <div>
          <div className="text-slate-400 dark:text-slate-500 mb-2">
            <AlertCircle className="w-12 h-12 mx-auto opacity-50" />
          </div>
          <h3 className="text-slate-700 dark:text-slate-300 font-semibold mb-1">
            No sessions available
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Sessions will appear here when users interact with your site.
          </p>
        </div>
      </div>
    );
  }

  const selectedSession = selectedSessionId
    ? sessions.find((s) => s.id === selectedSessionId)
    : sessions[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-1 h-auto lg:h-full">
      {/* LEFT: Session List (3 cols) with ScrollArea */}
      <div className="lg:col-span-3 border-b lg:border-b-0 border-slate-200 dark:border-slate-800 flex flex-col h-[200px] lg:h-auto">
        <ScrollArea className="h-full max-h-[500px] w-full rounded-lg border border-slate-200 dark:border-slate-800">
          <div className="space-y-4 p-4">
            {sessions.map((session) => (
              <Card
                key={session.id}
                onClick={() => handleSelectSession(session.id)}
                className={`cursor-pointer transition-all shrink-0 bg-white dark:bg-slate-900 ${
                  session.id === selectedSession?.id
                    ? "border-green-500 ring-1 ring-green-500/20 dark:ring-green-500/40 shadow-sm"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <CardContent className="p-3">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                      {truncateClientId(session.clientId)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1 truncate">
                      <Clock className="w-3 h-3 shrink-0" />
                      {formatDurationMs(session.duration)}
                    </span>
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 shrink-0" />
                      {session.location || "—"}
                    </span>
                    <span className="flex items-center gap-1 truncate">
                      {normalizeDevice(session.device) === "Mobile" ? (
                        <Smartphone className="w-3 h-3 shrink-0" />
                      ) : (
                        <Monitor className="w-3 h-3 shrink-0" />
                      )}
                      {normalizeDevice(session.device)}
                    </span>
                    {session.rageClicks > 0 && (
                      <span className="text-red-600 dark:text-red-400 font-bold flex items-center gap-1 truncate">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        {session.rageClicks} Rage
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* MIDDLE: Player (6 cols) */}
      <div className="lg:col-span-6 flex flex-col gap-4">
        <SessionPlayer
          replayEvents={
            sessionDetails?.replays && sessionDetails.replays.length > 0
              ? sessionDetails.replays[selectedReplayIndex]?.events?.map(
                  (e) => e.rrwebPayload
                )
              : null
          }
          pageUrl={
            sessionDetails?.replays && sessionDetails.replays.length > 0
              ? sessionDetails.replays[selectedReplayIndex]?.events?.[0]?.url
              : selectedSession?.url
          }
          loading={loadingDetails}
        />
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              label: "Events",
              value: selectedSession?.eventsCount || "0",
              color: "text-slate-900 dark:text-white",
            },
            {
              label: "Duration",
              value: formatDurationMs(selectedSession?.duration || 0),
              color: "text-slate-900 dark:text-white",
            },
            {
              label: "Rage Clicks",
              value: selectedSession?.rageClicks || "0",
              color:
                selectedSession?.rageClicks > 0
                  ? "text-red-600 dark:text-red-400"
                  : "text-slate-900 dark:text-white",
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-center shadow-sm"
            >
              <div className="text-[10px] sm:text-xs text-slate-500 uppercase font-bold tracking-wider">
                {stat.label}
              </div>
              <div
                className={`text-lg sm:text-xl font-mono font-bold mt-1 ${stat.color}`}
              >
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT: Replays List (3 cols) */}
      <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col h-[300px] lg:h-auto shadow-sm">
        <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-xs uppercase tracking-wider text-slate-500">
          Replays
        </div>
        <div className="flex-1 overflow-y-auto p-0 scrollbar-hide">
          {/* Loading state for session details */}
          {loadingDetails ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonPulse key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : detailsError ? (
            /* Error state: Failed to load replays */
            <div className="p-4 flex items-center gap-3 text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <div className="text-xs">
                <p className="font-semibold">Failed to load replays</p>
                <p className="text-red-500/80 dark:text-red-400/80 text-[10px]">
                  {detailsError}
                </p>
              </div>
            </div>
          ) : !sessionDetails?.replays ||
            sessionDetails.replays.length === 0 ? (
            /* Empty state: No replays on this session */
            <div className="p-4 flex flex-col items-center justify-center gap-2 text-slate-500 dark:text-slate-400">
              <AlertCircle className="w-5 h-5 opacity-50" />
              <p className="text-xs text-center">No replays recorded</p>
              <p className="text-[10px] opacity-75 text-center">
                No rrweb data available for this session
              </p>
            </div>
          ) : (
            /* Replays list */
            <div className="space-y-2 p-3">
              {sessionDetails.replays.map((replay, idx) => {
                const startTime = replay.events?.[0]?.timestamp
                  ? new Date(replay.events[0].timestamp)
                  : null;
                const endTime = replay.events?.[replay.events.length - 1]
                  ?.timestamp
                  ? new Date(replay.events[replay.events.length - 1].timestamp)
                  : null;

                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedReplayIndex(idx)}
                    className={`p-3 rounded-lg cursor-pointer transition-all border ${
                      idx === selectedReplayIndex
                        ? "border-green-500 bg-green-500/5 ring-1 ring-green-500/20 dark:ring-green-500/40 shadow-sm"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <Play className="w-4 h-4 mt-0.5 shrink-0 opacity-70" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-slate-900 dark:text-white">
                          Replay {idx + 1}
                        </div>
                        {startTime && (
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                            {startTime.toLocaleString()}
                          </div>
                        )}
                        {replay.events && (
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">
                            {replay.events.length} events
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
