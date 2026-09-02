import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { usePatientStore } from "@/store/patientStore";
import { Header } from "@/components/shared/Header";
import { PriorityBadge } from "@/components/shared/PriorityBadge";
import { DisclaimerBanner } from "@/components/shared/DisclaimerBanner";
import { getFhirService, getAbdmService } from "@/services/serviceRegistry";
import { type FHIRBundle } from "@/types";
import {
  ArrowLeft,
  User,
  Stethoscope,
  Brain,
  Leaf,
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Edit3,
  ArrowRight,
  Link2,
  Loader2,
  ChevronRight,
  Shield,
  Activity,
  Dna,
  Pill,
  Mic,
  Lock,
  Cpu,
} from "lucide-react";
import {
  BiomarkerBar,
  EkgWave,
  RadialGauge,
  RingProgress,
  StatusBar,
  AreaSparkline,
} from "@/components/scientific";

const socratesLabels: Record<string, { label: string; description: string }> = {
  site: { label: "S · Site", description: "Where the pain is located" },
  onset: { label: "O · Onset", description: "When it started" },
  character: { label: "C · Character", description: "How it feels" },
  radiation: { label: "R · Radiation", description: "Where it spreads" },
  associatedSymptoms: { label: "A · Associated", description: "Other symptoms" },
  timing: { label: "T · Timing", description: "Pattern over time" },
  exacerbatingFactors: { label: "E · Exacerbating", description: "What makes it worse" },
  relievingFactors: { label: "R · Relieving", description: "What makes it better" },
  severity: { label: "S · Severity", description: "Intensity /10" },
};

const ayushLabels: Record<string, { label: string; sanskrit: string }> = {
  prakriti: { label: "Body Constitution", sanskrit: "Prakriti" },
  vikriti: { label: "Current Imbalance", sanskrit: "Vikriti" },
  sara: { label: "Tissue Quality", sanskrit: "Sara" },
  samhanana: { label: "Body Build", sanskrit: "Samhanana" },
  pramana: { label: "Proportions", sanskrit: "Pramana" },
  satmya: { label: "Adaptability", sanskrit: "Satmya" },
  satva: { label: "Mental Strength", sanskrit: "Satva" },
  aharaShakti: { label: "Digestive Power", sanskrit: "Ahara Shakti" },
  vyayamaShakti: { label: "Exercise Capacity", sanskrit: "Vyayama Shakti" },
  vaya: { label: "Age", sanskrit: "Vaya" },
};

export default function PatientDetail() {
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
    triage,
    verification,
    setVerification,
  } = store;

  const [overrideReason, setOverrideReason] = useState("");
  const [showOverrideForm, setShowOverrideForm] = useState(false);
  const [fhirBundle, setFhirBundle] = useState<FHIRBundle | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [abdmResult, setAbdmResult] = useState<string | null>(null);

  const handleVerify = (action: "confirmed" | "edited" | "rejected") => {
    if (action === "edited") {
      setShowOverrideForm(true);
      return;
    }
    setVerification({
      status: action,
      verifiedAt: new Date().toISOString(),
    });
  };

  const handleOverride = () => {
    setVerification({
      status: "edited",
      overridePriority:
        triage?.priority === "urgent"
          ? "priority"
          : triage?.priority === "priority"
            ? "routine"
            : "priority",
      overrideReason,
      verifiedAt: new Date().toISOString(),
    });
    setShowOverrideForm(false);
    setOverrideReason("");
  };

  const handleGenerateFHIR = async () => {
    setIsGenerating(true);
    const fhirServiceInstance = getFhirService();
    const bundle = await fhirServiceInstance.generateBundle({
      patient: { id: name || "demo", name: name || "Demo Patient", age: age || 40, gender: gender || "Male", abhaId: abhaId || "DEMO-ABHA", mobileNumber: store.mobileNumber },
      chiefComplaint: chiefComplaint || "Demo complaint",
      socrates,
      ayush,
      triage: triage || { priority: "routine", reasons: [] },
      documents: documents.map((d: { extractedData: Record<string, string> }) => ({ extractedData: d.extractedData })),
    });
    setFhirBundle(bundle);
    setIsGenerating(false);
  };

  const handleABDMPush = async () => {
    if (!fhirBundle) return;
    setIsGenerating(true);
    const abdmService = getAbdmService();
    const result = await abdmService.pushHealthRecord(fhirBundle);
    setAbdmResult(result.message);
    setIsGenerating(false);
  };

  const answeredSOCRATES = Object.entries(socrates).filter(([_, v]) => v);
  const answeredAYUSH = Object.entries(ayush).filter(([_, v]) => v);
  const socratesCompletion = Math.round((answeredSOCRATES.length / 9) * 100);
  const ayushCompletion = Math.round((answeredAYUSH.length / 10) * 100);
  const dataCompletion = Math.round(
    ((answeredSOCRATES.length / 9) * 0.5 + (answeredAYUSH.length / 10) * 0.3 + (documents.length > 0 ? 0.2 : 0)) * 100,
  );

  return (
    <div className="min-h-screen relative">
      <div className="absolute inset-0 surface-grid opacity-15 pointer-events-none" />
      <Header />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Back nav */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/doctor/dashboard")}
            className="hover:bg-trust-500/10"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            <span className="data-figure tracking-wider">BACK TO CONSOLE</span>
          </Button>

          {/* Patient identity */}
          <div className="lab-card lab-card-accent p-6 sm:p-8">
            <div className="grid lg:grid-cols-[1fr_auto] gap-6 items-start">
              <div className="flex items-start gap-4">
                <div className="relative w-16 h-16 rounded-xl bg-gradient-to-br from-trust-500/30 to-teal-500/30 border border-trust-500/40 flex items-center justify-center">
                  <User className="w-7 h-7 text-trust-300" strokeWidth={1.6} />
                  <span className="absolute inset-0 rounded-xl border-2 border-trust-400/40 animate-data-pulse" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="data-figure text-[10px] tracking-widest text-mint-400">● ACTIVE</span>
                    <span className="text-trust-500/30">·</span>
                    <span className="data-figure text-[10px] tracking-widest text-muted-foreground">PT-2418-A</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight-x mb-2">
                    {name || "Patient"}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span className="data-figure">{age}y · {gender}</span>
                    <span className="text-trust-500/30">·</span>
                    <span className="flex items-center gap-1.5">
                      <Activity className="w-3 h-3" />
                      <span className="data-figure tracking-wider">{language}</span>
                    </span>
                    <span className="text-trust-500/30">·</span>
                    <span className="flex items-center gap-1.5">
                      <Dna className="w-3 h-3" />
                      <span className="data-figure tracking-wider">ABHA · {abhaId || "—"}</span>
                    </span>
                  </div>
                  <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-trust-500/10 border border-trust-500/30">
                    <Mic className="w-3 h-3 text-trust-300" />
                    <span className="data-figure text-[10px] tracking-widest text-trust-300">CHIEF COMPLAINT</span>
                    <span className="text-sm font-medium">{chiefComplaint || "—"}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 items-end">
                <PriorityBadge priority={(triage?.priority as any) || "routine"} size="lg" />
                <div className={`px-3 py-1.5 rounded-md data-figure text-[10px] tracking-widest ${
                  verification.status === "confirmed"
                    ? "tag-stable"
                    : verification.status === "edited"
                      ? "tag-urgent"
                      : verification.status === "rejected"
                        ? "tag-critical"
                        : "tag-neutral"
                }`}>
                  {verification.status.toUpperCase()}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-trust-500/15">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <BiomarkerBar value={socratesCompletion} label="SOCRATES" unit="%" variant="primary" size="sm" />
                <BiomarkerBar value={ayushCompletion} label="AYUSH" unit="%" variant="accent" size="sm" />
                <BiomarkerBar value={documents.length > 0 ? 100 : 0} label="DOCS" unit="%" variant="warning" size="sm" />
                <BiomarkerBar value={dataCompletion} label="OVERALL" unit="%" variant="stable" size="sm" />
              </div>
            </div>
          </div>

          {/* Two column body */}
          <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6">
            {/* LEFT: SOCRATES + AYUSH */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="lab-card lab-card-accent p-6"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-trust-500/15 border border-trust-500/30 flex items-center justify-center">
                      <Brain className="w-4 h-4 text-trust-300" strokeWidth={1.6} />
                    </div>
                    <div>
                      <h3 className="font-bold tracking-tight-x">SOCRATES Assessment</h3>
                      <span className="data-figure text-[10px] text-muted-foreground tracking-widest">
                        ADAPTIVE INTERVIEW · {answeredSOCRATES.length}/9
                      </span>
                    </div>
                  </div>
                  <RingProgress value={socratesCompletion} size={48} thickness={4} variant="primary" />
                </div>
                <div className="grid sm:grid-cols-2 gap-2">
                  {Object.entries(socratesLabels).map(([key, info]) => {
                    const value = socrates[key as keyof typeof socrates];
                    return (
                      <div
                        key={key}
                        className={`p-3 rounded-md border transition-all ${
                          value
                            ? "bg-trust-500/8 border-trust-500/30"
                            : "bg-bio-base/30 border-bio-border/40"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="data-figure text-[10px] tracking-widest text-trust-300">
                            {info.label}
                          </span>
                          {value && <CheckCircle className="w-3 h-3 text-mint-400" />}
                        </div>
                        <p className={`text-xs ${value ? "text-foreground" : "text-muted-foreground/50 italic"}`}>
                          {value || "Not yet captured"}
                        </p>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-5 pt-4 border-t border-trust-500/15">
                  <EkgWave height={32} showAxis variant="accent" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="lab-card lab-card-accent p-6"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-teal-500/15 border border-teal-500/30 flex items-center justify-center">
                      <Leaf className="w-4 h-4 text-teal-400" strokeWidth={1.6} />
                    </div>
                    <div>
                      <h3 className="font-bold tracking-tight-x">AYUSH Assessment</h3>
                      <span className="data-figure text-[10px] text-muted-foreground tracking-widest">
                        DASHVIDHA PARIKSHA · {answeredAYUSH.length}/10
                      </span>
                    </div>
                  </div>
                  <RingProgress value={ayushCompletion} size={48} thickness={4} variant="accent" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.entries(ayushLabels).map(([key, info]) => {
                    const value = (ayush as any)[key];
                    return (
                      <div
                        key={key}
                        className={`p-3 rounded-md border ${
                          value
                            ? "bg-teal-500/8 border-teal-500/30"
                            : "bg-bio-base/30 border-bio-border/40"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="data-figure text-[10px] tracking-widest text-teal-400">
                            {info.sanskrit}
                          </span>
                          {value && <CheckCircle className="w-3 h-3 text-mint-400" />}
                        </div>
                        <p className="text-[10px] text-muted-foreground">{info.label}</p>
                        <p className={`text-xs mt-1 ${value ? "text-foreground" : "text-muted-foreground/50 italic"}`}>
                          {value || "—"}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </div>

            {/* RIGHT: AI explainability, docs, missing */}
            <div className="space-y-6">
              {triage && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="lab-card lab-card-accent p-6"
                >
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-9 h-9 rounded-lg bg-trust-500/15 border border-trust-500/30 flex items-center justify-center">
                      <Cpu className="w-4 h-4 text-trust-300" strokeWidth={1.6} />
                    </div>
                    <div>
                      <h3 className="font-bold tracking-tight-x">Why This Priority?</h3>
                      <span className="data-figure text-[10px] text-muted-foreground tracking-widest">
                        EXPLAINABLE AI
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-around mb-5">
                    <RadialGauge
                      value={Math.round(triage.confidence * 100)}
                      label="CONFIDENCE"
                      unit="%"
                      variant="primary"
                      size={110}
                      thickness={8}
                    />
                    <div className="text-center">
                      <div className="data-figure text-[10px] text-muted-foreground tracking-widest">CONFIDENCE</div>
                      <div className="data-figure text-3xl font-bold text-trust-300 mt-1">
                        {Math.round(triage.confidence * 100)}<span className="text-base">%</span>
                      </div>
                      <div className="data-figure text-[9px] text-amber-warn tracking-widest mt-1">SIMULATED</div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    {triage.reasons.map((reason: string, i: number) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 p-2.5 rounded-md bg-trust-500/8 border border-trust-500/20"
                      >
                        <span className="data-figure text-[9px] text-trust-300 mt-0.5">
                          F{(i + 1).toString().padStart(2, "0")}
                        </span>
                        <span className="text-xs text-foreground leading-relaxed">{reason}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="lab-card lab-card-accent p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-lg bg-teal-500/15 border border-teal-500/30 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-teal-400" strokeWidth={1.6} />
                  </div>
                  <div>
                    <h3 className="font-bold tracking-tight-x">Documents</h3>
                    <span className="data-figure text-[10px] text-muted-foreground tracking-widest">
                      OCR EXTRACTED · {documents.length}
                    </span>
                  </div>
                </div>
                {documents.length > 0 ? (
                  <div className="space-y-2">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-3 rounded-md bg-teal-500/8 border border-teal-500/20 hover-lift"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-semibold">{doc.fileName}</p>
                          <Pill className="w-3.5 h-3.5 text-teal-400" />
                        </div>
                        <div className="grid grid-cols-2 gap-2 data-figure text-[10px] text-muted-foreground">
                          <span>DATE · {doc.extractedData.date || "—"}</span>
                          <span>RX · {doc.extractedData.medication || "—"}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-xs italic">No documents uploaded</p>
                  </div>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="lab-card lab-card-accent p-6 border-amber-warn/30"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-lg bg-amber-warn/15 border border-amber-warn/30 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-amber-warn" strokeWidth={1.6} />
                  </div>
                  <div>
                    <h3 className="font-bold tracking-tight-x">Missing Information</h3>
                    <span className="data-figure text-[10px] text-amber-warn tracking-widest">CLINICAL GAPS</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {answeredSOCRATES.length < 5 && (
                    <div className="flex items-center gap-2 text-xs">
                      <ChevronRight className="w-3 h-3 text-amber-warn" />
                      <span>SOCRATES incomplete ({answeredSOCRATES.length}/9)</span>
                    </div>
                  )}
                  {answeredAYUSH.length < 5 && (
                    <div className="flex items-center gap-2 text-xs">
                      <ChevronRight className="w-3 h-3 text-amber-warn" />
                      <span>AYUSH incomplete ({answeredAYUSH.length}/10)</span>
                    </div>
                  )}
                  {documents.length === 0 && (
                    <div className="flex items-center gap-2 text-xs">
                      <ChevronRight className="w-3 h-3 text-amber-warn" />
                      <span>No medical documents uploaded</span>
                    </div>
                  )}
                  {answeredSOCRATES.length >= 5 && answeredAYUSH.length >= 5 && documents.length > 0 && (
                    <div className="flex items-center gap-2 text-xs text-mint-400">
                      <CheckCircle className="w-3 h-3" />
                      <span>All clinical data complete</span>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>

          {/* Verification panel */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="lab-card lab-card-accent p-6"
          >
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-trust-500/15 border border-trust-500/30 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-trust-300" strokeWidth={1.6} />
                </div>
                <div>
                  <h3 className="font-bold tracking-tight-x">Doctor Verification</h3>
                  <span className="data-figure text-[10px] text-muted-foreground tracking-widest">
                    AI-ASSISTED · DOCTOR DECIDES
                  </span>
                </div>
              </div>
              <StatusBar latency="38ms" sessionId="DOCTOR-CONSOLE" />
            </div>

            {verification.status !== "pending" && verification.verifiedAt && (
              <div className="mb-4 p-3 rounded-md bg-mint-500/10 border border-mint-500/30">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-mint-400" />
                  <p className="text-sm font-semibold">
                    {verification.status === "confirmed"
                      ? "Confirmed"
                      : verification.status === "edited"
                        ? "Edited & Confirmed"
                        : "Rejected"}{" "}
                    · {new Date(verification.verifiedAt).toLocaleString("en-IN")}
                  </p>
                </div>
                {verification.overrideReason && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Reason: {verification.overrideReason}
                  </p>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <Button
                className="bg-gradient-to-r from-mint-500 to-teal-500 hover:from-mint-400 hover:to-teal-400 text-bio-base border-0"
                onClick={() => handleVerify("confirmed")}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Confirm Case Sheet
              </Button>
              <Button
                variant="outline"
                className="border-amber-warn/40 text-amber-warn hover:bg-amber-warn/10"
                onClick={() => handleVerify("edited")}
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit / Override
              </Button>
              <Button
                variant="outline"
                className="border-red-urgent/40 text-red-critical hover:bg-red-urgent/10"
                onClick={() => handleVerify("rejected")}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </Button>
            </div>

            {showOverrideForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-4 space-y-3"
              >
                <div>
                  <span className="eyebrow block mb-2">OVERRIDE REASON</span>
                  <Textarea
                    placeholder="Document your clinical reasoning for the override..."
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                    className="min-h-[100px] bg-bio-base/50 border-trust-500/30"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="bg-amber-warn hover:bg-amber-warn/90 text-bio-base border-0"
                    onClick={handleOverride}
                    disabled={!overrideReason}
                  >
                    <Lock className="w-3.5 h-3.5 mr-1" />
                    Submit Override · Audit Logged
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowOverrideForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* FHIR / ABDM */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lab-card lab-card-accent p-6"
          >
            <div className="flex items-center gap-3 mb-4">
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

            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                size="sm"
                className="border-trust-500/30 hover:bg-trust-500/10"
                onClick={handleGenerateFHIR}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <Loader2 className="w-3 h-3 animate-spin mr-1" />
                ) : (
                  <FileText className="w-3 h-3 mr-1" />
                )}
                Generate FHIR Bundle
              </Button>
              {fhirBundle && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-teal-500/30 hover:bg-teal-500/10"
                  onClick={handleABDMPush}
                  disabled={isGenerating}
                >
                  <Link2 className="w-3 h-3 mr-1" />
                  Push to ABHA PHR
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                className="border-trust-500/30 hover:bg-trust-500/10"
                onClick={() => navigate("/integration")}
              >
                Full FHIR Demo
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>

            {fhirBundle && (
              <div className="mt-4 p-3 rounded-md bg-bio-base border border-trust-500/20">
                <div className="flex items-center justify-between mb-2">
                  <p className="data-figure text-[10px] tracking-widest text-trust-300">
                    FHIR R4 BUNDLE · {fhirBundle.entry.length} RESOURCES
                  </p>
                  <span className="data-figure text-[9px] text-mint-400 tracking-widest">● READY</span>
                </div>
                <pre className="data-figure text-[10px] text-muted-foreground overflow-auto max-h-40">
                  {JSON.stringify(fhirBundle, null, 2).slice(0, 800)}...
                </pre>
              </div>
            )}

            {abdmResult && (
              <div className="mt-3 p-3 rounded-md tag-info text-xs">
                {abdmResult}
              </div>
            )}

            <div className="mt-4">
              <DisclaimerBanner type="simulated" />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}