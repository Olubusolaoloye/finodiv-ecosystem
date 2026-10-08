import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ── Queries ───────────────────────────────────────────────────────────────────

export const listByCourse = query({
  args: { courseId: v.id("courses") },
  returns: v.array(
    v.object({
      _id: v.id("submissions"),
      _creationTime: v.number(),
      assignmentId: v.id("assignments"),
      courseId: v.id("courses"),
      userId: v.string(),
      content: v.string(),
      fileUrl: v.optional(v.string()),
      grade: v.optional(v.number()),
      feedback: v.optional(v.string()),
      gradedAt: v.optional(v.number()),
      status: v.union(
        v.literal("SUBMITTED"),
        v.literal("GRADED"),
        v.literal("RETURNED"),
      ),
    }),
  ),
  handler: async (ctx, { courseId }) => {
    return await ctx.db
      .query("submissions")
      .withIndex("by_courseId", (q) => q.eq("courseId", courseId))
      .collect();
  },
});

export const listPendingByCourse = query({
  args: { courseId: v.id("courses") },
  returns: v.array(
    v.object({
      _id: v.id("submissions"),
      _creationTime: v.number(),
      assignmentId: v.id("assignments"),
      courseId: v.id("courses"),
      userId: v.string(),
      content: v.string(),
      fileUrl: v.optional(v.string()),
      grade: v.optional(v.number()),
      feedback: v.optional(v.string()),
      gradedAt: v.optional(v.number()),
      status: v.union(
        v.literal("SUBMITTED"),
        v.literal("GRADED"),
        v.literal("RETURNED"),
      ),
    }),
  ),
  handler: async (ctx, { courseId }) => {
    return await ctx.db
      .query("submissions")
      .withIndex("by_courseId_status", (q) =>
        q.eq("courseId", courseId).eq("status", "SUBMITTED"),
      )
      .collect();
  },
});

export const listByUser = query({
  args: { userId: v.string() },
  returns: v.array(
    v.object({
      _id: v.id("submissions"),
      _creationTime: v.number(),
      assignmentId: v.id("assignments"),
      courseId: v.id("courses"),
      userId: v.string(),
      content: v.string(),
      fileUrl: v.optional(v.string()),
      grade: v.optional(v.number()),
      feedback: v.optional(v.string()),
      gradedAt: v.optional(v.number()),
      status: v.union(
        v.literal("SUBMITTED"),
        v.literal("GRADED"),
        v.literal("RETURNED"),
      ),
    }),
  ),
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("submissions")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const listAssignmentsByCourse = query({
  args: { courseId: v.id("courses") },
  returns: v.array(
    v.object({
      _id: v.id("assignments"),
      _creationTime: v.number(),
      courseId: v.id("courses"),
      title: v.string(),
      description: v.string(),
      dueDate: v.optional(v.number()),
      maxGrade: v.number(),
      createdBy: v.string(),
    }),
  ),
  handler: async (ctx, { courseId }) => {
    return await ctx.db
      .query("assignments")
      .withIndex("by_courseId", (q) => q.eq("courseId", courseId))
      .collect();
  },
});

// ── Mutations ─────────────────────────────────────────────────────────────────

export const createAssignment = mutation({
  args: {
    courseId: v.id("courses"),
    title: v.string(),
    description: v.string(),
    dueDate: v.optional(v.number()),
    maxGrade: v.number(),
    createdBy: v.string(),
  },
  returns: v.id("assignments"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("assignments", args);
  },
});

export const submit = mutation({
  args: {
    assignmentId: v.id("assignments"),
    courseId: v.id("courses"),
    userId: v.string(),
    content: v.string(),
    fileUrl: v.optional(v.string()),
  },
  returns: v.id("submissions"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("submissions", {
      ...args,
      status: "SUBMITTED",
    });
  },
});

export const grade = mutation({
  args: {
    submissionId: v.id("submissions"),
    grade: v.number(),
    feedback: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, { submissionId, grade, feedback }) => {
    await ctx.db.patch(submissionId, {
      grade,
      feedback,
      status: "GRADED",
      gradedAt: Date.now(),
    });
    return null;
  },
});

export const returnToStudent = mutation({
  args: { submissionId: v.id("submissions") },
  returns: v.null(),
  handler: async (ctx, { submissionId }) => {
    await ctx.db.patch(submissionId, { status: "RETURNED" });
    return null;
  },
});
