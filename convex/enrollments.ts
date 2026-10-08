import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalMutation, mutation, query } from "./_generated/server";

// ── Queries ───────────────────────────────────────────────────────────────────

export const getForUser = query({
  args: { userId: v.string() },
  returns: v.array(
    v.object({
      _id: v.id("enrollments"),
      _creationTime: v.number(),
      userId: v.string(),
      courseId: v.id("courses"),
      progress: v.number(),
      completedLessonIds: v.array(v.string()),
      enrolledAt: v.number(),
      completedAt: v.optional(v.number()),
    }),
  ),
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("enrollments")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const getForCourse = query({
  args: { courseId: v.id("courses") },
  returns: v.array(
    v.object({
      _id: v.id("enrollments"),
      _creationTime: v.number(),
      userId: v.string(),
      courseId: v.id("courses"),
      progress: v.number(),
      completedLessonIds: v.array(v.string()),
      enrolledAt: v.number(),
      completedAt: v.optional(v.number()),
    }),
  ),
  handler: async (ctx, { courseId }) => {
    return await ctx.db
      .query("enrollments")
      .withIndex("by_courseId", (q) => q.eq("courseId", courseId))
      .collect();
  },
});

export const getEnrollment = query({
  args: { userId: v.string(), courseId: v.id("courses") },
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id("enrollments"),
      _creationTime: v.number(),
      userId: v.string(),
      courseId: v.id("courses"),
      progress: v.number(),
      completedLessonIds: v.array(v.string()),
      enrolledAt: v.number(),
      completedAt: v.optional(v.number()),
    }),
  ),
  handler: async (ctx, { userId, courseId }) => {
    return await ctx.db
      .query("enrollments")
      .withIndex("by_userId_courseId", (q) =>
        q.eq("userId", userId).eq("courseId", courseId),
      )
      .unique();
  },
});

// ── Mutations ─────────────────────────────────────────────────────────────────

export const enroll = mutation({
  args: { userId: v.string(), courseId: v.id("courses") },
  returns: v.id("enrollments"),
  handler: async (ctx, { userId, courseId }) => {
    const existing = await ctx.db
      .query("enrollments")
      .withIndex("by_userId_courseId", (q) =>
        q.eq("userId", userId).eq("courseId", courseId),
      )
      .unique();
    if (existing) return existing._id;

    const id = await ctx.db.insert("enrollments", {
      userId,
      courseId,
      progress: 0,
      completedLessonIds: [],
      enrolledAt: Date.now(),
    });

    const course = await ctx.db.get(courseId);
    if (course) {
      await ctx.db.patch(courseId, {
        enrolledCount: course.enrolledCount + 1,
      });
    }

    return id;
  },
});

export const completeLesson = mutation({
  args: {
    userId: v.string(),
    courseId: v.id("courses"),
    lessonId: v.id("lessons"),
  },
  returns: v.null(),
  handler: async (ctx, { userId, courseId, lessonId }) => {
    const enrollment = await ctx.db
      .query("enrollments")
      .withIndex("by_userId_courseId", (q) =>
        q.eq("userId", userId).eq("courseId", courseId),
      )
      .unique();
    if (!enrollment) throw new Error("Not enrolled");

    const lessonIdStr = lessonId as string;
    if (enrollment.completedLessonIds.includes(lessonIdStr)) return null;

    const lesson = await ctx.db.get(lessonId);
    const allLessons = await ctx.db
      .query("lessons")
      .withIndex("by_courseId", (q) => q.eq("courseId", courseId))
      .collect();

    const newCompleted = [...enrollment.completedLessonIds, lessonIdStr];
    const progress =
      allLessons.length > 0
        ? Math.round((newCompleted.length / allLessons.length) * 100)
        : 0;

    const completedAt =
      progress >= 100 ? Date.now() : enrollment.completedAt;

    await ctx.db.patch(enrollment._id, {
      completedLessonIds: newCompleted,
      progress,
      completedAt,
    });

    if (lesson && lesson.xpReward > 0) {
      await ctx.runMutation(internal.profiles.addXp, {
        userId,
        amount: lesson.xpReward,
        reason: `Completed lesson: ${lesson.title}`,
        courseId,
      });
    }

    return null;
  },
});

export const internalMarkComplete = internalMutation({
  args: { enrollmentId: v.id("enrollments") },
  returns: v.null(),
  handler: async (ctx, { enrollmentId }) => {
    await ctx.db.patch(enrollmentId, {
      progress: 100,
      completedAt: Date.now(),
    });
    return null;
  },
});
