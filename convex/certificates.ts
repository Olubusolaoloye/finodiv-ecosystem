import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";

const certFields = {
  _id: v.id("certificates"),
  _creationTime: v.number(),
  userId: v.string(),
  courseId: v.id("courses"),
  walletAddress: v.optional(v.string()),
  tokenId: v.optional(v.string()),
  txHash: v.optional(v.string()),
  status: v.union(
    v.literal("unclaimed"),
    v.literal("minting"),
    v.literal("minted"),
  ),
  issuedAt: v.optional(v.number()),
};

// ── Queries ───────────────────────────────────────────────────────────────────

export const getForUser = query({
  args: { userId: v.string() },
  returns: v.array(v.object(certFields)),
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("certificates")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const getForUserCourse = query({
  args: { userId: v.string(), courseId: v.id("courses") },
  returns: v.union(v.null(), v.object(certFields)),
  handler: async (ctx, { userId, courseId }) => {
    return await ctx.db
      .query("certificates")
      .withIndex("by_userId_courseId", (q) =>
        q.eq("userId", userId).eq("courseId", courseId),
      )
      .unique();
  },
});

// ── Mutations ─────────────────────────────────────────────────────────────────

export const issue = internalMutation({
  args: { userId: v.string(), courseId: v.id("courses") },
  returns: v.id("certificates"),
  handler: async (ctx, { userId, courseId }) => {
    const existing = await ctx.db
      .query("certificates")
      .withIndex("by_userId_courseId", (q) =>
        q.eq("userId", userId).eq("courseId", courseId),
      )
      .unique();
    if (existing) return existing._id;

    return await ctx.db.insert("certificates", {
      userId,
      courseId,
      status: "unclaimed",
      issuedAt: Date.now(),
    });
  },
});

export const startMinting = mutation({
  args: {
    certificateId: v.id("certificates"),
    walletAddress: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, { certificateId, walletAddress }) => {
    await ctx.db.patch(certificateId, {
      status: "minting",
      walletAddress,
    });
    return null;
  },
});

export const confirmMinted = internalMutation({
  args: {
    certificateId: v.id("certificates"),
    tokenId: v.string(),
    txHash: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, { certificateId, tokenId, txHash }) => {
    await ctx.db.patch(certificateId, {
      status: "minted",
      tokenId,
      txHash,
    });
    return null;
  },
});
