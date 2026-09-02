import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser } from "./users";

export const getDocumentsByPatient = query({
  args: { patientId: v.id("patients") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;
    const patient = await ctx.db.get(args.patientId);
    if (!patient || patient.userId !== user._id) return null;
    return await ctx.db
      .query("documents")
      .withIndex("by_patient", (q) => q.eq("patientId", args.patientId))
      .collect();
  },
});

export const getDocumentById = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;
    const doc = await ctx.db.get(args.documentId);
    if (!doc) return null;
    const patient = await ctx.db.get(doc.patientId);
    if (!patient || patient.userId !== user._id) return null;
    return doc;
  },
});

export const createDocument = mutation({
  args: {
    patientId: v.id("patients"),
    consultationId: v.optional(v.id("consultations")),
    filename: v.string(),
    fileType: v.string(),
    documentType: v.optional(v.union(v.literal("prescription"), v.literal("laboratory-report"), v.literal("discharge-summary"), v.literal("consultation-note"), v.literal("medical-certificate"), v.literal("identity-document"), v.literal("unknown"))),
    uploadTimestamp: v.number(),
    processingStatus: v.optional(v.union(v.literal("pending"), v.literal("processing"), v.literal("completed"), v.literal("failed"))),
    extractedData: v.record(v.string(), v.string()),
    confidence: v.optional(v.record(v.string(), v.number())),
    rawText: v.optional(v.string()),
    documentFacts: v.optional(v.array(v.any())),
    verificationStatus: v.optional(v.union(v.literal("requires-review"), v.literal("verified"), v.literal("rejected"))),
    warnings: v.optional(v.array(v.string())),
    reviewRequired: v.optional(v.boolean()),
    classificationConfidence: v.optional(v.number()),
    classificationConfidenceLevel: v.optional(v.union(v.literal("high"), v.literal("medium"), v.literal("low"))),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");
    const patient = await ctx.db.get(args.patientId);
    if (!patient || patient.userId !== user._id) throw new Error("Not authorized");
    const now = Date.now();
    return await ctx.db.insert("documents", {
      patientId: args.patientId,
      consultationId: args.consultationId,
      filename: args.filename,
      fileType: args.fileType,
      documentType: args.documentType,
      uploadTimestamp: args.uploadTimestamp,
      processingStatus: args.processingStatus,
      extractedData: args.extractedData,
      confidence: args.confidence,
      rawText: args.rawText,
      documentFacts: args.documentFacts || [],
      verificationStatus: args.verificationStatus,
      warnings: args.warnings || [],
      reviewRequired: args.reviewRequired,
      classificationConfidence: args.classificationConfidence,
      classificationConfidenceLevel: args.classificationConfidenceLevel,
      error: args.error,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateDocument = mutation({
  args: {
    documentId: v.id("documents"),
    processingStatus: v.optional(v.union(v.literal("pending"), v.literal("processing"), v.literal("completed"), v.literal("failed"))),
    extractedData: v.optional(v.record(v.string(), v.string())),
    confidence: v.optional(v.record(v.string(), v.number())),
    rawText: v.optional(v.string()),
    documentFacts: v.optional(v.array(v.any())),
    verificationStatus: v.optional(v.union(v.literal("requires-review"), v.literal("verified"), v.literal("rejected"))),
    warnings: v.optional(v.array(v.string())),
    reviewRequired: v.optional(v.boolean()),
    classificationConfidence: v.optional(v.number()),
    classificationConfidenceLevel: v.optional(v.union(v.literal("high"), v.literal("medium"), v.literal("low"))),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");
    const doc = await ctx.db.get(args.documentId);
    if (!doc) throw new Error("Document not found");
    const patient = await ctx.db.get(doc.patientId);
    if (!patient || patient.userId !== user._id) throw new Error("Not authorized");
    const updateData: any = { updatedAt: Date.now() };
    if (args.processingStatus !== undefined) updateData.processingStatus = args.processingStatus;
    if (args.extractedData !== undefined) updateData.extractedData = args.extractedData;
    if (args.confidence !== undefined) updateData.confidence = args.confidence;
    if (args.rawText !== undefined) updateData.rawText = args.rawText;
    if (args.documentFacts !== undefined) updateData.documentFacts = args.documentFacts;
    if (args.verificationStatus !== undefined) updateData.verificationStatus = args.verificationStatus;
    if (args.warnings !== undefined) updateData.warnings = args.warnings;
    if (args.reviewRequired !== undefined) updateData.reviewRequired = args.reviewRequired;
    if (args.classificationConfidence !== undefined) updateData.classificationConfidence = args.classificationConfidence;
    if (args.classificationConfidenceLevel !== undefined) updateData.classificationConfidenceLevel = args.classificationConfidenceLevel;
    if (args.error !== undefined) updateData.error = args.error;
    await ctx.db.patch(args.documentId, updateData);
    return args.documentId;
  },
});