# Analytics Visualizer Frontend

A clean, elegant frontend for visualizing session replays and click heatmaps from the omni-sdk backend.

## Features

- **Heatmap Visualization**: View click intensity maps with grid-based rendering
- **Session Replay**: Watch recorded user sessions with rrweb player
- **Type-Safe**: Full TypeScript support with strong typing
- **State Management**: Zustand for clean global state
- **Modern UI**: shadcn/ui components with TailwindCSS

## Tech Stack

- **Framework**: Vite + React 18
- **Styling**: TailwindCSS
- **State**: Zustand
- **Data Fetching**: Axios + React Query
- **UI Components**: shadcn/ui
- **Replay**: rrweb-player
- **Language**: TypeScript

## Project Structure

```
src/
├── types/           # Type definitions for API responses
├── store/           # Zustand stores (heatmap, session)
├── api/             # Axios client & React Query hooks
├── pages/           # Page components (Heatmap, SessionReplay)
├── components/      # UI components (shadcn/ui + custom)
├── utils/           # Utilities (canvas rendering, colors, etc.)
├── App.tsx          # Main app with routing
└── main.tsx         # Entry point
```

## Setup

### Install Dependencies

```bash
cd frontend-visualize
pnpm install
```

### Environment Variables

Create a `.env.local` file:

```
VITE_API_BASE=http://localhost:5000
```

### Development

```bash
pnpm dev
```

Opens on `http://localhost:3000`

### Build

```bash
pnpm build
```

## API Integration

### Heatmap API

```
GET /heatmaps/<projectId>/<urlEncoded>
```

Returns: Grid data with click counts, positions, selectors

### Session API

```
GET /sessions/<sessionId>
```

Returns: Session metadata + replays with rrweb events

## Usage

### Heatmap Page

1. Enter a URL in the input field
2. Click "Fetch Heatmap"
3. Hover over grid points to see click details
4. View metadata: total clicks, grid points, page size

### Session Replay Page

1. Enter a session ID
2. Click "Fetch Session"
3. Select a replay from the tabs
4. Use rrweb player controls (play, pause, speed)

## Key Components

### `HeatmapPage`

- URL input form
- Canvas-based heatmap rendering
- Grid point visualization with gaussian blur
- Hover tooltips with click details
- Metadata display

### `SessionReplayPage`

- Session ID input form
- Replay tabs for multi-replay sessions
- rrweb-player integration
- Session metadata display
- Event count tracking

### Heatmap Rendering

- Canvas-based rendering for performance
- Intensity-based coloring (blue → red)
- Axis labels and grid information
- Normalized coordinates for responsive scaling

## Styling

The app uses a minimal, professional color scheme inspired by the attached design. Colors are fully customizable via `tailwind.config.ts`.

Default colors:

- Background: `#ffffff`
- Foreground: `#0a0a0a`
- Accent: `#ff4040`
- Muted: `#f5f5f5`

## Future Enhancements

- [ ] Dark mode toggle
- [ ] Export heatmap as image/PDF
- [ ] Filter heatmap by device/screen class
- [ ] Timeline view for session events
- [ ] URL history/bookmarks
- [ ] Performance analytics

## Notes

- No backend modifications
- No authentication layer
- No screenshot capture (uses placeholder backgrounds)
- All calculations delegated to backend
- Frontend is visualization + orchestration only
