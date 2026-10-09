import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { getProfile, withAvatarUrl } from "./lib/profileHelpers";

async function canManageCourse(ctx: QueryCtx, courseId: Id<"courses">, userId: string) {
  const course = await ctx.db.get(courseId);
  if (!course) return null;
  if (course.instructorId === userId) return course;
  const profile = await getProfile(ctx, userId);
  return profile?.role === "ADMIN" ? course : null;
}

const statusValidator = v.union(
  v.literal("SUBMITTED"),
  v.literal("GRADED"),
  v.literal("RETURNED"),
);

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
    if (!(await canManageCourse(ctx, args.courseId, args.createdBy))) {
      throw new ConvexError("Only the course instructor can add assignments");
    }
    const title = args.title.trim().slice(0, 160);
    if (!title) throw new ConvexError("Assignment title is required");
    if (!Number.isFinite(args.maxGrade) || args.maxGrade < 1 || args.maxGrade > 1000) {
      throw new ConvexError("Max grade must be between 1 and 1000");
    }
    return await ctx.db.insert("assignments", {
      ...args,
      title,
      description: args.description.trim().slice(0, 5000),
    });
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
    const assignment = await ctx.db.get(args.assignmentId);
    if (!assignment || assignment.courseId !== args.courseId) {
      throw new ConvexError("Assignment not found");
    }
    const content = args.content.trim().slice(0, 10000);
    if (!content) throw new ConvexError("Submission is empty");

    const existing = await ctx.db
      .query("submissions")
      .withIndex("by_assignmentId_userId", (q) =>
        q.eq("assignmentId", args.assignmentId).eq("userId", args.userId),
      )
      .unique();
    if (existing) {
      if (existing.status === "GRADED") throw new ConvexError("This submission has already been graded");
      await ctx.db.patch(existing._id, { content, fileUrl: args.fileUrl, status: "SUBMITTED" });
      return existing._id;
    }
    return await ctx.db.insert("submissions", {
      ...args,
      content,
      status: "SUBMITTED",
    });
  },
});

export const grade = mutation({
  args: {
    submissionId: v.id("submissions"),
    graderId: v.string(),
    grade: v.number(),
    feedback: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, { submissionId, graderId, grade, feedback }) => {
    const submission = await ctx.db.get(submissionId);
    if (!submission) throw new ConvexError("Submission not found");
    if (!(await canManageCourse(ctx, submission.courseId, graderId))) {
      throw new ConvexError("Only the course instructor can grade");
    }
    const assignment = await ctx.db.get(submission.assignmentId);
    const max = assignment?.maxGrade ?? 100;
    if (!Number.isFinite(grade) || grade < 0 || grade > max) {
      throw new ConvexError(`Grade must be between 0 and ${max}`);
    }
    feedback = feedback?.trim().slice(0, 5000);
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

export const instructorCourses = query({
  args: { instructorId: v.string() },
  returns: v.array(
    v.object({
      _id: v.id("courses"),
      title: v.string(),
      category: v.string(),
      isPublished: v.boolean(),
      enrolledCount: v.number(),
      rating: v.optional(v.number()),
      assignmentCount: v.number(),
      pendingCount: v.number(),
    }),
  ),
  handler: async (ctx, { instructorId }) => {
    const courses = await ctx.db
      .query("courses")
      .withIndex("by_instructorId", (q) => q.eq("instructorId", instructorId))
      .take(100);
    return await Promise.all(
      courses.map(async (c) => {
        const [assignments, pending] = await Promise.all([
          ctx.db
            .query("assignments")
            .withIndex("by_courseId", (q) => q.eq("courseId", c._id))
            .take(200),
          ctx.db
            .query("submissions")
            .withIndex("by_courseId_status", (q) =>
              q.eq("courseId", c._id).eq("status", "SUBMITTED"),
            )
            .take(1000),
        ]);
        return {
          _id: c._id,
          title: c.title,
          category: c.category,
          isPublished: c.isPublished,
          enrolledCount: c.enrolledCount,
          rating: c.rating,
          assignmentCount: assignments.length,
          pendingCount: pending.length,
        };
      }),
    );
  },
});

export const courseGradebook = query({
  args: { courseId: v.id("courses"), instructorId: v.string() },
  returns: v.union(
    v.null(),
    v.object({
      courseTitle: v.string(),
      students: v.array(
        v.object({
          userId: v.string(),
          name: v.string(),
          email: v.string(),
          avatarUrl: v.optional(v.string()),
        }),
      ),
      assignments: v.array(
        v.object({
          _id: v.id("assignments"),
          title: v.string(),
          description: v.string(),
          dueDate: v.optional(v.number()),
          maxGrade: v.number(),
          submissions: v.array(
            v.object({
              _id: v.id("submissions"),
              _creationTime: v.number(),
              userId: v.string(),
              studentName: v.string(),
              studentEmail: v.string(),
              studentAvatar: v.optional(v.string()),
              content: v.string(),
              fileUrl: v.optional(v.string()),
              grade: v.optional(v.number()),
              feedback: v.optional(v.string()),
              status: statusValidator,
            }),
          ),
        }),
      ),
    }),
  ),
  handler: async (ctx, { courseId, instructorId }) => {
    const course = await canManageCourse(ctx, courseId, instructorId);
    if (!course) return null;

    const assignments = await ctx.db
      .query("assignments")
      .withIndex("by_courseId", (q) => q.eq("courseId", courseId))
      .take(200);

    const studentCache = new Map<
      string,
      { name: string; email: string; avatarUrl?: string }
    >();
    const student = async (userId: string) => {
      const cached = studentCache.get(userId);
      if (cached) return cached;
      const profile = await getProfile(ctx, userId);
      const resolved = profile ? await withAvatarUrl(ctx, profile) : null;
      const info = {
        name: resolved?.name ?? "Student",
        email: resolved?.email ?? "",
        avatarUrl: resolved?.avatarUrl,
      };
      studentCache.set(userId, info);
      return info;
    };

    const enrollments = await ctx.db
      .query("enrollments")
      .withIndex("by_courseId", (q) => q.eq("courseId", courseId))
      .take(1000);

    const assignmentRows = await Promise.all(
        assignments.map(async (a) => {
          const subs = await ctx.db
            .query("submissions")
            .withIndex("by_assignmentId", (q) => q.eq("assignmentId", a._id))
            .take(1000);
          return {
            _id: a._id,
            title: a.title,
            description: a.description,
            dueDate: a.dueDate,
            maxGrade: a.maxGrade,
            submissions: await Promise.all(
              subs.map(async (s) => {
                const info = await student(s.userId);
                return {
                  _id: s._id,
                  _creationTime: s._creationTime,
                  userId: s.userId,
                  studentName: info.name,
                  studentEmail: info.email,
                  studentAvatar: info.avatarUrl,
                  content: s.content,
                  fileUrl: s.fileUrl,
                  grade: s.grade,
                  feedback: s.feedback,
                  status: s.status,
                };
              }),
            ),
          };
        }),
    );

    const studentIds = new Set<string>(enrollments.map((e) => e.userId));
    assignmentRows.forEach((a) => a.submissions.forEach((s) => studentIds.add(s.userId)));
    const students = await Promise.all(
      [...studentIds].map(async (userId) => ({ userId, ...(await student(userId)) })),
    );
    students.sort((a, b) => a.name.localeCompare(b.name));

    return { courseTitle: course.title, students, assignments: assignmentRows };
  },
});
