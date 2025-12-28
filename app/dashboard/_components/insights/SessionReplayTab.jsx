"use client";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Play,
  MousePointerClick,
  AlertCircle,
  Clock,
  Layout,
  Monitor,
  Smartphone,
  MapPin,
  ArrowDown,
} from "lucide-react";

const SESSIONS = [
  {
    id: 1,
    user: "User_8x92",
    location: "Ethiopia",
    device: "Mobile",
    duration: "4m 12s",
    events: 24,
    rageClicks: 2,
    status: "Abandoned",
  },
  {
    id: 2,
    user: "User_33a1",
    location: "USA",
    device: "Desktop",
    duration: "12m 05s",
    events: 112,
    rageClicks: 0,
    status: "Purchased",
  },
  {
    id: 3,
    user: "User_99b2",
    location: "UK",
    device: "Desktop",
    duration: "0m 45s",
    events: 5,
    rageClicks: 0,
    status: "Bounced",
  },
];

const TIMELINE_EVENTS = [
  { time: "00:05", type: "navigate", label: "Landed on /home", icon: Layout },
  {
    time: "00:12",
    type: "click",
    label: "Clicked 'Shop Now'",
    icon: MousePointerClick,
  },
  { time: "00:15", type: "navigate", label: "Viewed /products", icon: Layout },
  {
    time: "00:45",
    type: "scroll",
    label: "Scrolled to bottom",
    icon: ArrowDown,
  },
  {
    time: "01:02",
    type: "click",
    label: "Clicked 'Add to Cart' (Failed)",
    icon: AlertCircle,
    color: "text-red-500",
  },
  {
    time: "01:04",
    type: "rage",
    label: "Rage Click on 'Add to Cart'",
    icon: MousePointerClick,
    color: "text-red-500 font-bold",
  },
];

const SessionPlayer = () => (
  <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex flex-col h-[300px] sm:h-[450px] shadow-lg">
    {/* Browser Bar */}
    <div className="bg-slate-900 px-4 py-2 flex items-center gap-2 border-b border-slate-800">
      <div className="flex gap-1.5">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
      </div>
      <div className="flex-1 bg-slate-800 h-6 rounded text-[10px] text-slate-400 flex items-center px-3 font-mono mx-4 truncate border border-slate-700">
        wego.com.et/products
      </div>
    </div>
    {/* Playback Canvas */}
    <div className="flex-1 relative bg-slate-100 dark:bg-[#0B1120] flex items-center justify-center overflow-hidden">
      <div className="absolute top-1/4 left-1/4 animate-[bounce_3s_infinite] z-10 pointer-events-none">
        <MousePointerClick className="w-8 h-8 text-slate-900 dark:text-white drop-shadow-xl fill-white/20" />
      </div>
      {/* Mock Content */}
      <div className="w-3/4 h-3/4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm p-4 text-center">
        [ Session Video Replay Canvas ]
      </div>
    </div>
    {/* Controls */}
    <div className="bg-slate-900 p-3 flex items-center gap-4 border-t border-slate-800">
      <Button
        size="icon"
        variant="ghost"
        className="h-8 w-8 text-white hover:bg-slate-800"
      >
        <Play className="w-4 h-4 fill-current" />
      </Button>
      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden relative cursor-pointer">
        <div className="w-[35%] h-full bg-brand-500 rounded-full" />
      </div>
      <span className="text-xs text-slate-400 font-mono hidden sm:inline w-20 text-right">
        01:12 / 04:12
      </span>
    </div>
  </div>
);

export const SessionReplayTab = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-auto lg:h-full">
      {/* LEFT: Session List (3 cols) */}
      <div className="lg:col-span-3 flex flex-col gap-4 overflow-y-auto lg:pr-2 h-[200px] lg:h-auto border-b lg:border-b-0 border-slate-200 dark:border-slate-800 pb-4 lg:pb-0">
        {SESSIONS.map((session, i) => (
          <Card
            key={i}
            className={`cursor-pointer transition-all shrink-0 bg-white dark:bg-slate-900 ${
              i === 0
                ? "border-brand-500 ring-1 ring-brand-500/20 dark:ring-brand-500/40 shadow-sm"
                : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
            }`}
          >
            <CardContent className="p-3">
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  {session.user}
                </span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                    session.status === "Purchased"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                  }`}
                >
                  {session.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1 truncate">
                  <Clock className="w-3 h-3 shrink-0" /> {session.duration}
                </span>
                <span className="flex items-center gap-1 truncate">
                  <MapPin className="w-3 h-3 shrink-0" /> {session.location}
                </span>
                <span className="flex items-center gap-1 truncate">
                  {session.device === "Mobile" ? (
                    <Smartphone className="w-3 h-3 shrink-0" />
                  ) : (
                    <Monitor className="w-3 h-3 shrink-0" />
                  )}{" "}
                  {session.device}
                </span>
                {session.rageClicks > 0 && (
                  <span className="text-red-600 dark:text-red-400 font-bold flex items-center gap-1 truncate">
                    <AlertCircle className="w-3 h-3 shrink-0" />{" "}
                    {session.rageClicks} Rage
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* MIDDLE: Player (6 cols) */}
      <div className="lg:col-span-6 flex flex-col gap-4">
        <SessionPlayer />
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              label: "Clicks",
              value: "24",
              color: "text-slate-900 dark:text-white",
            },
            {
              label: "Pages",
              value: "4",
              color: "text-slate-900 dark:text-white",
            },
            {
              label: "Errors",
              value: "1",
              color: "text-red-600 dark:text-red-400",
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

      {/* RIGHT: Event Stream (3 cols) */}
      <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col h-[300px] lg:h-auto shadow-sm">
        <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-xs uppercase tracking-wider text-slate-500">
          Session Timeline
        </div>
        <div className="flex-1 overflow-y-auto p-0 scrollbar-hide">
          {TIMELINE_EVENTS.map((event, i) => (
            <div
              key={i}
              className="flex gap-3 p-3 border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
            >
              <div className="text-xs font-mono text-slate-400 pt-0.5 w-10 shrink-0 opacity-70 group-hover:opacity-100">
                {event.time}
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className={`flex items-center gap-2 text-sm font-medium ${event.color || "text-slate-700 dark:text-slate-300"}`}
                >
                  <event.icon className="w-3.5 h-3.5 shrink-0 opacity-70 group-hover:opacity-100" />
                  <span className="truncate">{event.label}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
