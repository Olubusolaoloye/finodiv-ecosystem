"use node";
import { v } from "convex/values";
import { action } from "./_generated/server";
import { api, internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { createHash, randomBytes, randomUUID } from "node:crypto";

function hashPassword(password: string, salt: string): string {
  return createHash("sha256").update(salt + ":" + password).digest("hex");
}

export const signUp = action({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.string(),
    role: v.union(
      v.literal("LEARNER"),
      v.literal("EDUCATOR"),
      v.literal("EMPLOYER"),
    ),
  },
  returns: v.object({
    userId: v.optional(v.string()),
    error: v.optional(v.string()),
  }),
  handler: async (ctx, { email, password, name, role }) => {
    const emailLower = email.trim().toLowerCase();

    const existing = await ctx.runQuery(internal.authAccounts.getByEmail, {
      email: emailLower,
    });
    if (existing) {
      return { error: "An account with this email already exists. Sign in instead." };
    }

    const salt = randomBytes(16).toString("hex");
    const hash = hashPassword(password, salt);
    const userId = randomUUID();

    await ctx.runMutation(internal.authAccounts.create, {
      email: emailLower,
      passwordHash: salt + ":" + hash,
      userId,
    });

    await ctx.runMutation(api.profiles.upsert, {
      userId,
      name: name.trim(),
      email: emailLower,
      role,
    });

    return { userId };
  },
});

export const signIn = action({
  args: {
    email: v.string(),
    password: v.string(),
  },
  returns: v.object({
    userId: v.optional(v.string()),
    email: v.optional(v.string()),
    error: v.optional(v.string()),
  }),
  handler: async (
    ctx,
    { email, password }: { email: string; password: string },
  ): Promise<{ userId?: string; email?: string; error?: string }> => {
    const emailLower = email.trim().toLowerCase();

    const account: {
      _id: string;
      email: string;
      passwordHash: string;
      userId: string;
    } | null = await ctx.runQuery(internal.authAccounts.getByEmail, {
      email: emailLower,
    });
    if (!account) {
      return { error: "Incorrect email or password." };
    }

    const [salt, storedHash] = account.passwordHash.split(":");
    const hash = hashPassword(password, salt);

    if (hash !== storedHash) {
      return { error: "Incorrect email or password." };
    }

    return { userId: account.userId, email: emailLower };
  },
});

export const changePassword = action({
  args: {
    userId: v.string(),
    currentPassword: v.string(),
    newPassword: v.string(),
  },
  returns: v.object({ ok: v.boolean(), error: v.optional(v.string()) }),
  handler: async (
    ctx,
    { userId, currentPassword, newPassword },
  ): Promise<{ ok: boolean; error?: string }> => {
    if (newPassword.length < 8) {
      return { ok: false, error: "New password must be at least 8 characters." };
    }
    if (newPassword === currentPassword) {
      return { ok: false, error: "New password must be different from the current one." };
    }

    const account: {
      _id: Id<"authAccounts">;
      passwordHash: string;
    } | null = await ctx.runQuery(internal.authAccounts.getByUserId, { userId });
    if (!account) {
      return { ok: false, error: "This account has no password set." };
    }

    const [salt, storedHash] = account.passwordHash.split(":");
    if (hashPassword(currentPassword, salt) !== storedHash) {
      return { ok: false, error: "Current password is incorrect." };
    }

    const newSalt = randomBytes(16).toString("hex");
    await ctx.runMutation(internal.authAccounts.updatePasswordHash, {
      accountId: account._id,
      passwordHash: newSalt + ":" + hashPassword(newPassword, newSalt),
    });
    return { ok: true };
  },
});
