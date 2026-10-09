import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import {
  getOrCreateConversation,
  isParticipant,
  postDirectMessage,
} from "./lib/conversations";
import { publicProfileSummary } from "./lib/profileHelpers";

const conversationSummary = v.object({
  _id: v.id("conversations"),
  otherUserId: v.string(),
  otherName: v.string(),
  otherRole: v.string(),
  otherAvatar: v.optional(v.string()),
  jobTitle: v.optional(v.string()),
  lastMessageAt: v.number(),
  lastMessagePreview: v.string(),
  lastSenderId: v.optional(v.string()),
  unread: v.number(),
});

// ── Queries ───────────────────────────────────────────────────────────────────

export const listConversations = query({
  args: { userId: v.string() },
  returns: v.array(conversationSummary),
  handler: async (ctx, { userId }) => {
    const [asA, asB] = await Promise.all([
      ctx.db
        .query("conversations")
        .withIndex("by_userA_lastMessageAt", (q) => q.eq("userA", userId))
        .order("desc")
        .take(50),
      ctx.db
        .query("conversations")
        .withIndex("by_userB_lastMessageAt", (q) => q.eq("userB", userId))
        .order("desc")
        .take(50),
    ]);
    const convos = [...asA, ...asB]
      .sort((a, b) => b.lastMessageAt - a.lastMessageAt)
      .slice(0, 50);

    return await Promise.all(
      convos.map(async (c) => {
        const otherUserId = c.userA === userId ? c.userB : c.userA;
        const other = await publicProfileSummary(ctx, otherUserId);
        const job = c.jobId ? await ctx.db.get(c.jobId) : null;
        return {
          _id: c._id,
          otherUserId,
          otherName: other.name,
          otherRole: other.role,
          otherAvatar: other.avatarUrl,
          jobTitle: job ? `${job.title} · ${job.company}` : undefined,
          lastMessageAt: c.lastMessageAt,
          lastMessagePreview: c.lastMessagePreview,
          lastSenderId: c.lastSenderId,
          unread: c.userA === userId ? c.unreadA : c.unreadB,
        };
      }),
    );
  },
});

export const unreadTotal = query({
  args: { userId: v.string() },
  returns: v.number(),
  handler: async (ctx, { userId }) => {
    const [asA, asB] = await Promise.all([
      ctx.db
        .query("conversations")
        .withIndex("by_userA_lastMessageAt", (q) => q.eq("userA", userId))
        .order("desc")
        .take(100),
      ctx.db
        .query("conversations")
        .withIndex("by_userB_lastMessageAt", (q) => q.eq("userB", userId))
        .order("desc")
        .take(100),
    ]);
    return (
      asA.reduce((sum, c) => sum + c.unreadA, 0) +
      asB.reduce((sum, c) => sum + c.unreadB, 0)
    );
  },
});

export const listMessages = query({
  args: { conversationId: v.id("conversations"), userId: v.string() },
  returns: v.array(
    v.object({
      _id: v.id("directMessages"),
      _creationTime: v.number(),
      userId: v.string(),
      content: v.string(),
      imageUrl: v.optional(v.string()),
      audioUrl: v.optional(v.string()),
      audioDuration: v.optional(v.number()),
      userName: v.string(),
      userRole: v.string(),
      userAvatar: v.optional(v.string()),
    }),
  ),
  handler: async (ctx, { conversationId, userId }) => {
    const convo = await ctx.db.get(conversationId);
    if (!convo || !isParticipant(convo, userId)) return [];

    const recent = await ctx.db
      .query("directMessages")
      .withIndex("by_conversationId", (q) => q.eq("conversationId", conversationId))
      .order("desc")
      .take(200);

    const [profA, profB] = await Promise.all([
      publicProfileSummary(ctx, convo.userA),
      publicProfileSummary(ctx, convo.userB),
    ]);

    return await Promise.all(
      recent.reverse().map(async (m) => {
        const prof = m.senderId === convo.userA ? profA : profB;
        return {
          _id: m._id,
          _creationTime: m._creationTime,
          userId: m.senderId,
          content: m.content,
          imageUrl: m.imageStorageId
            ? ((await ctx.storage.getUrl(m.imageStorageId)) ?? undefined)
            : undefined,
          audioUrl: m.audioStorageId
            ? ((await ctx.storage.getUrl(m.audioStorageId)) ?? undefined)
            : undefined,
          audioDuration: m.audioDuration,
          userName: prof.name,
          userRole: prof.role,
          userAvatar: prof.avatarUrl,
        };
      }),
    );
  },
});

// ── Mutations ─────────────────────────────────────────────────────────────────

export const startConversation = mutation({
  args: {
    userId: v.string(),
    otherUserId: v.string(),
    jobId: v.optional(v.id("jobs")),
  },
  returns: v.id("conversations"),
  handler: async (ctx, { userId, otherUserId, jobId }) => {
    const other = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", otherUserId))
      .unique();
    if (!other) throw new ConvexError("User not found");
    return await getOrCreateConversation(ctx, userId, otherUserId, jobId);
  },
});

export const send = mutation({
  args: {
    conversationId: v.id("conversations"),
    senderId: v.string(),
    content: v.string(),
    imageStorageId: v.optional(v.id("_storage")),
    audioStorageId: v.optional(v.id("_storage")),
    audioDuration: v.optional(v.number()),
  },
  returns: v.id("directMessages"),
  handler: async (ctx, { conversationId, senderId, ...message }) => {
    return await postDirectMessage(ctx, conversationId, senderId, message);
  },
});

export const markRead = mutation({
  args: { conversationId: v.id("conversations"), userId: v.string() },
  returns: v.null(),
  handler: async (ctx, { conversationId, userId }) => {
    const convo = await ctx.db.get(conversationId);
    if (!convo || !isParticipant(convo, userId)) return null;
    if (convo.userA === userId && convo.unreadA > 0) {
      await ctx.db.patch(conversationId, { unreadA: 0 });
    } else if (convo.userB === userId && convo.unreadB > 0) {
      await ctx.db.patch(conversationId, { unreadB: 0 });
    }
    return null;
  },
});
