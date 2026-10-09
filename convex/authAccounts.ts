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
