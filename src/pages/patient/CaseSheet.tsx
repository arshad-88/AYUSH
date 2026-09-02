import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { usePatientStore } from "@/store/patientStore";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Header } from "@/components/shared/Header";
import { StepProgress } from "@/components/shared/StepProgress";
import { PriorityBadge } from "@/components/shared/PriorityBadge";
import { DisclaimerBanner } from "@/components/shared/DisclaimerBanner";
import { queueService } from "@/services/queue/queueService";
import {
  ArrowLeft,
  ArrowRight,
  FileText,
  User,
  Stethoscope,
  Brain,
  Leaf,
  Clock,
  AlertTriangle,
  Pill,
  FileCheck,
  Activity,
  Link2,
  Printer,
  Dna,
  Sparkles,
} from "lucide-react";
import {
  BiomarkerBar,
  EkgWave,
  ParticleField,
  RadialGauge,
  RingProgress,
  StatusBar,
  HumanPainModel,
} from "@/components/scientific";

const socratesLabels: Record<string, string> = {
  site: "Site",
  onset: "Onset",
  character: "Character",
  radiation: "Radiation",
  associatedSymptoms: "Associated Symptoms",
  timing: "Timing",
  exacerbatingFactors: "Exacerbating Factors",
  relievingFactors: "Relieving Factors",
  severity: "Severity",
};

const ayushLabels: Record<string, string> = {
  prakriti: "Prakriti",
  vikriti: "Vikriti",
  sara: "Sara",
  samhanana: "Samhanana",
  pramana: "Pramana",
  satmya: "Satmya",
  satva: "Satva",
  aharaShakti: "Ahara Shakti",
  vyayamaShakti: "Vyayama Shakti",
  vaya: "Vaya",
};

export default function CaseSheet() {
  const navigate = useNavigate();
  const store = usePatientStore();
  const {
    name,
    age,
    gender,
    language,
    abhaId,
    chiefComplaint,
    socrates,
    ayush,
    documents,
    timeline,
    triage,
    verification,
    clinicalState,
    aharaVihara,
    setVerification,
    completeAssessment,
    setStep,
    consultationId,
    id: patientId,
  } = store;
  const [isSending, setIsSending] = useState(false);

  // Load existing case sheet from Convex
  const existingCaseSheet = useQuery(
    api.caseSheets.getCaseSheetByConsultation,
    consultationId ? { consultationId: consultationId as any } : "skip"
  );
  const createCaseSheet = useMutation(api.caseSheets.createCaseSheet);
  const updateCaseSheet = useMutation(api.caseSheets.updateCaseSheet);
  const enqueueCaseSheet = useMutation(api.doctorQueue.enqueueCaseSheet);
  const createTriage = useMutation(api.triageResults.createTriage);
  const createAYUSH = useMutation(api.ayushAssessments.createAYUSH);

  // Hydrate from Convex if existing
  useEffect(() => {
    if (existingCaseSheet !== undefined && existingCaseSheet) {
      // Update local verification status from Convex
      setVerification(existingCaseSheet.doctorVerification);
      // Other fields are already in store from previous steps
    }
  }, [existingCaseSheet]);

  // Function to ensure all data is persisted before sending
  const persistAllData = async () => {
    if (!consultationId || !patientId) return;

    // Save AYUSH if not already saved - rely on backend duplicate protection
    try {
      await createAYUSH({
        patientId: patientId as any,
        consultationId: consultationId as any,
        responses: ayush,
        aharaVihara: aharaVihara,
      });
    } catch (err) { /* ignore duplicate error */ }

    if (triage) {
      try {
        await createTriage({
          patientId: patientId as any,
          consultationId: consultationId as any,
          priority: triage.priority as any,
          reasons: triage.reasons,
          confidence: triage.confidence,
          timestamp: triage.timestamp || new Date().toISOString(),
        });
      } catch (err) { /* ignore duplicate */ }
    }

    // Create or update case sheet
    const caseSheetData = {
      summary: "Pre-consultation summary",
      clinicalAlerts: [],
      missingInfo: [],
      generatedAt: new Date().toISOString(),
      patientReported: {
        chiefComplaint: chiefComplaint || "",
        ...Object.fromEntries(Object.entries(socrates).filter(([_, v]) => v)),
      },
      documentReported: Object.fromEntries(
        documents.flatMap(d => Object.entries(d.extractedData).filter(([_, v]) => v))
      ),
      contradictions: [],
    };

    if (existingCaseSheet) {
      // Update existing case sheet
      await updateCaseSheet({
        caseSheetId: existingCaseSheet._id,
        data: caseSheetData,
        doctorVerification: verification,
      });
      return existingCaseSheet._id;
    } else {
      // Create new case sheet
      const caseSheetId = await createCaseSheet({
        patientId: patientId as any,
        consultationId: consultationId as any,
        status: "draft",
        data: caseSheetData,
        doctorVerification: verification,
        doctorOverrides: undefined,
      });
      return caseSheetId;
    }
  };

  const answeredSOCRATES = Object.entries(socrates).filter(([_, v]) => v);
  const answeredAYUSH = Object.entries(ayush).filter(([_, v]) => v);

  // Simple completeness engine
  const missingInfo: string[] = [];
  const clinicalAlerts: string[] = [];

  if (!socrates.severity) missingInfo.push("Severity assessment incomplete");
  if (!socrates.associatedSymptoms) missingInfo.push("Associated symptoms not documented");
  if (!socrates.exacerbatingFactors) missingInfo.push("Exacerbating factors not documented");
  if (documents.length === 0) missingInfo.push("No medical documents uploaded");
  if (answeredAYUSH.length < 10)
    missingInfo.push(`AYUSH assessment incomplete (${answeredAYUSH.length}/10)`);

  if (answeredSOCRATES.length < 5) missingInfo.push("SOCRATES assessment incomplete");

  return (
    <div className="min-h-screen relative overflow-hidden">
      <ParticleField density="low" opacity={0.18} />
      <div className="absolute inset-0 surface-grid opacity-15 pointer-events-none" />
      <Header />
      <div className="relative max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <StepProgress
            currentStep="casesheet"
            completedSteps={["login", "consent", "interview", "ayush", "documents", "timeline", "triage"]}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* AI-Generated Draft Banner */}
          <DisclaimerBanner
            type="ai-generated"
            message="This is an AI-generated draft case sheet. Doctor verification is required before clinical use."
          />

          {/* Case Sheet Header */}
          <div className="lab-card lab-card-accent p-6 sm:p-8 relative overflow-hidden">
            <div className="absolute top-3 right-3">
              <StatusBar latency="42ms" sessionId="CASESHEET-A1" />
            </div>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-trust-500 to-teal-500 flex items-center justify-center glow-primary">
                  <FileText className="w-7 h-7 text-white" strokeWidth={1.6} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="data-figure text-[10px] tracking-widest text-mint-400">● READY FOR REVIEW</span>
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight-x">
                    Pre-Consultation Case Sheet
                  </h1>
                  <span className="data-figure text-[10px] text-muted-foreground tracking-widest">
                    MEDIKIOSK · {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {triage && <PriorityBadge priority={triage.priority as any} size="lg" />}
                <Button variant="outline" size="sm" className="border-trust-500/30 hover:bg-trust-500/10" onClick={() => window.print()}>
                  <Printer className="w-4 h-4 mr-1" />
                  Print
                </Button>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-trust-500/15">
              <EkgWave height={28} showAxis={false} variant="accent" />
            </div>
          </div>

          {/* Patient Information */}
          <div className="lab-card lab-card-accent p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-lg bg-trust-500/15 border border-trust-500/30 flex items-center justify-center">
                <User className="w-4 h-4 text-trust-300" strokeWidth={1.6} />
              </div>
              <div>
                <h3 className="font-bold tracking-tight-x">Patient Information</h3>
                <span className="data-figure text-[10px] text-muted-foreground tracking-widest">
                  DEMOGRAPHICS · IDENTITY
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3 rounded-md bg-trust-500/8 border border-trust-500/20">
                <span className="data-figure text-[10px] tracking-widest text-muted-foreground">NAME</span>
                <p className="text-sm font-semibold mt-1">{name || "—"}</p>
              </div>
              <div className="p-3 rounded-md bg-bio-base/50 border border-trust-500/15">
                <span className="data-figure text-[10px] tracking-widest text-muted-foreground">AGE / GENDER</span>
                <p className="text-sm font-semibold mt-1">{age ? `${age}y / ${gender}` : "—"}</p>
              </div>
              <div className="p-3 rounded-md bg-bio-base/50 border border-trust-500/15">
                <span className="data-figure text-[10px] tracking-widest text-muted-foreground">LANGUAGE</span>
                <p className="text-sm font-semibold mt-1">{language}</p>
              </div>
              <div className="p-3 rounded-md bg-teal-500/8 border border-teal-500/25">
                <span className="data-figure text-[10px] tracking-widest text-teal-400">ABHA ID</span>
                <p className="text-sm font-semibold mt-1 text-teal-400">{abhaId || "—"}</p>
              </div>
            </div>
          </div>

          {/* 3D Pain Visualization */}
          <div className="lab-card lab-card-accent p-6 relative overflow-hidden">
            <div className="absolute top-3 right-3">
              <StatusBar latency="42ms" sessionId="PAIN-VIZ" />
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-red-urgent/15 border border-red-urgent/30 flex items-center justify-center">
                <Activity className="w-4 h-4 text-red-critical" strokeWidth={1.6} />
              </div>
              <div>
                <h3 className="font-bold tracking-tight-x">Pain Localization</h3>
                <span className="data-figure text-[10px] text-muted-foreground tracking-widest">
                  3D BODY MAP · POST-ASSESSMENT
                </span>
              </div>
            </div>
            <div className="rounded-xl overflow-hidden bg-bio-base/40 border border-red-urgent/15">
              <HumanPainModel
                clinicalState={clinicalState}
                className="h-[400px]"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Pain regions highlighted based on your assessment responses. Interact with the model to explore.
            </p>
          </div>

          {/* Chief Complaint */}
          <div className="lab-card lab-card-accent p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-trust-500/15 border border-trust-500/30 flex items-center justify-center">
                <Stethoscope className="w-4 h-4 text-trust-300" strokeWidth={1.6} />
              </div>
              <div>
                <h3 className="font-bold tracking-tight-x">Chief Complaint</h3>
                <span className="data-figure text-[10px] text-muted-foreground tracking-widest">
                  PRIMARY REASON FOR VISIT
                </span>
              </div>
            </div>
            <p className="text-base leading-relaxed p-4 bg-trust-500/10 border border-trust-500/30 rounded-md">
              {chiefComplaint || "—"}
            </p>
          </div>

          {/* SOCRATES */}
          <div className="lab-card lab-card-accent p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-trust-500/15 border border-trust-500/30 flex items-center justify-center">
                  <Brain className="w-4 h-4 text-trust-300" strokeWidth={1.6} />
                </div>
                <div>
                  <h3 className="font-bold tracking-tight-x">SOCRATES Assessment</h3>
                  <span className="data-figure text-[10px] text-muted-foreground tracking-widest">
                    {answeredSOCRATES.length}/9 DOCUMENTED
                  </span>
                </div>
              </div>
              <RingProgress
                value={Math.round((answeredSOCRATES.length / 9) * 100)}
                size={48}
                thickness={4}
                variant="primary"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.entries(socratesLabels).map(([key, label]) => {
                const value = socrates[key as keyof typeof socrates];
                return (
                  <div key={key} className={`p-3 rounded-md border ${value ? "bg-trust-500/8 border-trust-500/25" : "bg-bio-base/40 border-bio-border/30"}`}>
                    <span className="data-figure text-[10px] tracking-widest text-muted-foreground block mb-1">
                      {label}
                    </span>
                    <p className={`text-sm ${value ? "" : "text-muted-foreground/50 italic"}`}>
                      {value || "Not documented"}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* HPI and structured history */}
          <div className="lab-card lab-card-accent p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-trust-500/15 border border-trust-500/30 flex items-center justify-center">
                <Activity className="w-4 h-4 text-trust-300" strokeWidth={1.6} />
              </div>
              <h3 className="font-bold tracking-tight-x">History of Present Illness</h3>
            </div>
            <div className="space-y-2 text-sm">
              <p><strong className="text-trust-300">Chief complaint:</strong> {chiefComplaint || "Not provided"}</p>
              <p><strong className="text-trust-300">Onset:</strong> {socrates.onset || "Not provided"}</p>
              <p><strong className="text-trust-300">Duration:</strong> {clinicalState.duration || "Not provided"}</p>
              <p><strong className="text-trust-300">Site / character:</strong> {[socrates.site, socrates.character].filter(Boolean).join("; ") || "Not provided"}</p>
              <p><strong className="text-trust-300">Associated symptoms:</strong> {socrates.associatedSymptoms || "Not provided"}</p>
            </div>
          </div>

          <div className="lab-card lab-card-accent p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-teal-500/15 border border-teal-500/30 flex items-center justify-center">
                <Dna className="w-4 h-4 text-teal-400" strokeWidth={1.6} />
              </div>
              <h3 className="font-bold tracking-tight-x">Medical History</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <p><strong className="text-teal-400">Past medical history:</strong> {clinicalState.pastMedicalHistory.join(", ") || "Not provided"}</p>
              <p><strong className="text-teal-400">Past surgical history:</strong> {clinicalState.personalHistory || "Not provided"}</p>
              <p><strong className="text-teal-400">Medications:</strong> {clinicalState.medications.join(", ") || "Not provided"}</p>
              <p><strong className="text-teal-400">Allergies:</strong> {clinicalState.allergies.join(", ") || "Not provided"}</p>
              <p><strong className="text-teal-400">Family history:</strong> {clinicalState.familyHistory || "Not provided"}</p>
              <p><strong className="text-teal-400">Personal history:</strong> {clinicalState.personalHistory || "Not provided"}</p>
              <p><strong className="text-teal-400">ROS:</strong> {Object.entries(clinicalState.reviewOfSystems).map(([key, value]) => `${key}: ${value}`).join("; ") || "Not provided"}</p>
              <p><strong className="text-teal-400">Prior investigations:</strong> {documents.map((doc) => doc.extractedData.investigations || "").filter(Boolean).join(", ") || "Not provided"}</p>
            </div>
          </div>

          {/* AYUSH Assessment */}
          <div className="lab-card lab-card-accent p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-teal-500/15 border border-teal-500/30 flex items-center justify-center">
                  <Leaf className="w-4 h-4 text-teal-400" strokeWidth={1.6} />
                </div>
                <div>
                  <h3 className="font-bold tracking-tight-x">AYUSH Assessment</h3>
                  <span className="data-figure text-[10px] text-muted-foreground tracking-widest">
                    DASHAVIDHA PARIKSHA · {answeredAYUSH.length}/10
                  </span>
                </div>
              </div>
              <RingProgress
                value={answeredAYUSH.length * 10}
                size={48}
                thickness={4}
                variant="accent"
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.entries(ayushLabels).map(([key, label]) => {
                const value = ayush[key as keyof typeof ayush];
                return (
                  <div key={key} className={`p-3 rounded-md border ${value ? "bg-teal-500/8 border-teal-500/25" : "bg-bio-base/40 border-bio-border/30"}`}>
                    <span className="data-figure text-[10px] tracking-widest text-muted-foreground block mb-1">
                      {label}
                    </span>
                    <p className={`text-sm ${value ? "" : "text-muted-foreground/50 italic"}`}>
                      {value || "Not assessed"}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Document Findings */}
          <div className="lab-card lab-card-accent p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-teal-500/15 border border-teal-500/30 flex items-center justify-center">
                <FileCheck className="w-4 h-4 text-teal-400" strokeWidth={1.6} />
              </div>
              <h3 className="font-bold tracking-tight-x">Document Findings</h3>
            </div>
            {documents.length > 0 ? (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div key={doc.id} className="p-3 rounded-md bg-teal-500/8 border border-teal-500/25">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-teal-400" />
                      <p className="text-sm font-medium">{doc.fileName}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="data-figure text-[10px] tracking-widest text-muted-foreground">DATE</span>
                        <p className="mt-0.5">{doc.extractedData.date || "—"}</p>
                      </div>
                      <div>
                        <span className="data-figure text-[10px] tracking-widest text-muted-foreground">MEDICATION</span>
                        <p className="mt-0.5">{doc.extractedData.medication || "—"}</p>
                      </div>
                      <div>
                        <span className="data-figure text-[10px] tracking-widest text-muted-foreground">OBSERVATION</span>
                        <p className="mt-0.5">{doc.extractedData.observation || "—"}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">No documents uploaded</p>
            )}
          </div>

          <div className="lab-card lab-card-accent p-6">
            <h3 className="font-bold tracking-tight-x mb-3">Ahara-Vihara</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {(["diet", "sleep", "bowelHabits", "dailyRoutine", "substances"] as const).map((field) => (
                <p key={field}><strong className="text-amber-warn">{field}:</strong> {aharaVihara[field] || "Not provided"}</p>
              ))}
            </div>
          </div>

          {/* Missing Information & Clinical Alerts */}
          {(missingInfo.length > 0 || clinicalAlerts.length > 0) && (
            <div className="lab-card lab-card-accent p-6 border-amber-warn/40">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-lg bg-amber-warn/15 border border-amber-warn/30 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-amber-warn" strokeWidth={1.6} />
                </div>
                <div>
                  <h3 className="font-bold tracking-tight-x">Case Completeness Engine</h3>
                  <span className="data-figure text-[10px] text-muted-foreground tracking-widest">
                    GAPS · ALERTS
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                {missingInfo.length > 0 && (
                  <div>
                    <p className="data-figure text-[10px] font-bold tracking-widest text-amber-warn mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-3 h-3" />
                      MISSING INFORMATION
                    </p>
                    {missingInfo.map((item, i) => (
                      <div key={i} className="flex items-start gap-2 mb-1">
                        <span className="text-amber-warn text-xs mt-1">•</span>
                        <p className="text-sm">{item}</p>
                      </div>
                    ))}
                  </div>
                )}
                {clinicalAlerts.length > 0 && (
                  <div>
                    <p className="data-figure text-[10px] font-bold tracking-widest text-red-critical mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-3 h-3" />
                      CLINICAL CONSISTENCY ALERT
                    </p>
                    {clinicalAlerts.map((item, i) => (
                      <div key={i} className="flex items-start gap-2 mb-1">
                        <span className="text-red-critical text-xs mt-1">•</span>
                        <p className="text-sm">{item}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* AI Priority & Triage */}
          {triage && (
            <div className="lab-card lab-card-accent p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-lg bg-trust-500/15 border border-trust-500/30 flex items-center justify-center">
                  <Activity className="w-4 h-4 text-trust-300" strokeWidth={1.6} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold tracking-tight-x">AI-Assisted Priority</h3>
                  <span className="data-figure text-[10px] text-muted-foreground tracking-widest">
                    RULE-BASED · EXPLAINABLE
                  </span>
                </div>
                <RadialGauge
                  value={Math.round(triage.confidence * 100)}
                  size={72}
                  thickness={6}
                  label="CONF"
                  unit="%"
                  variant={
                    triage.priority === "urgent"
                      ? "critical"
                      : triage.priority === "priority"
                        ? "warning"
                        : "stable"
                  }
                />
              </div>
              <div className="space-y-1.5">
                {triage.reasons.map((reason: string, i: number) => (
                  <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-md bg-trust-500/8 border border-trust-500/20">
                    <span className="data-figure text-[10px] text-trust-300 mt-0.5 tracking-widest">
                      F{(i + 1).toString().padStart(2, "0")}
                    </span>
                    <p className="text-xs text-foreground leading-relaxed">{reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Doctor Verification Status */}
          <div className="lab-card lab-card-accent p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-trust-500/15 border border-trust-500/30 flex items-center justify-center">
                <Stethoscope className="w-4 h-4 text-trust-300" strokeWidth={1.6} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold tracking-tight-x">Doctor Verification</h3>
                <span className="data-figure text-[10px] text-muted-foreground tracking-widest">
                  AWAITING CLINICIAN REVIEW
                </span>
              </div>
              <Sparkles className="w-4 h-4 text-trust-300 animate-blink-soft" />
            </div>
            <div className="p-4 rounded-md bg-bio-base/50 border border-trust-500/20 text-center">
              <p className="text-sm text-muted-foreground">
                Status:{" "}
                <span className="font-bold text-trust-300 tracking-widest">
                  {verification.status.toUpperCase()}
                </span>
              </p>
              <p className="data-figure text-[10px] text-muted-foreground mt-1 tracking-widest">
                DOCTOR REVIEW · CLINICAL AUTHORITY
              </p>
            </div>
          </div>

          {/* FHIR Integration Preview */}
          <div className="lab-card lab-card-accent p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-teal-500/15 border border-teal-500/30 flex items-center justify-center">
                <Link2 className="w-4 h-4 text-teal-400" strokeWidth={1.6} />
              </div>
              <div>
                <h3 className="font-bold tracking-tight-x">FHIR / ABDM Integration</h3>
                <span className="data-figure text-[10px] text-muted-foreground tracking-widest">
                  HL7 FHIR R4 · ABDM-READY
                </span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              This case sheet can be exported as an HL7 FHIR R4 Bundle and pushed to ABDM/ABHA health records.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="border-teal-500/30 hover:bg-teal-500/10"
              onClick={() => navigate("/integration")}
            >
              View FHIR Bundle Demo
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>

          <DisclaimerBanner type="warning" />
        </motion.div>

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between pb-8">
          <Button
            variant="outline"
            onClick={() => navigate("/patient/triage")}
            className="border-trust-500/30 hover:bg-trust-500/10"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            <span className="data-figure tracking-wider">BACK</span>
          </Button>

          <Button
            className="bg-gradient-to-r from-trust-500 to-teal-500 hover:from-trust-400 hover:to-teal-400 text-white border-0 glow-primary"
            disabled={isSending}
            onClick={async () => {
              setIsSending(true);
              try {
                const caseSheetId = await persistAllData();
                if (!caseSheetId) throw new Error("Failed to create case sheet");

                await enqueueCaseSheet({
                  caseSheetId: caseSheetId as any,
                  patientId: patientId as any,
                  priority: triage?.priority || "routine",
                  status: "waiting",
                });

                completeAssessment();
                setVerification({ status: "pending" });

                queueService.pushToQueue(usePatientStore.getState());

                navigate("/doctor/dashboard");
              } catch (error) {
                console.error("Failed to send to doctor:", error);
                setVerification({ status: "pending" });
              } finally {
                setIsSending(false);
              }
            }}
          >
            {isSending ? "Sending…" : "Send to Doctor Queue"}
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
