import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser } from "./users";

export const getQueue = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;
    // Allow any authenticated user for demo; in production would check role
    return await ctx.db
      .query("doctorQueue")
      .withIndex("by_status", (q) => q.eq("status", "waiting"))
      .collect();
  },
});

export const getQueueByStatus = query({
  args: { status: v.union(v.literal("waiting"), v.literal("in-consultation"), v.literal("completed")) },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;
    return await ctx.db
      .query("doctorQueue")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
  },
});

export const getEnrichedQueue = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;
    const queueItems = await ctx.db
      .query("doctorQueue")
      .withIndex("by_status", (q) => q.eq("status", "waiting"))
      .collect();
    const enriched = await Promise.all(queueItems.map(async (item) => {
      const patient = await ctx.db.get(item.patientId);
      const caseSheet = await ctx.db.get(item.caseSheetId);
      const chiefComplaint = caseSheet?.data?.patientReported?.chiefComplaint || "No complaint";
      return {
        ...item,
        patientName: patient?.name || "Unknown",
        patientAge: patient?.age || 0,
        patientGender: patient?.gender || "Unknown",
        chiefComplaint,
      };
    }));
    return enriched;
  },
});

export const enqueueCaseSheet = mutation({
  args: {
    caseSheetId: v.id("caseSheets"),
    patientId: v.id("patients"),
    priority: v.union(v.literal("urgent"), v.literal("priority"), v.literal("routine")),
    status: v.optional(v.union(v.literal("waiting"), v.literal("in-consultation"), v.literal("completed"))),
    assignedDoctorId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");
    const patient = await ctx.db.get(args.patientId);
    if (!patient) throw new Error("Patient not found");
    // Check if already queued for this case sheet
    const existing = await ctx.db
      .query("doctorQueue")
      .filter((q) => q.eq(q.field("caseSheetId"), args.caseSheetId))
      .first();
    if (existing) {
      throw new Error("This case sheet is already in the queue.");
    }
    const now = Date.now();
    return await ctx.db.insert("doctorQueue", {
      caseSheetId: args.caseSheetId,
      patientId: args.patientId,
      priority: args.priority,
      status: args.status || "waiting",
      queuedAt: now,
      assignedDoctorId: args.assignedDoctorId,
      updatedAt: now,
    });
  },
});

export const updateQueueStatus = mutation({
  args: {
    queueId: v.id("doctorQueue"),
    status: v.union(v.literal("waiting"), v.literal("in-consultation"), v.literal("completed")),
    assignedDoctorId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");
    const queueItem = await ctx.db.get(args.queueId);
    if (!queueItem) throw new Error("Queue item not found");
    // In production, check if user is doctor
    const updateData: any = {
      status: args.status,
      updatedAt: Date.now(),
    };
    if (args.assignedDoctorId !== undefined) {
      updateData.assignedDoctorId = args.assignedDoctorId;
    }
    await ctx.db.patch(args.queueId, updateData);
    return args.queueId;
  },
});