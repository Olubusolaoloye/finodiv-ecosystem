import { ConvexError } from "convex/values";
import type { MutationCtx } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";

export const MAX_MESSAGE_LENGTH = 4000;

export function orderPair(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

export function isParticipant(convo: Doc<"conversations">, userId: string) {
  return convo.userA === userId || convo.userB === userId;
}

export async function getOrCreateConversation(
  ctx: MutationCtx,
  userId: string,
  otherUserId: string,
  jobId?: Id<"jobs">,
): Promise<Id<"conversations">> {
  if (userId === otherUserId) throw new ConvexError("You can't message yourself");
  const [userA, userB] = orderPair(userId, otherUserId);
  const existing = await ctx.db
    .query("conversations")
    .withIndex("by_pair", (q) => q.eq("userA", userA).eq("userB", userB))
    .unique();
  if (existing) {
    if (jobId && !existing.jobId) await ctx.db.patch(existing._id, { jobId });
    return existing._id;
  }
  return await ctx.db.insert("conversations", {
    userA,
    userB,
    jobId,
    lastMessageAt: Date.now(),
    lastMessagePreview: "",
    unreadA: 0,
    unreadB: 0,
  });
}

export async function postDirectMessage(
  ctx: MutationCtx,
  conversationId: Id<"conversations">,
  senderId: string,
  message: {
    content: string;
    imageStorageId?: Id<"_storage">;
    audioStorageId?: Id<"_storage">;
    audioDuration?: number;
  },
) {
  const convo = await ctx.db.get(conversationId);
  if (!convo || !isParticipant(convo, senderId)) {
    throw new ConvexError("Conversation not found");
  }
  const content = message.content.trim().slice(0, MAX_MESSAGE_LENGTH);
  if (!content && !message.imageStorageId && !message.audioStorageId) {
    throw new ConvexError("Message is empty");
  }

  const id = await ctx.db.insert("directMessages", {
    conversationId,
    senderId,
    content,
    imageStorageId: message.imageStorageId,
    audioStorageId: message.audioStorageId,
    audioDuration: message.audioDuration,
  });

  const preview = content
    ? content.slice(0, 120)
    : message.audioStorageId
      ? "Voice note"
      : "Image";
  const senderIsA = convo.userA === senderId;
  await ctx.db.patch(conversationId, {
    lastMessageAt: Date.now(),
    lastMessagePreview: preview,
    lastSenderId: senderId,
    ...(senderIsA
      ? { unreadB: convo.unreadB + 1 }
      : { unreadA: convo.unreadA + 1 }),
  });
  return id;
}
