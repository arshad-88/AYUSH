import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser } from "./users";

export const getTimelineByPatient = query({
  args: { patientId: v.id("patients") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;
    const patient = await ctx.db.get(args.patientId);
    if (!patient || patient.userId !== user._id) return null;
    return await ctx.db
      .query("timelineEvents")
      .withIndex("by_patient", (q) => q.eq("patientId", args.patientId))
      .collect();
  },
});

export const createTimelineEvent = mutation({
  args: {
    patientId: v.id("patients"),
    consultationId: v.optional(v.id("consultations")),
    documentId: v.optional(v.id("documents")),
    eventDate: v.string(),
    eventDateSource: v.optional(v.union(v.literal("clinical_date"), v.literal("user_confirmed"), v.literal("document_metadata"), v.literal("upload_date_fallback"), v.literal("unknown"))),
    confidence: v.optional(v.number()),
    eventType: v.union(v.literal("encounter"), v.literal("lab"), v.literal("medication"), v.literal("observation")),
    title: v.string(),
    description: v.string(),
    source: v.optional(v.union(v.literal("PATIENT"), v.literal("DOCUMENT"), v.literal("DOCTOR"), v.literal("SYSTEM"))),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");
    const patient = await ctx.db.get(args.patientId);
    if (!patient || patient.userId !== user._id) throw new Error("Not authorized");
    return await ctx.db.insert("timelineEvents", {
      patientId: args.patientId,
      consultationId: args.consultationId,
      documentId: args.documentId,
      eventDate: args.eventDate,
      eventDateSource: args.eventDateSource || "unknown",
      confidence: args.confidence,
      eventType: args.eventType,
      title: args.title,
      description: args.description,
      source: args.source,
      createdAt: Date.now(),
    });
  },
});

export const deleteTimelineEvent = mutation({
  args: { eventId: v.id("timelineEvents") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");
    const event = await ctx.db.get(args.eventId);
    if (!event) throw new Error("Event not found");
    const patient = await ctx.db.get(event.patientId);
    if (!patient || patient.userId !== user._id) throw new Error("Not authorized");
    await ctx.db.delete(args.eventId);
    return args.eventId;
  },
});