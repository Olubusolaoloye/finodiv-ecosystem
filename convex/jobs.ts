import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getOrCreateConversation, postDirectMessage } from "./lib/conversations";
import { getProfile, publicProfileSummary } from "./lib/profileHelpers";

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
    postedBy: v.string(),
    deadline: v.optional(v.number()),
  },
  returns: v.id("jobs"),
  handler: async (ctx, args) => {
    const poster = await getProfile(ctx, args.postedBy);
    if (!poster || (poster.role !== "EMPLOYER" && poster.role !== "ADMIN")) {
      throw new ConvexError("Only employers can post jobs");
    }
    if (!args.title.trim() || !args.company.trim() || !args.description.trim()) {
      throw new ConvexError("Title, company and description are required");
    }
    return await ctx.db.insert("jobs", {
      ...args,
      title: args.title.trim().slice(0, 120),
      company: args.company.trim().slice(0, 120),
      location: args.location.trim().slice(0, 120),
      description: args.description.trim().slice(0, 5000),
      skills: args.skills.map((s) => s.trim()).filter(Boolean).slice(0, 12),
      isActive: true,
    });
  },
});

export const closeJob = mutation({
  args: { id: v.id("jobs"), postedBy: v.string() },
  returns: v.null(),
  handler: async (ctx, { id, postedBy }) => {
    const job = await ctx.db.get(id);
    if (!job) throw new ConvexError("Job not found");
    if (job.postedBy !== postedBy) throw new ConvexError("Not the job owner");
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

    const job = await ctx.db.get(args.jobId);
    if (!job || !job.isActive) throw new ConvexError("This job is no longer open");

    const applicationId = await ctx.db.insert("jobApplications", {
      ...args,
      status: "pending",
    });

    if (job.postedBy && job.postedBy !== args.userId) {
      const conversationId = await getOrCreateConversation(
        ctx,
        args.userId,
        job.postedBy,
        job._id,
      );
      const letter = args.coverLetter?.trim();
      await postDirectMessage(ctx, conversationId, args.userId, {
        content: `Hi! I just applied for ${job.title} at ${job.company}.` +
          (letter ? `\n\n${letter}` : ""),
      });
    }
    return applicationId;
  },
});

export const updateApplicationStatus = mutation({
  args: {
    applicationId: v.id("jobApplications"),
    employerId: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("reviewed"),
      v.literal("accepted"),
      v.literal("rejected"),
    ),
  },
  returns: v.null(),
  handler: async (ctx, { applicationId, employerId, status }) => {
    const app = await ctx.db.get(applicationId);
    if (!app) throw new ConvexError("Application not found");
    const job = await ctx.db.get(app.jobId);
    if (!job || job.postedBy !== employerId) throw new ConvexError("Not the job owner");
    await ctx.db.patch(applicationId, { status });
    return null;
  },
});

export const listMyPostings = query({
  args: { employerId: v.string() },
  returns: v.array(v.object({ ...jobFields, applicantCount: v.number() })),
  handler: async (ctx, { employerId }) => {
    const jobs = await ctx.db
      .query("jobs")
      .withIndex("by_postedBy", (q) => q.eq("postedBy", employerId))
      .order("desc")
      .take(100);
    return await Promise.all(
      jobs.map(async (job) => {
        const apps = await ctx.db
          .query("jobApplications")
          .withIndex("by_jobId", (q) => q.eq("jobId", job._id))
          .take(500);
        return { ...job, applicantCount: apps.length };
      }),
    );
  },
});

export const listApplicants = query({
  args: { jobId: v.id("jobs"), employerId: v.string() },
  returns: v.array(
    v.object({
      _id: v.id("jobApplications"),
      _creationTime: v.number(),
      userId: v.string(),
      name: v.string(),
      avatarUrl: v.optional(v.string()),
      coverLetter: v.optional(v.string()),
      status: v.union(
        v.literal("pending"),
        v.literal("reviewed"),
        v.literal("accepted"),
        v.literal("rejected"),
      ),
    }),
  ),
  handler: async (ctx, { jobId, employerId }) => {
    const job = await ctx.db.get(jobId);
    if (!job || job.postedBy !== employerId) return [];
    const apps = await ctx.db
      .query("jobApplications")
      .withIndex("by_jobId", (q) => q.eq("jobId", jobId))
      .order("desc")
      .take(200);
    return await Promise.all(
      apps.map(async (a) => {
        const prof = await publicProfileSummary(ctx, a.userId);
        return {
          _id: a._id,
          _creationTime: a._creationTime,
          userId: a.userId,
          name: prof.name,
          avatarUrl: prof.avatarUrl,
          coverLetter: a.coverLetter,
          status: a.status,
        };
      }),
    );
  },
});
