import { v } from "convex/values";
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";

// ── Queries ───────────────────────────────────────────────────────────────────

export const getByUserId = query({
  args: { userId: v.string() },
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id("profiles"),
      _creationTime: v.number(),
      userId: v.string(),
      name: v.string(),
      email: v.string(),
      role: v.union(
        v.literal("GUEST"),
        v.literal("LEARNER"),
        v.literal("EMPLOYER"),
        v.literal("EDUCATOR"),
        v.literal("ADMIN"),
        v.literal("MOD"),
      ),
      avatarUrl: v.optional(v.string()),
      walletAddress: v.optional(v.string()),
      bio: v.optional(v.string()),
      xp: v.number(),
      badge: v.optional(v.string()),
      status: v.union(
        v.literal("active"),
        v.literal("banned"),
        v.literal("suspended"),
      ),
    }),
  ),
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
  },
});

export const getLeaderboard = query({
  args: { limit: v.optional(v.number()) },
  returns: v.array(
    v.object({
      _id: v.id("profiles"),
      _creationTime: v.number(),
      userId: v.string(),
      name: v.string(),
      email: v.string(),
      role: v.union(
        v.literal("GUEST"),
        v.literal("LEARNER"),
        v.literal("EMPLOYER"),
        v.literal("EDUCATOR"),
        v.literal("ADMIN"),
        v.literal("MOD"),
      ),
      avatarUrl: v.optional(v.string()),
      walletAddress: v.optional(v.string()),
      bio: v.optional(v.string()),
      xp: v.number(),
      badge: v.optional(v.string()),
      status: v.union(
        v.literal("active"),
        v.literal("banned"),
        v.literal("suspended"),
      ),
    }),
  ),
  handler: async (ctx, { limit }) => {
    return await ctx.db
      .query("profiles")
      .withIndex("by_xp")
      .order("desc")
      .take(limit ?? 50);
  },
});

export const internalGetByUserId = internalQuery({
  args: { userId: v.string() },
  returns: v.union(v.null(), v.id("profiles")),
  handler: async (ctx, { userId }) => {
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    return profile?._id ?? null;
  },
});

// ── Mutations ─────────────────────────────────────────────────────────────────

export const upsert = mutation({
  args: {
    userId: v.string(),
    name: v.string(),
    email: v.string(),
    role: v.optional(
      v.union(
        v.literal("GUEST"),
        v.literal("LEARNER"),
        v.literal("EMPLOYER"),
        v.literal("EDUCATOR"),
        v.literal("ADMIN"),
        v.literal("MOD"),
      ),
    ),
    avatarUrl: v.optional(v.string()),
    walletAddress: v.optional(v.string()),
    bio: v.optional(v.string()),
  },
  returns: v.id("profiles"),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.name,
        email: args.email,
        ...(args.avatarUrl !== undefined && { avatarUrl: args.avatarUrl }),
        ...(args.walletAddress !== undefined && {
          walletAddress: args.walletAddress,
        }),
        ...(args.bio !== undefined && { bio: args.bio }),
        ...(args.role !== undefined && { role: args.role }),
      });
      return existing._id;
    }

    return await ctx.db.insert("profiles", {
      userId: args.userId,
      name: args.name,
      email: args.email,
      role: args.role ?? "LEARNER",
      avatarUrl: args.avatarUrl,
      walletAddress: args.walletAddress,
      bio: args.bio,
      xp: 0,
      status: "active",
    });
  },
});

export const updateRole = mutation({
  args: {
    userId: v.string(),
    role: v.union(
      v.literal("GUEST"),
      v.literal("LEARNER"),
      v.literal("EMPLOYER"),
      v.literal("EDUCATOR"),
      v.literal("ADMIN"),
      v.literal("MOD"),
    ),
  },
  returns: v.null(),
  handler: async (ctx, { userId, role }) => {
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!profile) throw new Error("Profile not found");
    await ctx.db.patch(profile._id, { role });
    return null;
  },
});

export const addXp = internalMutation({
  args: {
    userId: v.string(),
    amount: v.number(),
    reason: v.string(),
    courseId: v.optional(v.id("courses")),
  },
  returns: v.null(),
  handler: async (ctx, { userId, amount, reason, courseId }) => {
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!profile) return null;

    await ctx.db.patch(profile._id, { xp: profile.xp + amount });
    await ctx.db.insert("xpEvents", {
      userId,
      amount,
      reason,
      courseId,
    });
    return null;
  },
});

export const updateStatus = internalMutation({
  args: {
    userId: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("banned"),
      v.literal("suspended"),
    ),
  },
  returns: v.null(),
  handler: async (ctx, { userId, status }) => {
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!profile) return null;
    await ctx.db.patch(profile._id, { status });
    return null;
  },
});
