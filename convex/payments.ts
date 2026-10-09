import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const paymentFields = {
  _id: v.id("payments"),
  _creationTime: v.number(),
  userId: v.string(),
  courseId: v.id("courses"),
  amount: v.number(),
  method: v.union(v.literal("crypto_usdt"), v.literal("fiat_paystack")),
  status: v.union(
    v.literal("pending"),
    v.literal("confirmed"),
    v.literal("failed"),
  ),
  txHash: v.optional(v.string()),
  reference: v.optional(v.string()),
};

// ── Queries ───────────────────────────────────────────────────────────────────

export const getByUserCourse = query({
  args: { userId: v.string(), courseId: v.id("courses") },
  returns: v.union(v.null(), v.object(paymentFields)),
  handler: async (ctx, { userId, courseId }) => {
    return await ctx.db
      .query("payments")
      .withIndex("by_userId_courseId", (q) =>
        q.eq("userId", userId).eq("courseId", courseId),
      )
      .filter((q) => q.eq(q.field("status"), "confirmed"))
      .first();
  },
});

export const getByUser = query({
  args: { userId: v.string() },
  returns: v.array(v.object(paymentFields)),
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("payments")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
  },
});

// ── Mutations ─────────────────────────────────────────────────────────────────

export const create = mutation({
  args: {
    userId: v.string(),
    courseId: v.id("courses"),
    amount: v.number(),
    method: v.union(v.literal("crypto_usdt"), v.literal("fiat_paystack")),
    reference: v.optional(v.string()),
  },
  returns: v.id("payments"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("payments", {
      ...args,
      status: "pending",
    });
  },
});

export const confirm = mutation({
  args: {
    paymentId: v.id("payments"),
    txHash: v.optional(v.string()),
    reference: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, { paymentId, txHash, reference }) => {
    const patch: Record<string, unknown> = { status: "confirmed" };
    if (txHash !== undefined) patch.txHash = txHash;
    if (reference !== undefined) patch.reference = reference;
    await ctx.db.patch(paymentId, patch as any);
    return null;
  },
});
