import {
  action,
  mutation,
  internalMutation,
  internalQuery,
} from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";

async function analyticsFetch(
  url: string,
  method: "GET" | "POST" = "GET",
  options: RequestInit = {},
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

export const getTrafficData = action({
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

    const response = await analyticsFetch(`/analytics/traffic?${params}`);

    return response;
  },
});

// Internal mutation: Verify user has access to project
export const verifyProjectAccess = internalQuery({
  args: {
    clerkId: v.string(),
    projectId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get user by Clerk ID
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Get user's team membership
    const membership = await ctx.db
      .query("team_members")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    if (!membership) {
      throw new Error("User has no team membership");
    }

    // Get project and verify it belongs to user's team
    const project = await ctx.db.get(args.projectId as Id<"projects">);
    if (!project || project.teamId !== membership.teamId) {
      throw new Error("Forbidden: no access to this project");
    }

    return true;
  },
});

// Top Pages: GET /analytics/top-pages
export const getTopPages = action({
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

    // Verify user has access to this project
    await ctx.runQuery(internal.analytics.verifyProjectAccess, {
      clerkId: identity.subject,
      projectId: args.projectId,
    });

    // Call backend API
    const params = new URLSearchParams({
      projectId: args.projectId,
      startDate: args.startDate,
      endDate: args.endDate,
    });

    const response = await analyticsFetch(`/analytics/top-pages?${params}`);
    return response;
  },
});

// Sessions: GET /sessions/projects/{projectId}
export const getSessions = action({
  args: {
    projectId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    // Verify user has access to this project
    await ctx.runQuery(internal.analytics.verifyProjectAccess, {
      clerkId: identity.subject,
      projectId: args.projectId,
    });

    // Call backend API
    const response = await analyticsFetch(
      `/sessions/projects/${args.projectId}`,
    );
    return response;
  },
});

// Get Single Session: GET /sessions/{sessionId}
export const getSessionById = action({
  args: {
    projectId: v.string(),
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    // Verify user has access to this project
    await ctx.runQuery(internal.analytics.verifyProjectAccess, {
      clerkId: identity.subject,
      projectId: args.projectId,
    });

    // Call backend API
    const response = await analyticsFetch(`/sessions/${args.sessionId}`);
    return response;
  },
});

// ============= HEATMAP PAGES =============

export const getHeatmapPages = internalQuery({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");
    return project.pages || [];
  },
});

export const addHeatmapPage = mutation({
  args: {
    projectId: v.id("projects"),
    route: v.string(),
    fullUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Verify user has access to this project
    await ctx.runQuery(internal.analytics.verifyProjectAccess, {
      clerkId: identity.subject,
      projectId: args.projectId,
    });

    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");

    // Check if page already exists
    const pageExists = (project.pages || []).some(
      (p: any) => p.route === args.route,
    );
    if (pageExists) {
      throw new Error("Page already exists for this route");
    }

    // Add new page to array
    const updatedPages = [
      ...(project.pages || []),
      {
        route: args.route,
        fullUrl: args.fullUrl,
        isDefault: args.route === "/",
      },
    ];

    await ctx.db.patch(args.projectId, {
      pages: updatedPages,
    });

    return updatedPages;
  },
});

export const updateHeatmapPage = mutation({
  args: {
    projectId: v.id("projects"),
    index: v.number(),
    fullUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    await ctx.runQuery(internal.analytics.verifyProjectAccess, {
      clerkId: identity.subject,
      projectId: args.projectId,
    });

    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");

    const pages = project.pages || [];
    if (args.index < 0 || args.index >= pages.length) {
      throw new Error("Invalid page index");
    }

    // Derive route from full URL
    let route = "/";
    try {
      const urlObj = new URL(args.fullUrl);
      route = urlObj.pathname || "/";
    } catch (e) {
      throw new Error("Invalid URL");
    }

    const updated = {
      ...pages[args.index],
      route,
      fullUrl: args.fullUrl,
      isDefault: route === "/",
    };
    const updatedPages = pages.map((p: any, i: number) =>
      i === args.index ? updated : p,
    );

    await ctx.db.patch(args.projectId, { pages: updatedPages });
    return updatedPages;
  },
});

export const fetchHeatmapData = action({
  args: {
    projectId: v.id("projects"),
    fullUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Verify user has access to this project
    await ctx.runQuery(internal.analytics.verifyProjectAccess, {
      clerkId: identity.subject,
      projectId: args.projectId,
    });

    // Call analytics backend to fetch heatmap data
    const response = await analyticsFetch(
      `/heatmaps/${args.projectId}/${encodeURIComponent(args.fullUrl)}`,
    );

    return response;
  },
});

// Retention Cohorts: GET /analytics/retention
export const getRetentionCohorts = action({
  args: {
    projectId: v.string(),
    startDate: v.string(),
    endDate: v.string(),
    intervals: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    // Verify user has access to this project
    await ctx.runQuery(internal.analytics.verifyProjectAccess, {
      clerkId: identity.subject,
      projectId: args.projectId,
    });

    // Call analytics backend to fetch retention cohort data
    const params = new URLSearchParams({
      projectId: args.projectId,
      startDate: args.startDate,
      endDate: args.endDate,
      intervals: args.intervals,
    });

    const response = await analyticsFetch(`/analytics/retention?${params}`);
    return response;
  },
});
