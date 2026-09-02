import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser } from "./users";

export const getAuditLogs = query({
  args: { entityType: v.string(), entityId: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;
    // In production, restrict to admins/doctors
    return await ctx.db
      .query("auditLogs")
      .withIndex("by_entity", (q) => q.eq("entityType", args.entityType).eq("entityId", args.entityId))
      .collect();
  },
});

export const logAudit = mutation({
  args: {
    entityType: v.string(),
    entityId: v.string(),
    action: v.string(),
    userId: v.optional(v.id("users")),
    patientId: v.optional(v.id("patients")),
    consultationId: v.optional(v.id("consultations")),
    changes: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");
    // We can log even if user is not the same; but we'll use the provided userId or current user
    const actorId = args.userId || user._id;
    const patient = args.patientId ? await ctx.db.get(args.patientId) : null;
    if (args.patientId && (!patient || patient.userId !== user._id)) {
      // For now, allow logging for any patient; later restrict
    }
    return await ctx.db.insert("auditLogs", {
      entityType: args.entityType,
      entityId: args.entityId,
      action: args.action,
      userId: actorId,
      patientId: args.patientId,
      consultationId: args.consultationId,
      changes: args.changes,
      timestamp: Date.now(),
    });
  },
});