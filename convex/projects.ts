import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// 0. Get a single project by ID
export const getProject = query({
  // Expect an argument: projectId of type "projects"
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    // Fetch the project from the database
    const project = await ctx.db.get(args.projectId);

    // If project not found, throw an error
    if (!project) throw new Error("Project not found");

    // Return the project
    return project;
  },
});

// 1. Get Projects for the logged-in user
export const getMyProjects = query({
  handler: async (ctx) => {
    // Get the currently logged-in user identity
    const identity = await ctx.auth.getUserIdentity();

    // If user is not logged in, return empty list instead of error
    if (!identity) return [];

    // 1. Find the user in the DB using their Clerk ID
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    // If user record does not exist, return empty list
    if (!user) return [];

    // 2. Find all team memberships for this user
    const memberships = await ctx.db
      .query("team_members")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    // If user is not part of any team, return empty list
    if (memberships.length === 0) return [];

    // Extract the team IDs the user belongs to
    const teamIds = memberships.map((m) => m.teamId);

    // 3. Fetch all projects for these teams
    // Note: for many teams/projects, this could be optimized with a single query
    const projects = [];
    for (const teamId of teamIds) {
      const teamProjects = await ctx.db
        .query("projects")
        .withIndex("by_team", (q) => q.eq("teamId", teamId))
        .collect();
      projects.push(...teamProjects);
    }

    // Return all projects for the user's teams
    return projects;
  },
});

// 2. Create a new Project (with auto-onboarding)
export const create = mutation({
  // Expect project name and URL as input arguments
  args: { name: v.string(), url: v.string() },
  handler: async (ctx, args) => {
    // A. Verify that user is authenticated
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized: Please log in first.");

    // B. Get or Create the User
    let user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    // If user does not exist, create a new record
    if (!user) {
      console.log("First time user! creating account...");
      const userId = await ctx.db.insert("users", {
        clerkId: identity.subject,           // Unique ID from auth provider
        email: identity.email || "unknown@example.com",
        name: identity.name || "Anonymous",
        avatar: identity.pictureUrl,
        createdAt: Date.now(),
      });
      user = await ctx.db.get(userId);       // Fetch newly created user
    }

    // C. Get or Create Personal Team
    // Check if the user already belongs to a team
    let membership = await ctx.db
      .query("team_members")
      .withIndex("by_user", (q) => q.eq("userId", user!._id))
      .first();

    let teamId = membership ? membership.teamId : null;

    // If no team found, create a new "Personal" team
    if (!teamId) {
      console.log("No team found, creating 'Personal' team...");

      // Create team record
      const newTeamId = await ctx.db.insert("teams", {
        name: "Personal Team",
        slug: identity.subject.substring(0, 8), // Simple slug for URL
        plan: "free",
        createdAt: Date.now(),
      });

      // Add user as a member of the new team
      await ctx.db.insert("team_members", {
        teamId: newTeamId,
        userId: user!._id,
        role: "owner",       // User owns this team
        status: "active",    // Membership is active
        joinedAt: Date.now(),
      });

      teamId = newTeamId;
    }

    // D. Create the Project record
    const projectId = await ctx.db.insert("projects", {
      name: args.name,
      url: args.url,
      teamId: teamId!,                       // Link project to user's team
      publishableKey: "pk_" + Math.random().toString(36).substr(2, 9),
      secretKey: "sk_" + Math.random().toString(36).substr(2, 9),
      settings: {
        sessionReplay: true,                  // Enable session replay
        scanMode: "diff",                     // Default scanning mode
        maskPrivacy: true,                    // Mask sensitive data
      },
      pages: [],                               // Empty pages initially
      createdAt: Date.now(),                   // Timestamp
    });

    // Return the ID of the newly created project
    return projectId;
  },
});
