// Heatmap Types
export interface HeatmapGridPoint {
  gridX: number;
  gridY: number;
  count: number;
  xNorm: number;
  yNorm: number;
  selector: string;
  tagName: string;
  elementTextHash: string;
  screenClass: string;
}

export interface HeatmapData {
  projectId: string;
  url: string;
  clickCount: number;
  gridSize: number;
  screenClasses: string[];
  pageWidth: number;
  pageHeight: number;
  grid: HeatmapGridPoint[];
}

// Session & Replay Types
export interface RrwebPayload {
  data?: {
    href?: string;
    width?: number;
    height?: number;
    [key: string]: any;
  };
  type: number;
  timestamp: number;
  [key: string]: any;
}

export interface SessionEvent {
  id: string;
  eventId: string;
  timestamp: string;
  url: string;
  rrwebPayload: RrwebPayload;
  schemaVersion: string;
}

export interface Replay {
  replayId: string;
  eventCount: number;
  startTime: string;
  endTime: string;
  events: SessionEvent[];
}

export interface Session {
  session: {
    id: string;
    projectId: string;
    clientId: string;
    userId: string | null;
    createdAt: string;
    updatedAt: string;
  };
  eventCount: number;
  replays: Replay[];
}

// API Response Types
export interface HeatmapResponse extends HeatmapData {}

export interface SessionResponse extends Session {}
