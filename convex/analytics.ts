import { action, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel"; // <--- Import Id type

async function analyticsFetch(
  url: string,
  method: "GET" | "POST" = "GET",
  options: RequestInit = {}
) {
  const backendUrl = process.env.BACKEND_URL;
  const backendApiKey = process.env.BACKEND_API_KEY;
  if (!backendUrl) {
    throw new Error("Backend URL not configured");
  }
  url = `${backendUrl}${url}`;
  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${backendApiKey}`,
    },
    ...options,
  });
  if (!response.ok) {
    throw new Error(`API CallError: ${response.status} ${response.statusText}`);
  }
  return await response.json();
}

export const ingest = mutation({
  args: {
    publishableKey: v.string(),
    events: v.array(v.any()),
    sessionId: v.optional(v.string()),
    visitorInfo: v.any(),
  },
  handler: async (ctx, args) => {
    // 1. Find Project by Key
    const project = await ctx.db
      .query("projects")
      .filter((q) => q.eq(q.field("publishableKey"), args.publishableKey))
      .first();

    if (!project) throw new Error("Invalid Key");

    // 2. Handle Session
    // Explicitly define the type for sessionId
    let sessionId: Id<"analytics_sessions">;

    if (!args.sessionId) {
      // Create new session (insert returns the correct ID type automatically)
      sessionId = await ctx.db.insert("analytics_sessions", {
        projectId: project._id,
        visitorId: args.visitorInfo.fingerprint,
        country: args.visitorInfo.country,
        device: args.visitorInfo.device,
        browser: args.visitorInfo.browser,
        startedAt: Date.now(),
        lastActiveAt: Date.now(),
        duration: 0,
        eventsCount: 0,
      });
    } else {
      // Cast the incoming string to the specific Table ID
      sessionId = args.sessionId as Id<"analytics_sessions">;

      // Now ctx.db.get knows exactly which table to look at
      const sess = await ctx.db.get(sessionId);

      if (sess) {
        // TypeScript now sees 'eventsCount' and 'startedAt' validly
        await ctx.db.patch(sessionId, {
          lastActiveAt: Date.now(),
          eventsCount: sess.eventsCount + args.events.length,
          duration: Date.now() - sess.startedAt,
        });
      }
    }

    // 3. Write Events (Batched)
    for (const event of args.events) {
      await ctx.db.insert("analytics_events", {
        projectId: project._id,
        sessionId: sessionId,
        type: event.type,
        path: event.path,
        x: event.x,
        y: event.y,
        createdAt: Date.now(),
      });
    }

    return { sessionId };
  },
});

export const getOverview = action({
  args: {
    projectId: v.string(),
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const backendUrl = process.env.BACKEND_URL;
    const backendApiKey = process.env.BACKEND_API_KEY;

    if (!backendUrl || !backendApiKey) {
      throw new Error("Backend configuration missing");
    }

    const params = new URLSearchParams({
      projectId: args.projectId,
      startDate: args.startDate,
      endDate: args.endDate,
    });

    const response = await analyticsFetch(`/analytics/overview?${params}`);

    return response;
  },
});
