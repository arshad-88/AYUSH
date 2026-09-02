import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser } from "./users";
import { consultationStatusValidator, priorityValidator } from "./schema";

export const getConsultationByPatient = query({
  args: { patientId: v.id("patients") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;
    const patient = await ctx.db.get(args.patientId);
    if (!patient || patient.userId !== user._id) return null;
    const consultations = await ctx.db
      .query("consultations")
      .withIndex("by_patient", (q) => q.eq("patientId", args.patientId))
      .collect();
    return consultations;
  },
});

export const getActiveConsultation = query({
  args: { patientId: v.id("patients") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;
    const patient = await ctx.db.get(args.patientId);
    if (!patient || patient.userId !== user._id) return null;
    const consultation = await ctx.db
      .query("consultations")
      .withIndex("by_patient", (q) => q.eq("patientId", args.patientId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();
    return consultation;
  },
});

export const createConsultation = mutation({
  args: {
    patientId: v.id("patients"),
    language: v.string(),
    inputMode: v.optional(v.union(v.literal("voice"), v.literal("touch"))),
    clinicalState: v.any(),
    socrates: v.any(),
    ayush: v.any(),
    aharaVihara: v.any(),
    verification: v.any(),
    interviewComplete: v.boolean(),
    assessmentStatus: v.optional(v.union(v.literal("idle"), v.literal("in-progress"), v.literal("completed"))),
    activeInterviewQuestion: v.optional(v.string()),
    activeInterviewTargetField: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");
    const patient = await ctx.db.get(args.patientId);
    if (!patient || patient.userId !== user._id) throw new Error("Not authorized");
    const now = Date.now();
    const consultationId = await ctx.db.insert("consultations", {
      patientId: args.patientId,
      status: "active",
      language: args.language,
      inputMode: args.inputMode,
      startedAt: now,
      completedAt: undefined,
      clinicalState: args.clinicalState,
      socrates: args.socrates,
      ayush: args.ayush,
      aharaVihara: args.aharaVihara,
      triage: undefined,
      caseSheet: undefined,
      verification: args.verification,
      interviewComplete: args.interviewComplete,
      assessmentStatus: args.assessmentStatus,
      activeInterviewQuestion: args.activeInterviewQuestion,
      activeInterviewTargetField: args.activeInterviewTargetField,
    });
    return consultationId;
  },
});

export const updateConsultation = mutation({
  args: {
    consultationId: v.id("consultations"),
    status: v.optional(consultationStatusValidator),
    inputMode: v.optional(v.union(v.literal("voice"), v.literal("touch"))),
    clinicalState: v.optional(v.any()),
    socrates: v.optional(v.any()),
    ayush: v.optional(v.any()),
    aharaVihara: v.optional(v.any()),
    triage: v.optional(v.any()),
    caseSheet: v.optional(v.any()),
    verification: v.optional(v.any()),
    interviewComplete: v.optional(v.boolean()),
    assessmentStatus: v.optional(v.union(v.literal("idle"), v.literal("in-progress"), v.literal("completed"))),
    activeInterviewQuestion: v.optional(v.string()),
    activeInterviewTargetField: v.optional(v.string()),
    completedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");
    const consultation = await ctx.db.get(args.consultationId);
    if (!consultation) throw new Error("Consultation not found");
    const patient = await ctx.db.get(consultation.patientId);
    if (!patient || patient.userId !== user._id) throw new Error("Not authorized");
    const updateData: any = {};
    if (args.status !== undefined) updateData.status = args.status;
    if (args.inputMode !== undefined) updateData.inputMode = args.inputMode;
    if (args.clinicalState !== undefined) updateData.clinicalState = args.clinicalState;
    if (args.socrates !== undefined) updateData.socrates = args.socrates;
    if (args.ayush !== undefined) updateData.ayush = args.ayush;
    if (args.aharaVihara !== undefined) updateData.aharaVihara = args.aharaVihara;
    if (args.triage !== undefined) updateData.triage = args.triage;
    if (args.caseSheet !== undefined) updateData.caseSheet = args.caseSheet;
    if (args.verification !== undefined) updateData.verification = args.verification;
    if (args.interviewComplete !== undefined) updateData.interviewComplete = args.interviewComplete;
    if (args.assessmentStatus !== undefined) updateData.assessmentStatus = args.assessmentStatus;
    if (args.activeInterviewQuestion !== undefined) updateData.activeInterviewQuestion = args.activeInterviewQuestion;
    if (args.activeInterviewTargetField !== undefined) updateData.activeInterviewTargetField = args.activeInterviewTargetField;
    if (args.completedAt !== undefined) updateData.completedAt = args.completedAt;
    await ctx.db.patch(args.consultationId, updateData);
    return args.consultationId;
  },
});

export const completeConsultation = mutation({
  args: { consultationId: v.id("consultations") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");
    const consultation = await ctx.db.get(args.consultationId);
    if (!consultation) throw new Error("Consultation not found");
    const patient = await ctx.db.get(consultation.patientId);
    if (!patient || patient.userId !== user._id) throw new Error("Not authorized");
    await ctx.db.patch(args.consultationId, {
      status: "completed",
      completedAt: Date.now(),
    });
    return args.consultationId;
  },
});