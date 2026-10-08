import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ── Queries ───────────────────────────────────────────────────────────────────

export const listRooms = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("chatRooms"),
      _creationTime: v.number(),
      name: v.string(),
      slug: v.string(),
      description: v.string(),
      iconColor: v.string(),
      isActive: v.boolean(),
      createdBy: v.optional(v.string()),
    }),
  ),
  handler: async (ctx) => {
    return await ctx.db
      .query("chatRooms")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .collect();
  },
});

export const getRoomBySlug = query({
  args: { slug: v.string() },
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id("chatRooms"),
      _creationTime: v.number(),
      name: v.string(),
      slug: v.string(),
      description: v.string(),
      iconColor: v.string(),
      isActive: v.boolean(),
      createdBy: v.optional(v.string()),
    }),
  ),
  handler: async (ctx, { slug }) => {
    return await ctx.db
      .query("chatRooms")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
  },
});

export const listMessages = query({
  args: { roomId: v.id("chatRooms"), limit: v.optional(v.number()) },
  returns: v.array(
    v.object({
      _id: v.id("communityMessages"),
      _creationTime: v.number(),
      roomId: v.id("chatRooms"),
      userId: v.string(),
      content: v.string(),
      imageStorageId: v.optional(v.id("_storage")),
      isPinned: v.boolean(),
    }),
  ),
  handler: async (ctx, { roomId, limit }) => {
    return await ctx.db
      .query("communityMessages")
      .withIndex("by_roomId", (q) => q.eq("roomId", roomId))
      .order("desc")
      .take(limit ?? 100);
  },
});

export const listPinnedMessages = query({
  args: { roomId: v.id("chatRooms") },
  returns: v.array(
    v.object({
      _id: v.id("communityMessages"),
      _creationTime: v.number(),
      roomId: v.id("chatRooms"),
      userId: v.string(),
      content: v.string(),
      imageStorageId: v.optional(v.id("_storage")),
      isPinned: v.boolean(),
    }),
  ),
  handler: async (ctx, { roomId }) => {
    return await ctx.db
      .query("communityMessages")
      .withIndex("by_roomId_pinned", (q) =>
        q.eq("roomId", roomId).eq("isPinned", true),
      )
      .collect();
  },
});

// ── Mutations ─────────────────────────────────────────────────────────────────

export const createRoom = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    iconColor: v.string(),
    createdBy: v.optional(v.string()),
  },
  returns: v.id("chatRooms"),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("chatRooms")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (existing) return existing._id;

    return await ctx.db.insert("chatRooms", {
      ...args,
      isActive: true,
    });
  },
});

export const sendMessage = mutation({
  args: {
    roomId: v.id("chatRooms"),
    userId: v.string(),
    content: v.string(),
    imageStorageId: v.optional(v.id("_storage")),
  },
  returns: v.id("communityMessages"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("communityMessages", {
      ...args,
      isPinned: false,
    });
  },
});

export const pinMessage = mutation({
  args: {
    messageId: v.id("communityMessages"),
    isPinned: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, { messageId, isPinned }) => {
    await ctx.db.patch(messageId, { isPinned });
    return null;
  },
});

export const joinRoom = mutation({
  args: { roomId: v.id("chatRooms"), userId: v.string() },
  returns: v.null(),
  handler: async (ctx, { roomId, userId }) => {
    const existing = await ctx.db
      .query("roomMemberships")
      .withIndex("by_roomId_userId", (q) =>
        q.eq("roomId", roomId).eq("userId", userId),
      )
      .unique();
    if (!existing) {
      await ctx.db.insert("roomMemberships", { roomId, userId });
    }
    return null;
  },
});

export const leaveRoom = mutation({
  args: { roomId: v.id("chatRooms"), userId: v.string() },
  returns: v.null(),
  handler: async (ctx, { roomId, userId }) => {
    const membership = await ctx.db
      .query("roomMemberships")
      .withIndex("by_roomId_userId", (q) =>
        q.eq("roomId", roomId).eq("userId", userId),
      )
      .unique();
    if (membership) await ctx.db.delete(membership._id);
    return null;
  },
});

export const generateImageUploadUrl = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});
