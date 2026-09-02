import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser } from "./users";

export const getTriageByConsultation = query({
  args: { consultationId: v.id("consultations") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;
    const consultation = await ctx.db.get(args.consultationId);
    if (!consultation) return null;
    const patient = await ctx.db.get(consultation.patientId);
    if (!patient || patient.userId !== user._id) return null;
    return await ctx.db
      .query("triageResults")
      .withIndex("by_consultation", (q) => q.eq("consultationId", args.consultationId))
      .first();
  },
});

export const createTriage = mutation({
  args: {
    patientId: v.id("patients"),
    consultationId: v.id("consultations"),
    priority: v.union(v.literal("urgent"), v.literal("priority"), v.literal("routine")),
    reasons: v.array(v.string()),
    confidence: v.number(),
    timestamp: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");
    const patient = await ctx.db.get(args.patientId);
    if (!patient || patient.userId !== user._id) throw new Error("Not authorized");
    // Check if a triage result already exists for this consultation
    const existing = await ctx.db
      .query("triageResults")
      .withIndex("by_consultation", (q) => q.eq("consultationId", args.consultationId))
      .first();
    if (existing) {
      throw new Error("A triage result already exists for this consultation. Use updateTriage if needed.");
    }
    return await ctx.db.insert("triageResults", {
      patientId: args.patientId,
      consultationId: args.consultationId,
      priority: args.priority,
      reasons: args.reasons,
      confidence: args.confidence,
      timestamp: args.timestamp,
      createdAt: Date.now(),
    });
  },
});