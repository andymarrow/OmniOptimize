import { query } from "./_generated/server";
import { v } from "convex/values";

// Helper: Check if user has access to a project
export const userHasAccessToProject = query({
  args: { projectId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", identity.subject))
      .first();
    if (!user) return false;

    const memberships = await ctx.db
      .query("team_members")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const teamIds = new Set(memberships.map((m: any) => m.teamId));

    const projectId = ctx.db.normalizeId("projects", args.projectId);
    if (!projectId) return false;

    const project = await ctx.db.get(projectId);
    return project && teamIds.has(project.teamId);
  },
});

// Used by CommitLog.jsx to fetch history
export const getCommits = query({
  args: { projectId: v.string() }, // Accept ID as string from URL params
  handler: async (ctx, args) => {
    // 1. Check if valid ID format (optional safety)
    const projectId = ctx.db.normalizeId("projects", args.projectId);
    if (!projectId) return [];

    // 2. Fetch audits
    const audits = await ctx.db
      .query("code_audits")
      .withIndex("by_project", (q: any) => q.eq("projectId", projectId))
      .order("desc") // Newest first
      .take(20);

    return audits;
  },
});
