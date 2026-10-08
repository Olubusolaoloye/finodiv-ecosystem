import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ── User profiles ──────────────────────────────────────────────────────────
  profiles: defineTable({
    // Links to Convex Auth identity (or a Supabase uid stored as a string)
    userId: v.string(),
    name: v.string(),
    email: v.string(),
    role: v.union(
      v.literal("GUEST"),
      v.literal("LEARNER"),
      v.literal("EMPLOYER"),
      v.literal("EDUCATOR"),
      v.literal("ADMIN"),
      v.literal("MOD"),
    ),
    avatarUrl: v.optional(v.string()),
    walletAddress: v.optional(v.string()),
    bio: v.optional(v.string()),
    xp: v.number(),
    badge: v.optional(v.string()),
    status: v.union(
      v.literal("active"),
      v.literal("banned"),
      v.literal("suspended"),
    ),
  })
    .index("by_userId", ["userId"])
    .index("by_email", ["email"])
    .index("by_role", ["role"])
    .index("by_xp", ["xp"]),

  // ── Courses ────────────────────────────────────────────────────────────────
  courses: defineTable({
    title: v.string(),
    description: v.string(),
    instructorId: v.string(),          // userId of educator
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
  })
    .index("by_instructorId", ["instructorId"])
    .index("by_category", ["category"])
    .index("by_isPublished", ["isPublished"])
    .index("by_isPublished_category", ["isPublished", "category"]),

  // ── Course lessons ─────────────────────────────────────────────────────────
  lessons: defineTable({
    courseId: v.id("courses"),
    title: v.string(),
    content: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    durationMinutes: v.optional(v.number()),
    orderIndex: v.number(),
    xpReward: v.number(),
  })
    .index("by_courseId", ["courseId"])
    .index("by_courseId_order", ["courseId", "orderIndex"]),

  // ── Enrollments ────────────────────────────────────────────────────────────
  enrollments: defineTable({
    userId: v.string(),
    courseId: v.id("courses"),
    progress: v.number(),              // 0–100
    completedLessonIds: v.array(v.string()),
    enrolledAt: v.number(),            // ms timestamp
    completedAt: v.optional(v.number()),
  })
    .index("by_userId", ["userId"])
    .index("by_courseId", ["courseId"])
    .index("by_userId_courseId", ["userId", "courseId"]),

  // ── Payments ───────────────────────────────────────────────────────────────
  payments: defineTable({
    userId: v.string(),
    courseId: v.id("courses"),
    amount: v.number(),
    method: v.union(v.literal("crypto_usdt"), v.literal("fiat_paystack")),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("failed"),
    ),
    txHash: v.optional(v.string()),
    reference: v.optional(v.string()),
  })
    .index("by_userId", ["userId"])
    .index("by_courseId", ["courseId"])
    .index("by_userId_courseId", ["userId", "courseId"])
    .index("by_status", ["status"]),

  // ── Certificates ───────────────────────────────────────────────────────────
  certificates: defineTable({
    userId: v.string(),
    courseId: v.id("courses"),
    walletAddress: v.optional(v.string()),
    tokenId: v.optional(v.string()),
    txHash: v.optional(v.string()),
    status: v.union(
      v.literal("unclaimed"),
      v.literal("minting"),
      v.literal("minted"),
    ),
    issuedAt: v.optional(v.number()),
  })
    .index("by_userId", ["userId"])
    .index("by_courseId", ["courseId"])
    .index("by_userId_courseId", ["userId", "courseId"])
    .index("by_status", ["status"]),

  // ── Chat rooms ─────────────────────────────────────────────────────────────
  chatRooms: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    iconColor: v.string(),
    isActive: v.boolean(),
    createdBy: v.optional(v.string()),
  })
    .index("by_slug", ["slug"])
    .index("by_isActive", ["isActive"]),

  // ── Room memberships ───────────────────────────────────────────────────────
  roomMemberships: defineTable({
    roomId: v.id("chatRooms"),
    userId: v.string(),
  })
    .index("by_roomId", ["roomId"])
    .index("by_userId", ["userId"])
    .index("by_roomId_userId", ["roomId", "userId"]),

  // ── Community messages ─────────────────────────────────────────────────────
  communityMessages: defineTable({
    roomId: v.id("chatRooms"),
    userId: v.string(),
    content: v.string(),
    imageStorageId: v.optional(v.id("_storage")),
    isPinned: v.boolean(),
  })
    .index("by_roomId", ["roomId"])
    .index("by_userId", ["userId"])
    .index("by_roomId_pinned", ["roomId", "isPinned"]),

  // ── Jobs ───────────────────────────────────────────────────────────────────
  jobs: defineTable({
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
  })
    .index("by_isActive", ["isActive"])
    .index("by_postedBy", ["postedBy"])
    .index("by_type", ["type"]),

  // ── Job applications ───────────────────────────────────────────────────────
  jobApplications: defineTable({
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
  })
    .index("by_jobId", ["jobId"])
    .index("by_userId", ["userId"])
    .index("by_jobId_userId", ["jobId", "userId"])
    .index("by_status", ["status"]),

  // ── Assignments ────────────────────────────────────────────────────────────
  assignments: defineTable({
    courseId: v.id("courses"),
    title: v.string(),
    description: v.string(),
    dueDate: v.optional(v.number()),
    maxGrade: v.number(),
    createdBy: v.string(),
  })
    .index("by_courseId", ["courseId"]),

  // ── Submissions ────────────────────────────────────────────────────────────
  submissions: defineTable({
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
  })
    .index("by_courseId", ["courseId"])
    .index("by_userId", ["userId"])
    .index("by_assignmentId", ["assignmentId"])
    .index("by_courseId_status", ["courseId", "status"]),

  // ── XP events ─────────────────────────────────────────────────────────────
  xpEvents: defineTable({
    userId: v.string(),
    amount: v.number(),
    reason: v.string(),
    courseId: v.optional(v.id("courses")),
  })
    .index("by_userId", ["userId"]),

  // ── System settings (singleton — always upsert by key "global") ───────────
  systemSettings: defineTable({
    key: v.literal("global"),
    maintenanceMode: v.boolean(),
    allowSignups: v.boolean(),
    allowLogins: v.boolean(),
    siteName: v.string(),
    supportEmail: v.string(),
    announcement: v.optional(v.string()),
  })
    .index("by_key", ["key"]),
});
