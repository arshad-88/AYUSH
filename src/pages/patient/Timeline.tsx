import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { usePatientStore } from "@/store/patientStore";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Header } from "@/components/shared/Header";
import { StepProgress } from "@/components/shared/StepProgress";
import { DisclaimerBanner } from "@/components/shared/DisclaimerBanner";
import {
  ArrowRight,
  ArrowLeft,
  Clock,
  Stethoscope,
  Pill,
  TestTube,
  ClipboardList,
  Activity,
  Dna,
} from "lucide-react";
import {
  StatusBar,
  ParticleField,
} from "@/components/scientific";

const typeConfig: Record<string, { icon: typeof Stethoscope; color: string; bg: string; border: string }> = {
  consultation: { icon: Stethoscope, color: "text-trust-300", bg: "bg-trust-500/15", border: "border-trust-500/40" },
  medication: { icon: Pill, color: "text-teal-400", bg: "bg-teal-500/15", border: "border-teal-500/40" },
  investigation: { icon: TestTube, color: "text-amber-warn", bg: "bg-amber-warn/15", border: "border-amber-warn/40" },
  assessment: { icon: ClipboardList, color: "text-red-critical", bg: "bg-red-urgent/15", border: "border-red-urgent/40" },
  encounter: { icon: Activity, color: "text-trust-300", bg: "bg-trust-500/15", border: "border-trust-500/40" },
  lab: { icon: TestTube, color: "text-amber-warn", bg: "bg-amber-warn/15", border: "border-amber-warn/40" },
  observation: { icon: Dna, color: "text-mint-400", bg: "bg-mint-500/15", border: "border-mint-500/40" },
};

export default function Timeline() {
  const navigate = useNavigate();
  const { timeline, documents, setStep, id: patientId } = usePatientStore();

  // Hydrate timeline from Convex
  const convexTimeline = useQuery(
    api.timelineEvents.getTimelineByPatient,
    patientId ? { patientId: patientId as any } : "skip"
  );
  useEffect(() => {
    if (convexTimeline !== undefined) {
      usePatientStore.setState({ timeline: convexTimeline });
    }
  }, [convexTimeline]);

  // Timeline events are now persisted in Convex; no longer derived from documents.
  // The store's timeline is hydrated from Convex in the useEffect above.
  const effectiveTimeline = timeline;

  const parseTimelineDate = (value?: string) => {
    if (!value || value === "Date unavailable" || value === "Not detected") return null;
    const normalized = value.trim();
    const actualDate = normalized.startsWith("~") ? normalized.slice(1) : normalized;
    const parsed = new Date(actualDate);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const sortedTimeline = [...effectiveTimeline].sort((a, b) => {
    const aDate = parseTimelineDate(a.date);
    const bDate = parseTimelineDate(b.date);

    if (!aDate && !bDate) return 0;
    if (!aDate) return 1;
    if (!bDate) return -1;
    return bDate.getTime() - aDate.getTime();
  });

  const undatedRecords = (documents ?? []).filter((doc) => {
    const dateValue = doc.extractedData?.date;
    return !dateValue || dateValue === "Date unavailable" || dateValue === "Not detected";
  });

  return (
    <div className="min-h-screen relative overflow-hidden">
      <ParticleField density="low" opacity={0.2} />
      <div className="absolute inset-0 surface-grid opacity-15 pointer-events-none" />
      <Header />
      <div className="relative max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <StepProgress
            currentStep="timeline"
            completedSteps={["login", "consent", "interview", "ayush", "documents"]}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="lab-card lab-card-accent p-6 relative overflow-hidden">
            <div className="absolute top-3 right-3">
              <StatusBar latency="42ms" sessionId="TIMELINE-VIEW" />
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-trust-500/20 to-teal-500/20 border border-trust-500/30 flex items-center justify-center glow-primary">
                <Clock className="w-6 h-6 text-trust-300" strokeWidth={1.6} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="data-figure text-[10px] tracking-widest text-mint-400">● CHRONOLOGICAL</span>
                </div>
                <h1 className="text-xl font-bold tracking-tight-x">
                  Medical Timeline
                </h1>
                <span className="data-figure text-[10px] text-muted-foreground tracking-widest">
                  HEALTH HISTORY · ORGANIZED
                </span>
              </div>
            </div>
          </div>

          {sortedTimeline.length > 0 ? (
            <div className="space-y-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-6 h-px bg-trust-500/50" />
                  <span className="eyebrow">CLINICAL TIMELINE</span>
                  <span className="w-6 h-px bg-trust-500/50" />
                </div>
                <div className="relative">
                  <div className="absolute left-[20px] top-0 bottom-0 w-px bg-gradient-to-b from-trust-500/50 via-teal-500/30 to-transparent" />

                  <div className="space-y-5">
                    {sortedTimeline.map((event, index) => {
                      const config = typeConfig[event.type] || typeConfig.encounter;
                      const Icon = config.icon;
                      const validDate = parseTimelineDate(event.date);
                      const displayDate = !event.date || event.date === "Date unavailable" || event.date === "Not detected"
                        ? "Date unavailable"
                        : event.date.startsWith("~")
                          ? event.date
                          : validDate && !Number.isNaN(validDate.getTime())
                            ? validDate.toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })
                            : event.date;

                      return (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="relative flex items-start gap-4 pl-0"
                        >
                          <div className={`relative z-10 w-10 h-10 rounded-full ${config.bg} ${config.border} border flex items-center justify-center flex-shrink-0 ring-4 ring-bio-base`}>
                            <Icon className={`w-4 h-4 ${config.color}`} strokeWidth={1.6} />
                          </div>

                          <div className="lab-card lab-card-accent flex-1 p-4">
                            <div className="flex items-start justify-between mb-2 gap-2 flex-wrap">
                              <div>
                                <p className="data-figure text-[10px] text-muted-foreground tracking-widest">
                                  {displayDate}
                                </p>
                                <h3 className="text-sm font-bold tracking-tight-x mt-0.5">
                                  {event.title}
                                </h3>
                              </div>
                              <span className={`data-figure text-[10px] font-semibold tracking-widest px-2 py-1 rounded-md border ${config.bg} ${config.border} ${config.color}`}>
                                {event.type.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {event.description}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {undatedRecords.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-6 h-px bg-amber-warn/50" />
                    <span className="eyebrow">UNDATED RECORDS</span>
                    <span className="w-6 h-px bg-amber-warn/50" />
                  </div>
                  <div className="space-y-3">
                    {undatedRecords.map((doc) => (
                      <div key={doc.id} className="lab-card lab-card-accent p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-bold tracking-tight-x">
                              {doc.fileName || doc.filename || "Uploaded document"}
                            </p>
                            <p className="data-figure text-[10px] text-muted-foreground tracking-widest mt-0.5">
                              DATE UNAVAILABLE
                            </p>
                          </div>
                          <span className="data-figure text-[10px] tracking-widest text-muted-foreground px-2 py-1 rounded-md border border-bio-border/40">
                            DOCUMENT
                          </span>
                        </div>

                        <div className="mt-3 space-y-2">
                          {doc.documentFacts && doc.documentFacts.length > 0 ? (
                            doc.documentFacts.map((fact) => (
                              <div key={`${doc.id}-${fact.field}-${fact.value}`} className="rounded-md bg-bio-base/50 border border-trust-500/15 p-2.5">
                                <p className="data-figure text-[10px] font-bold tracking-widest text-muted-foreground">
                                  {fact.field}
                                </p>
                                <p className="text-sm text-foreground mt-0.5">{fact.value}</p>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground">No clinically dated facts were extracted.</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="lab-card lab-card-accent p-8 text-center">
              <Clock className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                No dated clinical events available yet. Undated document records will appear here when a document is uploaded without a clinical date.
              </p>
            </div>
          )}

          <DisclaimerBanner
            type="info"
            message="Timeline events are persisted as Convex records and shown here."
          />
        </motion.div>

        <div className="mt-6 flex items-center justify-between pb-8">
          <Button
            variant="outline"
            onClick={() => navigate("/patient/document")}
            className="border-trust-500/30 hover:bg-trust-500/10"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            <span className="data-figure tracking-wider">BACK</span>
          </Button>

          <Button
            className="bg-gradient-to-r from-trust-500 to-teal-500 hover:from-trust-400 hover:to-teal-400 text-white border-0 glow-primary"
            onClick={() => {
              setStep("triage");
              navigate("/patient/triage");
            }}
          >
            Continue to Triage
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
