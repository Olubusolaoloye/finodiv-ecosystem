import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";

const settingsFields = {
  _id: v.id("systemSettings"),
  _creationTime: v.number(),
  key: v.literal("global"),
  maintenanceMode: v.boolean(),
  allowSignups: v.boolean(),
  allowLogins: v.boolean(),
  siteName: v.string(),
  supportEmail: v.string(),
  announcement: v.optional(v.string()),
};

export const get = query({
  args: {},
  returns: v.union(v.null(), v.object(settingsFields)),
  handler: async (ctx) => {
    return await ctx.db
      .query("systemSettings")
      .withIndex("by_key", (q) => q.eq("key", "global"))
      .unique();
  },
});

export const upsert = internalMutation({
  args: {
    maintenanceMode: v.optional(v.boolean()),
    allowSignups: v.optional(v.boolean()),
    allowLogins: v.optional(v.boolean()),
    siteName: v.optional(v.string()),
    supportEmail: v.optional(v.string()),
    announcement: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("systemSettings")
      .withIndex("by_key", (q) => q.eq("key", "global"))
      .unique();

    if (existing) {
      const patch = Object.fromEntries(
        Object.entries(args).filter(([, v]) => v !== undefined),
      );
      await ctx.db.patch(existing._id, patch);
    } else {
      await ctx.db.insert("systemSettings", {
        key: "global",
        maintenanceMode: args.maintenanceMode ?? false,
        allowSignups: args.allowSignups ?? true,
        allowLogins: args.allowLogins ?? true,
        siteName: args.siteName ?? "FINODIV",
        supportEmail: args.supportEmail ?? "support@finodiv.com",
        announcement: args.announcement,
      });
    }
    return null;
  },
});
