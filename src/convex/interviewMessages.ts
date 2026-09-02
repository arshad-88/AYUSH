import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser } from "./users";

export const getMessagesByConsultation = query({
  args: { consultationId: v.id("consultations") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;
    const consultation = await ctx.db.get(args.consultationId);
    if (!consultation) return null;
    const patient = await ctx.db.get(consultation.patientId);
    if (!patient || patient.userId !== user._id) return null;
    return await ctx.db
      .query("interviewMessages")
      .withIndex("by_consultation", (q) => q.eq("consultationId", args.consultationId))
      .collect();
  },
});

export const addMessage = mutation({
  args: {
    consultationId: v.id("consultations"),
    role: v.union(v.literal("ai"), v.literal("patient")),
    content: v.string(),
    timestamp: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");
    const consultation = await ctx.db.get(args.consultationId);
    if (!consultation) throw new Error("Consultation not found");
    const patient = await ctx.db.get(consultation.patientId);
    if (!patient || patient.userId !== user._id) throw new Error("Not authorized");
    return await ctx.db.insert("interviewMessages", {
      consultationId: args.consultationId,
      role: args.role,
      content: args.content,
      timestamp: args.timestamp,
    });
  },
});

export const clearMessages = mutation({
  args: { consultationId: v.id("consultations") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");
    const consultation = await ctx.db.get(args.consultationId);
    if (!consultation) throw new Error("Consultation not found");
    const patient = await ctx.db.get(consultation.patientId);
    if (!patient || patient.userId !== user._id) throw new Error("Not authorized");
    const messages = await ctx.db
      .query("interviewMessages")
      .withIndex("by_consultation", (q) => q.eq("consultationId", args.consultationId))
      .collect();
    for (const msg of messages) {
      await ctx.db.delete(msg._id);
    }
    return args.consultationId;
  },
});