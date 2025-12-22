export const mockSessionData = {
  session: {
    id: "session-1766317002115-womexft0bkd",
    projectId: "local-example-app",
    clientId: "anon-4e7c3083-c1f6-437f-97e2-4e9919a41e8c",
    userId: null,
    createdAt: "2025-12-21T11:36:42.211Z",
    updatedAt: "2025-12-21T11:37:02.254Z",
  },
  eventCount: 115,
  replays: [
    {
      replayId: "replay-1766317002111-yui9fq09qwa",
      eventCount: 115,
      startTime: "2025-12-21T11:36:42.120Z",
      endTime: "2025-12-21T11:36:56.434Z",
      events: [
        {
          id: "33992c19-164f-477c-9dd1-c3672570f0ea",
          eventId: "9761e424-6968-4d20-967f-366802031db7",
          timestamp: "2025-12-21T11:36:42.120Z",
          url: "http://localhost:5174/products",
          rrwebPayload: {
            data: {
              href: "http://localhost:5174/products",
              width: 1366,
              height: 641,
            },
            type: 4,
            timestamp: 1766317002120,
          },
          schemaVersion: "1.0",
        },
        {
          id: "44a03c2a-275g-588d-9ae2-d4673681g2fb",
          eventId: "0872f535-7079-4e31-0078-477913142ec8",
          timestamp: "2025-12-21T11:36:45.320Z",
          url: "http://localhost:5174/products",
          rrwebPayload: {
            type: 5,
            timestamp: 1766317005320,
            data: {
              source: 2,
              type: 2,
              id: 42,
              x: 500,
              y: 300,
            },
          },
          schemaVersion: "1.0",
        },
        {
          id: "55b14d3b-386h-699e-9bf3-e5784792h3gc",
          eventId: "1983g646-8180-5f42-1189-588024253fd9",
          timestamp: "2025-12-21T11:36:48.420Z",
          url: "http://localhost:5174/products",
          rrwebPayload: {
            type: 5,
            timestamp: 1766317008420,
            data: {
              source: 2,
              type: 2,
              id: 45,
              x: 600,
              y: 400,
            },
          },
          schemaVersion: "1.0",
        },
      ],
    },
  ],
};
