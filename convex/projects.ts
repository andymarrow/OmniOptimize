import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// 0. Get a single project by ID
export const getProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");
    return project;
  },
});

// 1. Get Projects for the logged-in user
export const getMyProjects = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    // If not logged in, return empty list (don't throw error for UI queries)
    if (!identity) return [];

    // 1. Find the user in our DB
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) return [];

    // 2. Find teams this user belongs to
    const memberships = await ctx.db
      .query("team_members")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    if (memberships.length === 0) return [];

    const teamIds = memberships.map((m) => m.teamId);

    // 3. Fetch projects for those teams
    // (In a real app with many teams, you might optimize this)
    const projects = [];
    for (const teamId of teamIds) {
      const teamProjects = await ctx.db
        .query("projects")
        .withIndex("by_team", (q) => q.eq("teamId", teamId))
        .collect();
      projects.push(...teamProjects);
    }

    return projects;
  },
});

// 2. Create a new Project (With Auto-Onboarding)
export const create = mutation({
  args: { name: v.string(), url: v.string() },
  handler: async (ctx, args) => {
    // A. Verify Auth
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized: Please log in first.");

    // B. Get or Create User
    // We use 'subject' as the stable Clerk ID
    let user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      console.log("First time user! creating account...");
      const userId = await ctx.db.insert("users", {
        clerkId: identity.subject,
        email: identity.email || "unknown@example.com",
        name: identity.name || "Anonymous",
        avatar: identity.pictureUrl,
        createdAt: Date.now(),
      });
      user = await ctx.db.get(userId);
    }

    // C. Get or Create Personal Team
    // Check if they are part of any team
    let membership = await ctx.db
      .query("team_members")
      .withIndex("by_user", (q) => q.eq("userId", user!._id))
      .first();

    let teamId = membership ? membership.teamId : null;

    if (!teamId) {
      console.log("No team found, creating 'Personal' team...");
      // Create Team
      const newTeamId = await ctx.db.insert("teams", {
        name: "Personal Team",
        slug: identity.subject.substring(0, 8), // Simple slug
        plan: "free",
        createdAt: Date.now(),
      });

      // Link User to Team
      await ctx.db.insert("team_members", {
        teamId: newTeamId,
        userId: user!._id,
        role: "owner",
        status: "active",
        joinedAt: Date.now(),
      });

      teamId = newTeamId;
    }

    // D. Create the Project
    const projectId = await ctx.db.insert("projects", {
      name: args.name,
      url: args.url,
      teamId: teamId!,
      publishableKey: "pk_" + Math.random().toString(36).substr(2, 9),
      secretKey: "sk_" + Math.random().toString(36).substr(2, 9),
      settings: {
        sessionReplay: true,
        scanMode: "diff",
        maskPrivacy: true,
      },
      pages: [],
      createdAt: Date.now(),
    });

    return projectId;
  },
});
