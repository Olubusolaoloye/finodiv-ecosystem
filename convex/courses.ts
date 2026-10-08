import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const courseFields = {
  _id: v.id("courses"),
  _creationTime: v.number(),
  title: v.string(),
  description: v.string(),
  instructorId: v.string(),
  instructorName: v.string(),
  price: v.number(),
  category: v.string(),
  level: v.union(
    v.literal("Beginner"),
    v.literal("Intermediate"),
    v.literal("Advanced"),
  ),
  duration: v.string(),
  imageUrl: v.optional(v.string()),
  isPublished: v.boolean(),
  enrolledCount: v.number(),
  rating: v.optional(v.number()),
  niche: v.optional(v.string()),
  tags: v.optional(v.array(v.string())),
};

// ── Queries ───────────────────────────────────────────────────────────────────

export const listPublished = query({
  args: {
    category: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  returns: v.array(v.object(courseFields)),
  handler: async (ctx, { category, limit }) => {
    if (category) {
      return await ctx.db
        .query("courses")
        .withIndex("by_isPublished_category", (q) =>
          q.eq("isPublished", true).eq("category", category),
        )
        .take(limit ?? 50);
    }
    return await ctx.db
      .query("courses")
      .withIndex("by_isPublished", (q) => q.eq("isPublished", true))
      .take(limit ?? 50);
  },
});

export const getById = query({
  args: { id: v.id("courses") },
  returns: v.union(v.null(), v.object(courseFields)),
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const listByInstructor = query({
  args: { instructorId: v.string() },
  returns: v.array(v.object(courseFields)),
  handler: async (ctx, { instructorId }) => {
    return await ctx.db
      .query("courses")
      .withIndex("by_instructorId", (q) => q.eq("instructorId", instructorId))
      .collect();
  },
});

export const getLessons = query({
  args: { courseId: v.id("courses") },
  returns: v.array(
    v.object({
      _id: v.id("lessons"),
      _creationTime: v.number(),
      courseId: v.id("courses"),
      title: v.string(),
      content: v.optional(v.string()),
      videoUrl: v.optional(v.string()),
      durationMinutes: v.optional(v.number()),
      orderIndex: v.number(),
      xpReward: v.number(),
    }),
  ),
  handler: async (ctx, { courseId }) => {
    return await ctx.db
      .query("lessons")
      .withIndex("by_courseId_order", (q) => q.eq("courseId", courseId))
      .collect();
  },
});

// ── Mutations ─────────────────────────────────────────────────────────────────

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    instructorId: v.string(),
    instructorName: v.string(),
    price: v.number(),
    category: v.string(),
    level: v.union(
      v.literal("Beginner"),
      v.literal("Intermediate"),
      v.literal("Advanced"),
    ),
    duration: v.string(),
    imageUrl: v.optional(v.string()),
    niche: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  returns: v.id("courses"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("courses", {
      ...args,
      isPublished: false,
      enrolledCount: 0,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("courses"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    category: v.optional(v.string()),
    level: v.optional(
      v.union(
        v.literal("Beginner"),
        v.literal("Intermediate"),
        v.literal("Advanced"),
      ),
    ),
    duration: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    niche: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  returns: v.null(),
  handler: async (ctx, { id, ...fields }) => {
    const defined = Object.fromEntries(
      Object.entries(fields).filter(([, v]) => v !== undefined),
    );
    await ctx.db.patch(id, defined);
    return null;
  },
});

export const publish = mutation({
  args: { id: v.id("courses"), instructorId: v.string() },
  returns: v.null(),
  handler: async (ctx, { id, instructorId }) => {
    const course = await ctx.db.get(id);
    if (!course) throw new Error("Course not found");
    if (course.instructorId !== instructorId)
      throw new Error("Not the course owner");
    await ctx.db.patch(id, { isPublished: true });
    return null;
  },
});

export const addLesson = mutation({
  args: {
    courseId: v.id("courses"),
    title: v.string(),
    content: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    durationMinutes: v.optional(v.number()),
    orderIndex: v.number(),
    xpReward: v.number(),
  },
  returns: v.id("lessons"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("lessons", args);
  },
});
