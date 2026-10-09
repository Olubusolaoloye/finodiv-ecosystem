import type { QueryCtx } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";

export async function getProfile(ctx: QueryCtx, userId: string) {
  return await ctx.db
    .query("profiles")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .unique();
}

export async function withAvatarUrl(
  ctx: QueryCtx,
  profile: Doc<"profiles">,
): Promise<Doc<"profiles">> {
  if (!profile.avatarStorageId) return profile;
  const url = await ctx.storage.getUrl(profile.avatarStorageId);
  return url ? { ...profile, avatarUrl: url } : profile;
}

export async function publicProfileSummary(ctx: QueryCtx, userId: string) {
  const profile = await getProfile(ctx, userId);
  if (!profile) return { name: "User", role: "LEARNER", avatarUrl: undefined };
  const resolved = await withAvatarUrl(ctx, profile);
  return {
    name: resolved.name,
    role: resolved.role as string,
    avatarUrl: resolved.avatarUrl,
  };
}
