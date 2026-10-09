import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";

export const getByEmail = internalQuery({
  args: { email: v.string() },
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id("authAccounts"),
      _creationTime: v.number(),
      email: v.string(),
      passwordHash: v.string(),
      userId: v.string(),
    }),
  ),
  handler: async (ctx, { email }) => {
    return await ctx.db
      .query("authAccounts")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
  },
});

export const create = internalMutation({
  args: {
    email: v.string(),
    passwordHash: v.string(),
    userId: v.string(),
  },
  returns: v.id("authAccounts"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("authAccounts", args);
  },
});

export const getByUserId = internalQuery({
  args: { userId: v.string() },
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id("authAccounts"),
      _creationTime: v.number(),
      email: v.string(),
      passwordHash: v.string(),
      userId: v.string(),
    }),
  ),
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("authAccounts")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
  },
});

export const updatePasswordHash = internalMutation({
  args: { accountId: v.id("authAccounts"), passwordHash: v.string() },
  returns: v.null(),
  handler: async (ctx, { accountId, passwordHash }) => {
    await ctx.db.patch(accountId, { passwordHash });
    return null;
  },
});
