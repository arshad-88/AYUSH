import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { usePatientStore } from "@/store/patientStore";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Header } from "@/components/shared/Header";
import { StepProgress } from "@/components/shared/StepProgress";
import { PriorityBadge } from "@/components/shared/PriorityBadge";
import { DisclaimerBanner } from "@/components/shared/DisclaimerBanner";
import { getTriageService } from "@/services/serviceRegistry";
import { type Explainability } from "@/types";
import {
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  Clock,
  Loader2,
  Brain,
  ChevronRight,
  Cpu,
  Activity,
  Zap,
} from "lucide-react";
import {
  BiomarkerBar,
  DNASpinner,
  EkgWave,
  RadialGauge,
  RingProgress,
  StatusBar,
} from "@/components/scientific";

export default function Triage() {
  const navigate = useNavigate();
  const { chiefComplaint, socrates, age, timeline, documents, triage, setTriage, setStep, consultationId, id: patientId } =
    usePatientStore();
  const [isAnalyzing, setIsAnalyzing] = useState(!triage);
  const [explainability, setExplainability] = useState<Explainability | null>(null);

  // Load existing triage from Convex
  const existingTriage = useQuery(
    api.triageResults.getTriageByConsultation,
    consultationId ? { consultationId: consultationId as any } : "skip"
  );
  const createTriage = useMutation(api.triageResults.createTriage);

  useEffect(() => {
    if (existingTriage !== undefined) {
      if (existingTriage) {
        setTriage(existingTriage);
        setIsAnalyzing(false);
        // Build explainability from existing
        const explanation: Explainability = {
          factors: [
            { factor: "Symptom Severity", impact: "high", description: "Based on severity scale", detected: existingTriage.reasons.some((r: string) => r.toLowerCase().includes("severity")) },
            { factor: "Onset", impact: "medium", description: "How symptoms started", detected: existingTriage.reasons.some((r: string) => r.toLowerCase().includes("onset")) }
          ],
          overallConfidence: existingTriage.confidence,
          disclaimer: "AI-assisted priority recommendation. Doctor verification required."
        };
        setExplainability(explanation);
      } else if (!triage) {
        // No existing, run triage
        runTriage();
      }
    }
  }, [existingTriage]);

  const runTriage = async () => {
    setIsAnalyzing(true);

    const triageService = getTriageService();
    const result = await triageService.calculatePriority({
      chiefComplaint,
      severity: socrates.severity,
      onset: socrates.onset,
      associatedSymptoms: socrates.associatedSymptoms,
    } as any);

    setTriage(result);
    const explanation: Explainability = {
      factors: [
        { factor: "Symptom Severity", impact: "high", description: "Based on severity scale", detected: result.reasons.some((r: string) => r.toLowerCase().includes("severity")) },
        { factor: "Onset", impact: "medium", description: "How symptoms started", detected: result.reasons.some((r: string) => r.toLowerCase().includes("onset")) }
      ],
      overallConfidence: result.confidence,
      disclaimer: "AI-assisted priority recommendation. Doctor verification required."
    };
    setExplainability(explanation);
    setIsAnalyzing(false);

    // Persist to Convex
    if (consultationId && patientId) {
      try {
        await createTriage({
          patientId: patientId as any,
          consultationId: consultationId as any,
          priority: result.priority as any,
          reasons: result.reasons,
          confidence: result.confidence,
          timestamp: result.timestamp || new Date().toISOString(),
        });
      } catch (err) {
        console.error("Failed to save triage:", err);
      }
    }
  };

  const priorityConfig: Record<string, any> = {
    routine: {
      icon: CheckCircle,
      color: "text-mint-400",
      bg: "bg-mint-500/10",
      border: "border-mint-500/30",
    },
    priority: {
      icon: Clock,
      color: "text-amber-warn",
      bg: "bg-amber-warn/10",
      border: "border-amber-warn/30",
    },
    urgent: {
      icon: AlertTriangle,
      color: "text-red-critical",
      bg: "bg-red-urgent/10",
      border: "border-red-urgent/30",
    },
  };

  return (
    <div className="min-h-screen relative">
      <div className="absolute inset-0 surface-grid opacity-15 pointer-events-none" />
      <Header />
      <div className="relative max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <StepProgress
            currentStep="triage"
            completedSteps={["login", "consent", "interview", "ayush", "documents", "timeline"]}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="lab-card lab-card-accent p-6 relative overflow-hidden">
            <div className="absolute top-3 right-3">
              <StatusBar latency="42ms" sessionId="TRIAGE-ENGINE" />
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-trust-500/20 to-teal-500/20 border border-trust-500/30 flex items-center justify-center glow-primary">
                <Brain className="w-6 h-6 text-trust-300" strokeWidth={1.6} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="data-figure text-[10px] tracking-widest text-mint-400">● ENGINE ACTIVE</span>
                </div>
                <h1 className="text-xl font-bold tracking-tight-x">
                  AI-Assisted Triage
                </h1>
                <span className="data-figure text-[10px] text-muted-foreground tracking-widest">
                  RULE-BASED PRIORITY · DETERMINISTIC
                </span>
              </div>
            </div>
            <div className="mt-5">
              <EkgWave height={28} showAxis={false} variant="accent" />
            </div>
          </div>

          {/* Analyzing State */}
          {isAnalyzing && (
            <div className="lab-card lab-card-accent p-8 text-center relative overflow-hidden">
              <div className="absolute inset-0 surface-grid-fine opacity-30 pointer-events-none" />
              <div className="relative flex flex-col items-center gap-4">
                <DNASpinner size="lg" />
                <div>
                  <p className="text-sm font-bold tracking-tight-x">Analyzing Clinical Data</p>
                  <p className="data-figure text-[10px] text-muted-foreground tracking-widest mt-1">
                    RULE-BASED TRIAGE ENGINE
                  </p>
                </div>
                <div className="flex gap-2 flex-wrap justify-center">
                  {[
                    { label: "Severity", icon: AlertTriangle },
                    { label: "Duration", icon: Clock },
                    { label: "History", icon: Activity },
                    { label: "Red Flags", icon: Zap },
                  ].map((step, i) => (
                    <motion.div
                      key={step.label}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.3 }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-trust-500/10 border border-trust-500/30"
                    >
                      <step.icon className="w-3 h-3 text-trust-300" />
                      <span className="data-figure text-[10px] tracking-widest text-trust-300">
                        {step.label}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Result */}
          {triage && !isAnalyzing && (
            <>
              {/* Priority Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className={`lab-card lab-card-accent p-6 relative overflow-hidden ${
                  triage.priority === "urgent"
                    ? "border-red-urgent/40"
                    : triage.priority === "priority"
                      ? "border-amber-warn/40"
                      : "border-mint-500/40"
                }`}>
                  {triage.priority === "urgent" && (
                    <div className="absolute inset-0 bg-gradient-to-r from-red-urgent/8 via-transparent to-transparent animate-data-pulse pointer-events-none" />
                  )}
                  <div className="relative flex items-start justify-between mb-5 flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <RadialGauge
                        value={Math.round(triage.confidence * 100)}
                        size={100}
                        label="CONFIDENCE"
                        unit="%"
                        variant={
                          triage.priority === "urgent"
                            ? "critical"
                            : triage.priority === "priority"
                              ? "warning"
                              : "stable"
                        }
                        thickness={8}
                      />
                      <div>
                        <span className="data-figure text-[10px] tracking-widest text-muted-foreground">
                          PRIORITY ASSESSMENT
                        </span>
                        <h2 className={`text-3xl font-bold tracking-tight-x mt-1 ${
                          triage.priority === "urgent"
                            ? "text-red-critical"
                            : triage.priority === "priority"
                              ? "text-amber-warn"
                              : "text-mint-400"
                        }`}>
                          {triage.priority.toUpperCase()}
                        </h2>
                        <span className="data-figure text-[10px] tracking-widest text-muted-foreground mt-1 block">
                          {triage.priority === "urgent" ? "IMMEDIATE ATTENTION" : triage.priority === "priority" ? "WITHIN HOURS" : "STANDARD FLOW"}
                        </span>
                      </div>
                    </div>
                    <PriorityBadge priority={(triage?.priority as any) || "routine"} size="lg" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                      <Cpu className="w-3 h-3 text-trust-400" />
                      <span className="eyebrow">WHY THIS PRIORITY · FACTORS</span>
                    </div>
                    {triage.reasons.map((reason: string, i: number) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-start gap-2.5 p-2.5 rounded-md bg-trust-500/8 border border-trust-500/20"
                      >
                        <span className="data-figure text-[10px] text-trust-300 mt-0.5 tracking-widest">
                          F{(i + 1).toString().padStart(2, "0")}
                        </span>
                        <span className="text-sm text-foreground leading-relaxed">{reason}</span>
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-5 pt-5 border-t border-trust-500/15">
                    <BiomarkerBar
                      value={Math.round(triage.confidence * 100)}
                      label="MODEL CONFIDENCE"
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
                </div>
              </motion.div>

              {/* Explainability */}
              {explainability && (
                <div className="lab-card lab-card-accent p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-9 h-9 rounded-lg bg-trust-500/15 border border-trust-500/30 flex items-center justify-center">
                      <Cpu className="w-4 h-4 text-trust-300" strokeWidth={1.6} />
                    </div>
                    <div>
                      <h3 className="font-bold tracking-tight-x">Explainable AI · Factor Analysis</h3>
                      <span className="data-figure text-[10px] text-muted-foreground tracking-widest">
                        WEIGHTED CONTRIBUTORS
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {explainability.factors.map((factor, i) => (
                      <div
                        key={i}
                        className={`flex items-center gap-3 p-3 rounded-md border ${
                              factor.detected
                                ? "bg-teal-500/8 border-teal-500/25"
                                : "bg-bio-base/40 border-bio-border/30"
                            }`}
                      >
                        <div className={`w-9 h-9 rounded-md flex items-center justify-center border ${
                          factor.detected
                            ? "bg-teal-500/15 border-teal-500/30 text-teal-400"
                            : "bg-bio-base border-bio-border/40 text-muted-foreground"
                        }`}>
                          {factor.detected ? (
                            <CheckCircle className="w-4 h-4" strokeWidth={2.2} />
                          ) : (
                            <span className="data-figure text-xs">—</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold">{factor.factor}</p>
                          <p className="data-figure text-[10px] text-muted-foreground tracking-wider mt-0.5">
                            {factor.description}
                          </p>
                        </div>
                        <span className={`data-figure text-[10px] font-bold tracking-widest px-2 py-1 rounded-md border ${
                          factor.impact === "high"
                            ? "tag-critical"
                            : factor.impact === "medium"
                              ? "tag-urgent"
                              : "tag-neutral"
                        }`}>
                          {factor.impact}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <DisclaimerBanner
                type="ai-generated"
                message="AI-assisted priority recommendation. The doctor retains final clinical decision authority."
              />
            </>
          )}
        </motion.div>

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between pb-8">
          <Button
            variant="outline"
            onClick={() => navigate("/patient/timeline")}
            className="border-trust-500/30 hover:bg-trust-500/10"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            <span className="data-figure tracking-wider">BACK</span>
          </Button>

          {!isAnalyzing && triage && (
            <Button
              className="bg-gradient-to-r from-trust-500 to-teal-500 hover:from-trust-400 hover:to-teal-400 text-white border-0 glow-primary"
              onClick={() => {
                setStep("casesheet");
                navigate("/patient/casesheet");
              }}
            >
              View Case Sheet
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
