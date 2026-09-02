import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser } from "./users";

export const getAYUSHByConsultation = query({
  args: { consultationId: v.id("consultations") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;
    const consultation = await ctx.db.get(args.consultationId);
    if (!consultation) return null;
    const patient = await ctx.db.get(consultation.patientId);
    if (!patient || patient.userId !== user._id) return null;
    return await ctx.db
      .query("ayushAssessments")
      .withIndex("by_consultation", (q) => q.eq("consultationId", args.consultationId))
      .first();
  },
});

export const createAYUSH = mutation({
  args: {
    patientId: v.id("patients"),
    consultationId: v.id("consultations"),
    responses: v.record(v.string(), v.string()),
    aharaVihara: v.object({
      diet: v.optional(v.string()),
      sleep: v.optional(v.string()),
      bowelHabits: v.optional(v.string()),
      dailyRoutine: v.optional(v.string()),
      substances: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");
    const patient = await ctx.db.get(args.patientId);
    if (!patient || patient.userId !== user._id) throw new Error("Not authorized");
    // Check if an assessment already exists for this consultation
    const existing = await ctx.db
      .query("ayushAssessments")
      .withIndex("by_consultation", (q) => q.eq("consultationId", args.consultationId))
      .first();
    if (existing) {
      throw new Error("An AYUSH assessment already exists for this consultation. Use updateAYUSH instead.");
    }
    const now = Date.now();
    return await ctx.db.insert("ayushAssessments", {
      patientId: args.patientId,
      consultationId: args.consultationId,
      responses: args.responses,
      aharaVihara: args.aharaVihara,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateAYUSH = mutation({
  args: {
    assessmentId: v.id("ayushAssessments"),
    responses: v.optional(v.record(v.string(), v.string())),
    aharaVihara: v.optional(v.object({
      diet: v.optional(v.string()),
      sleep: v.optional(v.string()),
      bowelHabits: v.optional(v.string()),
      dailyRoutine: v.optional(v.string()),
      substances: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");
    const assessment = await ctx.db.get(args.assessmentId);
    if (!assessment) throw new Error("Assessment not found");
    // Verify the assessment belongs to the current user
    const patient = await ctx.db.get(assessment.patientId);
    if (!patient || patient.userId !== user._id) throw new Error("Not authorized");
    // Ensure the consultation still exists? Not needed.
    const updateData: any = { updatedAt: Date.now() };
    if (args.responses !== undefined) updateData.responses = args.responses;
    if (args.aharaVihara !== undefined) updateData.aharaVihara = args.aharaVihara;
    await ctx.db.patch(args.assessmentId, updateData);
    return args.assessmentId;
  },
});