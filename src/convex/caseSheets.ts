import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser } from "./users";

export const getCaseSheetByConsultation = query({
  args: { consultationId: v.id("consultations") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;
    const consultation = await ctx.db.get(args.consultationId);
    if (!consultation) return null;
    const patient = await ctx.db.get(consultation.patientId);
    if (!patient || patient.userId !== user._id) return null;
    return await ctx.db
      .query("caseSheets")
      .withIndex("by_consultation", (q) => q.eq("consultationId", args.consultationId))
      .first();
  },
});

export const createCaseSheet = mutation({
  args: {
    patientId: v.id("patients"),
    consultationId: v.id("consultations"),
    status: v.union(v.literal("draft"), v.literal("submitted"), v.literal("verified"), v.literal("rejected")),
    data: v.object({
      summary: v.optional(v.string()),
      clinicalAlerts: v.array(v.string()),
      missingInfo: v.array(v.string()),
      generatedAt: v.optional(v.string()),
      patientReported: v.optional(v.record(v.string(), v.string())),
      documentReported: v.optional(v.record(v.string(), v.string())),
      contradictions: v.array(v.any()),
    }),
    doctorVerification: v.object({
      status: v.union(v.literal("pending"), v.literal("confirmed"), v.literal("edited"), v.literal("rejected")),
      overridePriority: v.optional(v.union(v.literal("urgent"), v.literal("priority"), v.literal("routine"))),
      overrideReason: v.optional(v.string()),
      verifiedAt: v.optional(v.string()),
    }),
    doctorOverrides: v.optional(v.object({
      priority: v.optional(v.union(v.literal("urgent"), v.literal("priority"), v.literal("routine"))),
      reason: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");
    const patient = await ctx.db.get(args.patientId);
    if (!patient || patient.userId !== user._id) throw new Error("Not authorized");
    const now = Date.now();
    return await ctx.db.insert("caseSheets", {
      patientId: args.patientId,
      consultationId: args.consultationId,
      status: args.status,
      data: args.data,
      doctorVerification: args.doctorVerification,
      doctorOverrides: args.doctorOverrides,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateCaseSheet = mutation({
  args: {
    caseSheetId: v.id("caseSheets"),
    status: v.optional(v.union(v.literal("draft"), v.literal("submitted"), v.literal("verified"), v.literal("rejected"))),
    data: v.optional(v.object({
      summary: v.optional(v.string()),
      clinicalAlerts: v.array(v.string()),
      missingInfo: v.array(v.string()),
      generatedAt: v.optional(v.string()),
      patientReported: v.optional(v.record(v.string(), v.string())),
      documentReported: v.optional(v.record(v.string(), v.string())),
      contradictions: v.array(v.any()),
    })),
    doctorVerification: v.optional(v.object({
      status: v.union(v.literal("pending"), v.literal("confirmed"), v.literal("edited"), v.literal("rejected")),
      overridePriority: v.optional(v.union(v.literal("urgent"), v.literal("priority"), v.literal("routine"))),
      overrideReason: v.optional(v.string()),
      verifiedAt: v.optional(v.string()),
    })),
    doctorOverrides: v.optional(v.object({
      priority: v.optional(v.union(v.literal("urgent"), v.literal("priority"), v.literal("routine"))),
      reason: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");
    const caseSheet = await ctx.db.get(args.caseSheetId);
    if (!caseSheet) throw new Error("Case sheet not found");
    const patient = await ctx.db.get(caseSheet.patientId);
    if (!patient || patient.userId !== user._id) throw new Error("Not authorized");
    const updateData: any = { updatedAt: Date.now() };
    if (args.status !== undefined) updateData.status = args.status;
    if (args.data !== undefined) updateData.data = args.data;
    if (args.doctorVerification !== undefined) updateData.doctorVerification = args.doctorVerification;
    if (args.doctorOverrides !== undefined) updateData.doctorOverrides = args.doctorOverrides;
    await ctx.db.patch(args.caseSheetId, updateData);
    return args.caseSheetId;
  },
});