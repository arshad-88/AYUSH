import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

// Enums for various statuses
export const consultationStatusValidator = v.union(
  v.literal("active"),
  v.literal("completed"),
  v.literal("archived"),
);
export type ConsultationStatus = Infer<typeof consultationStatusValidator>;

export const verificationStatusValidator = v.union(
  v.literal("pending"),
  v.literal("confirmed"),
  v.literal("edited"),
  v.literal("rejected"),
);
export type VerificationStatus = Infer<typeof verificationStatusValidator>;

export const priorityValidator = v.union(
  v.literal("urgent"),
  v.literal("priority"),
  v.literal("routine"),
);
export type Priority = Infer<typeof priorityValidator>;

export const queueStatusValidator = v.union(
  v.literal("waiting"),
  v.literal("in-consultation"),
  v.literal("completed"),
);
export type QueueStatus = Infer<typeof queueStatusValidator>;

// Reusable validators for nested objects
const clinicalStateValidator = v.object({
  chiefComplaint: v.optional(v.string()),
  site: v.optional(v.string()),
  onset: v.optional(v.string()),
  duration: v.optional(v.string()),
  character: v.optional(v.string()),
  radiation: v.optional(v.string()),
  severity: v.optional(v.number()),
  associatedSymptoms: v.array(v.string()),
  timing: v.optional(v.string()),
  aggravatingFactors: v.optional(v.string()),
  relievingFactors: v.optional(v.string()),
  pastMedicalHistory: v.array(v.string()),
  medications: v.array(v.string()),
  allergies: v.array(v.string()),
  familyHistory: v.optional(v.string()),
  personalHistory: v.optional(v.string()),
  reviewOfSystems: v.record(v.string(), v.string()),
  ayush: v.record(v.string(), v.string()),
  aharaVihara: v.record(v.string(), v.string()),
  ayushUnknownFields: v.array(v.string()),
  ayushComplete: v.boolean(),
  ayushPhysicianVerified: v.boolean(),
  patientFacts: v.array(v.any()),
  documentFacts: v.array(v.any()),
  verifiedFacts: v.array(v.any()),
  unknownFields: v.array(v.string()),
  contradictions: v.array(v.any()),
  documentReferences: v.array(v.string()),
  completeness: v.number(),
});

const socratesValidator = v.object({
  site: v.string(),
  onset: v.string(),
  character: v.string(),
  radiation: v.string(),
  associatedSymptoms: v.string(),
  timing: v.string(),
  exacerbatingFactors: v.string(),
  relievingFactors: v.string(),
  severity: v.string(),
});

const ayushAssessmentValidator = v.object({
  prakriti: v.string(),
  vikriti: v.string(),
  sara: v.string(),
  samhanana: v.string(),
  pramana: v.string(),
  satmya: v.string(),
  satva: v.string(),
  aharaShakti: v.string(),
  vyayamaShakti: v.string(),
  vaya: v.string(),
});

const aharaViharaValidator = v.object({
  diet: v.optional(v.string()),
  sleep: v.optional(v.string()),
  bowelHabits: v.optional(v.string()),
  dailyRoutine: v.optional(v.string()),
  substances: v.optional(v.string()),
});

const triageResultValidator = v.object({
  priority: priorityValidator,
  reasons: v.array(v.string()),
  confidence: v.number(),
  timestamp: v.string(),
});

const caseSheetDataValidator = v.object({
  summary: v.optional(v.string()),
  clinicalAlerts: v.array(v.string()),
  missingInfo: v.array(v.string()),
  generatedAt: v.optional(v.string()),
  patientReported: v.optional(v.record(v.string(), v.string())),
  documentReported: v.optional(v.record(v.string(), v.string())),
  contradictions: v.array(v.any()),
});

const verificationValidator = v.object({
  status: verificationStatusValidator,
  overridePriority: v.optional(priorityValidator),
  overrideReason: v.optional(v.string()),
  verifiedAt: v.optional(v.string()),
});

const interviewMessageValidator = v.object({
  role: v.union(v.literal("ai"), v.literal("patient")),
  content: v.string(),
  timestamp: v.string(),
});

const documentFactValidator = v.object({
  field: v.string(),
  value: v.string(),
  source: v.union(v.literal("PATIENT"), v.literal("DOCUMENT"), v.literal("DOCTOR"), v.literal("SYSTEM")),
  confidence: v.number(),
  verified: v.boolean(),
  timestamp: v.optional(v.string()),
  documentId: v.optional(v.string()),
  evidence: v.optional(v.string()),
  originalValue: v.optional(v.string()),
  editedValue: v.optional(v.string()),
  status: v.optional(v.union(v.literal("pending"), v.literal("confirmed"), v.literal("edited"), v.literal("rejected"))),
  verifiedBy: v.optional(v.string()),
  verifiedAt: v.optional(v.string()),
});

const documentExtractionValidator = v.object({
  id: v.string(),
  filename: v.optional(v.string()),
  fileName: v.optional(v.string()),
  type: v.optional(v.string()),
  fileType: v.optional(v.string()),
  status: v.optional(v.union(v.literal("pending"), v.literal("processing"), v.literal("completed"), v.literal("failed"))),
  extractedData: v.record(v.string(), v.string()),
  confidence: v.optional(v.record(v.string(), v.number())),
  rawText: v.optional(v.string()),
  timestamp: v.optional(v.string()),
  error: v.optional(v.string()),
  documentFacts: v.array(documentFactValidator),
  documentType: v.optional(v.union(v.literal("prescription"), v.literal("laboratory-report"), v.literal("discharge-summary"), v.literal("consultation-note"), v.literal("medical-certificate"), v.literal("identity-document"), v.literal("unknown"))),
  classificationConfidence: v.optional(v.number()),
  classificationConfidenceLevel: v.optional(v.union(v.literal("high"), v.literal("medium"), v.literal("low"))),
  reviewRequired: v.optional(v.boolean()),
  verificationStatus: v.optional(v.union(v.literal("requires-review"), v.literal("verified"), v.literal("rejected"))),
  warnings: v.array(v.string()),
});

const timelineEventValidator = v.object({
  id: v.string(),
  date: v.string(),
  title: v.string(),
  description: v.string(),
  type: v.union(v.literal("encounter"), v.literal("lab"), v.literal("medication"), v.literal("observation")),
  source: v.optional(v.union(v.literal("PATIENT"), v.literal("DOCUMENT"), v.literal("DOCTOR"), v.literal("SYSTEM"))),
});

const consultationHistoryEntryValidator = v.object({
  id: v.string(),
  completedAt: v.string(),
  clinicalState: clinicalStateValidator,
  socrates: socratesValidator,
  ayush: ayushAssessmentValidator,
  aharaVihara: aharaViharaValidator,
  documents: v.array(documentExtractionValidator),
  timeline: v.array(timelineEventValidator),
  triage: v.optional(triageResultValidator),
  caseSheet: v.optional(caseSheetDataValidator),
  verification: verificationValidator,
});

const schema = defineSchema(
  {
    // Auth tables
    ...authTables,

    users: defineTable({
      name: v.optional(v.string()),
      image: v.optional(v.string()),
      email: v.optional(v.string()),
      emailVerificationTime: v.optional(v.number()),
      isAnonymous: v.optional(v.boolean()),
      role: v.optional(roleValidator),
    }).index("email", ["email"]),

    // Patients
    patients: defineTable({
      userId: v.id("users"),
      name: v.string(),
      age: v.optional(v.number()),
      gender: v.optional(v.string()),
      language: v.string(),
      abhaId: v.optional(v.string()),
      mobileNumber: v.optional(v.string()),
      consentGiven: v.boolean(),
      authenticationProvider: v.optional(v.union(v.literal("aadhaar"), v.literal("abha"), v.literal("mobile"), v.literal("demo"))),
      verificationStatus: v.optional(v.union(v.literal("pending"), v.literal("verified"), v.literal("rejected"), v.literal("demo"))),
      // Current patient identity from login
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
      createdAt: v.number(),
      updatedAt: v.number(),
    }).index("by_user", ["userId"]).index("by_abha", ["abhaId"]),

    // Consultations
    consultations: defineTable({
      patientId: v.id("patients"),
      status: consultationStatusValidator,
      language: v.string(),
      inputMode: v.optional(v.union(v.literal("voice"), v.literal("touch"))),
      startedAt: v.number(),
      completedAt: v.optional(v.number()),
      // Clinical state – stored as structured JSON
      clinicalState: clinicalStateValidator,
      socrates: socratesValidator,
      ayush: ayushAssessmentValidator,
      aharaVihara: aharaViharaValidator,
      triage: v.optional(triageResultValidator),
      caseSheet: v.optional(caseSheetDataValidator),
      verification: verificationValidator,
      // Aggregated from interview messages
      interviewComplete: v.boolean(),
      assessmentStatus: v.optional(v.union(v.literal("idle"), v.literal("in-progress"), v.literal("completed"))),
      activeInterviewQuestion: v.optional(v.string()),
      activeInterviewTargetField: v.optional(v.string()),
    }).index("by_patient", ["patientId"]).index("by_status", ["status"]).index("by_started", ["startedAt"]),

    // Interview messages
    interviewMessages: defineTable({
      consultationId: v.id("consultations"),
      role: v.union(v.literal("ai"), v.literal("patient")),
      content: v.string(),
      timestamp: v.string(),
    }).index("by_consultation", ["consultationId"]).index("by_timestamp", ["timestamp"]),

    // Documents
    documents: defineTable({
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
      documentFacts: v.array(documentFactValidator),
      verificationStatus: v.optional(v.union(v.literal("requires-review"), v.literal("verified"), v.literal("rejected"))),
      warnings: v.array(v.string()),
      reviewRequired: v.optional(v.boolean()),
      classificationConfidence: v.optional(v.number()),
      classificationConfidenceLevel: v.optional(v.union(v.literal("high"), v.literal("medium"), v.literal("low"))),
      error: v.optional(v.string()),
      createdAt: v.number(),
      updatedAt: v.number(),
    }).index("by_patient", ["patientId"]).index("by_consultation", ["consultationId"]).index("by_upload", ["uploadTimestamp"]),

    // Timeline events
    timelineEvents: defineTable({
      patientId: v.id("patients"),
      consultationId: v.optional(v.id("consultations")),
      documentId: v.optional(v.id("documents")),
      eventDate: v.string(),
      eventDateSource: v.optional(v.union(
        v.literal("clinical_date"),
        v.literal("user_confirmed"),
        v.literal("document_metadata"),
        v.literal("upload_date_fallback"),
        v.literal("unknown")
      )),
      confidence: v.optional(v.number()),
      eventType: v.union(v.literal("encounter"), v.literal("lab"), v.literal("medication"), v.literal("observation")),
      title: v.string(),
      description: v.string(),
      source: v.optional(v.union(v.literal("PATIENT"), v.literal("DOCUMENT"), v.literal("DOCTOR"), v.literal("SYSTEM"))),
      createdAt: v.number(),
    }).index("by_patient", ["patientId"]).index("by_event_date", ["eventDate"]).index("by_consultation", ["consultationId"]).index("by_document", ["documentId"]),

    // AYUSH assessments (kept separate for historical record)
    ayushAssessments: defineTable({
      patientId: v.id("patients"),
      consultationId: v.id("consultations"),
      responses: v.record(v.string(), v.string()),
      aharaVihara: aharaViharaValidator,
      createdAt: v.number(),
      updatedAt: v.number(),
    }).index("by_patient", ["patientId"]).index("by_consultation", ["consultationId"]),

    // Triage results (kept separate for historical record)
    triageResults: defineTable({
      patientId: v.id("patients"),
      consultationId: v.id("consultations"),
      priority: priorityValidator,
      reasons: v.array(v.string()),
      confidence: v.number(),
      timestamp: v.string(),
      createdAt: v.number(),
    }).index("by_patient", ["patientId"]).index("by_consultation", ["consultationId"]),

    // Case sheets (kept separate for historical record)
    caseSheets: defineTable({
      patientId: v.id("patients"),
      consultationId: v.id("consultations"),
      status: v.union(v.literal("draft"), v.literal("submitted"), v.literal("verified"), v.literal("rejected")),
      data: caseSheetDataValidator,
      doctorVerification: verificationValidator,
      doctorOverrides: v.optional(v.object({
        priority: v.optional(priorityValidator),
        reason: v.optional(v.string()),
      })),
      createdAt: v.number(),
      updatedAt: v.number(),
    }).index("by_patient", ["patientId"]).index("by_consultation", ["consultationId"]).index("by_status", ["status"]),

    // Doctor queue
    doctorQueue: defineTable({
      caseSheetId: v.id("caseSheets"),
      patientId: v.id("patients"),
      priority: priorityValidator,
      status: queueStatusValidator,
      queuedAt: v.number(),
      assignedDoctorId: v.optional(v.string()), // placeholder for doctor user id
      updatedAt: v.number(),
    }).index("by_status", ["status"]).index("by_priority", ["priority"]).index("by_queued", ["queuedAt"]),

    // Audit logs (minimal)
    auditLogs: defineTable({
      entityType: v.string(),
      entityId: v.string(),
      action: v.string(),
      userId: v.optional(v.id("users")),
      patientId: v.optional(v.id("patients")),
      consultationId: v.optional(v.id("consultations")),
      changes: v.optional(v.any()),
      timestamp: v.number(),
    }).index("by_entity", ["entityType", "entityId"]).index("by_user", ["userId"]).index("by_timestamp", ["timestamp"]),
  },
  {
    schemaValidation: false,
  }
);

export default schema;