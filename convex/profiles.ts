import { ConvexError, v } from "convex/values";
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import schema from "./schema";
import { getProfile, withAvatarUrl } from "./lib/profileHelpers";

// ── Queries ───────────────────────────────────────────────────────────────────

const profileDoc = schema.doc("profiles");

export const getByUserId = query({
  args: { userId: v.string() },
  returns: v.union(v.null(), profileDoc),
  handler: async (ctx, { userId }) => {
    const profile = await getProfile(ctx, userId);
    return profile ? await withAvatarUrl(ctx, profile) : null;
  },
});

export const getLeaderboard = query({
  args: { limit: v.optional(v.number()) },
  returns: v.array(profileDoc),
  handler: async (ctx, { limit }) => {
    const rows = await ctx.db
      .query("profiles")
      .withIndex("by_xp")
      .order("desc")
      .take(Math.min(limit ?? 50, 100));
    return await Promise.all(rows.map((p) => withAvatarUrl(ctx, p)));
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
    if (!profile) throw new ConvexError("Profile not found");
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

const MAX_FIELD = 200;
const clean = (value: string | undefined) =>
  value === undefined ? undefined : value.trim().slice(0, MAX_FIELD);

export const updateProfile = mutation({
  args: {
    userId: v.string(),
    name: v.string(),
    title: v.optional(v.string()),
    bio: v.optional(v.string()),
    socials: v.optional(
      v.object({
        twitter: v.optional(v.string()),
        linkedin: v.optional(v.string()),
        github: v.optional(v.string()),
        telegram: v.optional(v.string()),
        website: v.optional(v.string()),
      }),
    ),
  },
  returns: v.null(),
  handler: async (ctx, { userId, name, title, bio, socials }) => {
    const profile = await getProfile(ctx, userId);
    if (!profile) throw new ConvexError("Profile not found");
    const trimmedName = name.trim().slice(0, 80);
    if (!trimmedName) throw new ConvexError("Name cannot be empty");
    await ctx.db.patch(profile._id, {
      name: trimmedName,
      title: clean(title),
      bio: bio === undefined ? undefined : bio.trim().slice(0, 1000),
      socials: socials && {
        twitter: clean(socials.twitter),
        linkedin: clean(socials.linkedin),
        github: clean(socials.github),
        telegram: clean(socials.telegram),
        website: clean(socials.website),
      },
    });
    return null;
  },
});

export const generateAvatarUploadUrl = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const setAvatar = mutation({
  args: { userId: v.string(), storageId: v.id("_storage") },
  returns: v.union(v.null(), v.string()),
  handler: async (ctx, { userId, storageId }) => {
    const profile = await getProfile(ctx, userId);
    if (!profile) throw new ConvexError("Profile not found");
    const meta = await ctx.db.system.get(storageId);
    if (!meta) throw new ConvexError("Upload not found");
    if (!meta.contentType?.startsWith("image/")) {
      await ctx.storage.delete(storageId);
      throw new ConvexError("Avatar must be an image");
    }
    if (meta.size > 5 * 1024 * 1024) {
      await ctx.storage.delete(storageId);
      throw new ConvexError("Avatar must be under 5 MB");
    }
    if (profile.avatarStorageId && profile.avatarStorageId !== storageId) {
      await ctx.storage.delete(profile.avatarStorageId);
    }
    await ctx.db.patch(profile._id, { avatarStorageId: storageId });
    return await ctx.storage.getUrl(storageId);
  },
});
