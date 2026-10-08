import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const jobFields = {
  _id: v.id("jobs"),
  _creationTime: v.number(),
  title: v.string(),
  company: v.string(),
  location: v.string(),
  type: v.union(
    v.literal("remote"),
    v.literal("hybrid"),
    v.literal("onsite"),
  ),
  salaryRange: v.optional(v.string()),
  description: v.string(),
  skills: v.array(v.string()),
  isActive: v.boolean(),
  postedBy: v.optional(v.string()),
  deadline: v.optional(v.number()),
};

// ── Queries ───────────────────────────────────────────────────────────────────

export const listActive = query({
  args: { limit: v.optional(v.number()) },
  returns: v.array(v.object(jobFields)),
  handler: async (ctx, { limit }) => {
    return await ctx.db
      .query("jobs")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .take(limit ?? 50);
  },
});

export const getById = query({
  args: { id: v.id("jobs") },
  returns: v.union(v.null(), v.object(jobFields)),
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const listByEmployer = query({
  args: { postedBy: v.string() },
  returns: v.array(v.object(jobFields)),
  handler: async (ctx, { postedBy }) => {
    return await ctx.db
      .query("jobs")
      .withIndex("by_postedBy", (q) => q.eq("postedBy", postedBy))
      .collect();
  },
});

export const getApplicationsForJob = query({
  args: { jobId: v.id("jobs") },
  returns: v.array(
    v.object({
      _id: v.id("jobApplications"),
      _creationTime: v.number(),
      jobId: v.id("jobs"),
      userId: v.string(),
      coverLetter: v.optional(v.string()),
      resumeUrl: v.optional(v.string()),
      status: v.union(
        v.literal("pending"),
        v.literal("reviewed"),
        v.literal("accepted"),
        v.literal("rejected"),
      ),
    }),
  ),
  handler: async (ctx, { jobId }) => {
    return await ctx.db
      .query("jobApplications")
      .withIndex("by_jobId", (q) => q.eq("jobId", jobId))
      .collect();
  },
});

export const getApplicationsForUser = query({
  args: { userId: v.string() },
  returns: v.array(
    v.object({
      _id: v.id("jobApplications"),
      _creationTime: v.number(),
      jobId: v.id("jobs"),
      userId: v.string(),
      coverLetter: v.optional(v.string()),
      resumeUrl: v.optional(v.string()),
      status: v.union(
        v.literal("pending"),
        v.literal("reviewed"),
        v.literal("accepted"),
        v.literal("rejected"),
      ),
    }),
  ),
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("jobApplications")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
  },
});

// ── Mutations ─────────────────────────────────────────────────────────────────

export const createJob = mutation({
  args: {
    title: v.string(),
    company: v.string(),
    location: v.string(),
    type: v.union(
      v.literal("remote"),
      v.literal("hybrid"),
      v.literal("onsite"),
    ),
    salaryRange: v.optional(v.string()),
    description: v.string(),
    skills: v.array(v.string()),
    postedBy: v.optional(v.string()),
    deadline: v.optional(v.number()),
  },
  returns: v.id("jobs"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("jobs", { ...args, isActive: true });
  },
});

export const closeJob = mutation({
  args: { id: v.id("jobs"), postedBy: v.string() },
  returns: v.null(),
  handler: async (ctx, { id, postedBy }) => {
    const job = await ctx.db.get(id);
    if (!job) throw new Error("Job not found");
    if (job.postedBy !== postedBy) throw new Error("Not the job owner");
    await ctx.db.patch(id, { isActive: false });
    return null;
  },
});

export const applyToJob = mutation({
  args: {
    jobId: v.id("jobs"),
    userId: v.string(),
    coverLetter: v.optional(v.string()),
    resumeUrl: v.optional(v.string()),
  },
  returns: v.id("jobApplications"),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("jobApplications")
      .withIndex("by_jobId_userId", (q) =>
        q.eq("jobId", args.jobId).eq("userId", args.userId),
      )
      .unique();
    if (existing) return existing._id;

    return await ctx.db.insert("jobApplications", {
      ...args,
      status: "pending",
    });
  },
});

export const updateApplicationStatus = mutation({
  args: {
    applicationId: v.id("jobApplications"),
    status: v.union(
      v.literal("pending"),
      v.literal("reviewed"),
      v.literal("accepted"),
      v.literal("rejected"),
    ),
  },
  returns: v.null(),
  handler: async (ctx, { applicationId, status }) => {
    await ctx.db.patch(applicationId, { status });
    return null;
  },
});
