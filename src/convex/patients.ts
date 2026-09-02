import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser } from "./users";

export const getPatientByUserId = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;
    const patient = await ctx.db
      .query("patients")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();
    return patient;
  },
});

export const getPatientById = query({
  args: { patientId: v.id("patients") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;
    const patient = await ctx.db.get(args.patientId);
    if (!patient || patient.userId !== user._id) return null;
    return patient;
  },
});

export const createPatient = mutation({
  args: {
    name: v.string(),
    age: v.optional(v.number()),
    gender: v.optional(v.string()),
    language: v.string(),
    abhaId: v.optional(v.string()),
    mobileNumber: v.optional(v.string()),
    consentGiven: v.boolean(),
    authenticationProvider: v.optional(v.union(v.literal("aadhaar"), v.literal("abha"), v.literal("mobile"), v.literal("demo"))),
    verificationStatus: v.optional(v.union(v.literal("pending"), v.literal("verified"), v.literal("rejected"), v.literal("demo"))),
    identity: v.optional(v.object({
      patientId: v.string(),
      abhaId: v.optional(v.string()),
      displayName: v.string(),
      dateOfBirth: v.optional(v.string()),
      gender: v.optional(v.string()),
      identityProvider: v.union(v.literal("aadhaar"), v.literal("abha"), v.literal("mobile"), v.literal("demo")),
      verificationStatus: v.union(v.literal("pending"), v.literal("verified"), v.literal("rejected"), v.literal("demo")),
      isGuardian: v.boolean(),
      linkedPatientIds: v.array(v.string()),
      createdAt: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");
    const now = Date.now();
    const patientId = await ctx.db.insert("patients", {
      userId: user._id,
      name: args.name,
      age: args.age,
      gender: args.gender,
      language: args.language,
      abhaId: args.abhaId,
      mobileNumber: args.mobileNumber,
      consentGiven: args.consentGiven,
      authenticationProvider: args.authenticationProvider,
      verificationStatus: args.verificationStatus,
      identity: args.identity,
      createdAt: now,
      updatedAt: now,
    });
    return patientId;
  },
});

export const updatePatient = mutation({
  args: {
    patientId: v.id("patients"),
    name: v.optional(v.string()),
    age: v.optional(v.number()),
    gender: v.optional(v.string()),
    language: v.optional(v.string()),
    abhaId: v.optional(v.string()),
    mobileNumber: v.optional(v.string()),
    consentGiven: v.optional(v.boolean()),
    authenticationProvider: v.optional(v.union(v.literal("aadhaar"), v.literal("abha"), v.literal("mobile"), v.literal("demo"))),
    verificationStatus: v.optional(v.union(v.literal("pending"), v.literal("verified"), v.literal("rejected"), v.literal("demo"))),
    identity: v.optional(v.object({
      patientId: v.string(),
      abhaId: v.optional(v.string()),
      displayName: v.string(),
      dateOfBirth: v.optional(v.string()),
      gender: v.optional(v.string()),
      identityProvider: v.union(v.literal("aadhaar"), v.literal("abha"), v.literal("mobile"), v.literal("demo")),
      verificationStatus: v.union(v.literal("pending"), v.literal("verified"), v.literal("rejected"), v.literal("demo")),
      isGuardian: v.boolean(),
      linkedPatientIds: v.array(v.string()),
      createdAt: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");
    const patient = await ctx.db.get(args.patientId);
    if (!patient || patient.userId !== user._id) throw new Error("Not authorized");
    const updateData: any = { updatedAt: Date.now() };
    if (args.name !== undefined) updateData.name = args.name;
    if (args.age !== undefined) updateData.age = args.age;
    if (args.gender !== undefined) updateData.gender = args.gender;
    if (args.language !== undefined) updateData.language = args.language;
    if (args.abhaId !== undefined) updateData.abhaId = args.abhaId;
    if (args.mobileNumber !== undefined) updateData.mobileNumber = args.mobileNumber;
    if (args.consentGiven !== undefined) updateData.consentGiven = args.consentGiven;
    if (args.authenticationProvider !== undefined) updateData.authenticationProvider = args.authenticationProvider;
    if (args.verificationStatus !== undefined) updateData.verificationStatus = args.verificationStatus;
    if (args.identity !== undefined) updateData.identity = args.identity;
    await ctx.db.patch(args.patientId, updateData);
    return args.patientId;
  },
});