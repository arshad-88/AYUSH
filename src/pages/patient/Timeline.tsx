import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { usePatientStore } from "@/store/patientStore";
import { useQuery } from "convex/react";
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
  Upload,
  Plus,
  Filter,
} from "lucide-react";
import {
  StatusBar,
  ParticleField,
  EmptyState,
} from "@/components/scientific";
import type { TimelineEvent } from "@/types";

type TimelineType = TimelineEvent["type"] | "consultation" | "investigation" | "assessment";

const typeConfig: Record<TimelineType, { icon: typeof Stethoscope; color: string; bg: string; border: string; label: string }> = {
  encounter: { icon: Stethoscope, color: "text-trust-300", bg: "bg-trust-500/15", border: "border-trust-500/40", label: "ENCOUNTER" },
  medication: { icon: Pill, color: "text-teal-400", bg: "bg-teal-500/15", border: "border-teal-500/40", label: "MEDICATION" },
  investigation: { icon: TestTube, color: "text-amber-warn", bg: "bg-amber-warn/15", border: "border-amber-warn/40", label: "INVESTIGATION" },
  lab: { icon: TestTube, color: "text-amber-warn", bg: "bg-amber-warn/15", border: "border-amber-warn/40", label: "LAB" },
  observation: { icon: Dna, color: "text-mint-400", bg: "bg-mint-500/15", border: "border-mint-500/40", label: "OBSERVATION" },
  consultation: { icon: Stethoscope, color: "text-trust-300", bg: "bg-trust-500/15", border: "border-trust-500/40", label: "CONSULTATION" },
  assessment: { icon: ClipboardList, color: "text-red-critical", bg: "bg-red-urgent/15", border: "border-red-urgent/40", label: "ASSESSMENT" },
};

const normalizeType = (raw: string | undefined): TimelineType => {
  const t = (raw ?? "").toLowerCase().trim();
  if (t === "encounter" || t === "medication" || t === "lab" || t === "observation") return t;
  if (t === "consultation") return "consultation";
  if (t === "investigation") return "investigation";
  if (t === "assessment") return "assessment";
  return "encounter";
};

type FilterKey = "all" | TimelineType;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "encounter", label: "Encounters" },
  { key: "medication", label: "Medications" },
  { key: "lab", label: "Labs" },
  { key: "observation", label: "Observations" },
];

export default function Timeline() {
  const navigate = useNavigate();
  const { timeline, documents, setStep, id: patientId } = usePatientStore();
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);

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

  const parseTimelineDate = (value?: string) => {
    if (!value || value === "Date unavailable" || value === "Not detected") return null;
    const normalized = value.trim();
    const actualDate = normalized.startsWith("~") ? normalized.slice(1) : normalized;
    const parsed = new Date(actualDate);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const sortedTimeline = useMemo(() => {
    const filtered =
      activeFilter === "all"
        ? [...timeline]
        : timeline.filter((event) => normalizeType(event.type) === activeFilter);

    return [...filtered].sort((a, b) => {
      const aDate = parseTimelineDate(a.date);
      const bDate = parseTimelineDate(b.date);

      if (!aDate && !bDate) return 0;
      if (!aDate) return 1;
      if (!bDate) return -1;
      return bDate.getTime() - aDate.getTime();
    });
  }, [timeline, activeFilter]);

  const undatedRecords = (documents ?? []).filter((doc) => {
    const dateValue = doc.extractedData?.date;
    return !dateValue || dateValue === "Date unavailable" || dateValue === "Not detected";
  });

  const hasAnyTimeline = sortedTimeline.length > 0 || undatedRecords.length > 0;

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

          {timeline.length > 0 && (
            <div className="lab-card lab-card-accent p-4">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="w-3.5 h-3.5 text-trust-300" />
                <span className="eyebrow">FILTER</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {FILTERS.map((filter) => {
                  const count =
                    filter.key === "all"
                      ? timeline.length
                      : timeline.filter((event) => normalizeType(event.type) === filter.key).length;
                  const isActive = activeFilter === filter.key;
                  return (
                    <button
                      key={filter.key}
                      type="button"
                      onClick={() => setActiveFilter(filter.key)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-all cursor-magnetic press-shrink ${
                        isActive
                          ? "bg-gradient-to-r from-trust-500 to-teal-500 border-trust-400/50 text-white glow-primary"
                          : "bg-bio-base/50 border-trust-500/25 text-muted-foreground hover:border-trust-400/50 hover:text-foreground"
                      }`}
                    >
                      <span>{filter.label}</span>
                      <span className="ml-2 data-figure text-[10px] opacity-70">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {hasAnyTimeline ? (
            <div className="space-y-8">
              {sortedTimeline.length > 0 && (
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
                        const normalizedType = normalizeType(event.type);
                        const config = typeConfig[normalizedType];
                        const Icon = config.icon;
                        const validDate = parseTimelineDate(event.date);
                        const displayDate = !event.date || event.date === "Date unavailable" || event.date === "Not detected"
                          ? "Date unavailable"
                          : event.date.startsWith("~")
                            ? event.date
                            : validDate && !Number.isNaN(validDate.getTime())
                              ? validDate.toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })
                              : event.date;

                        const isSelected = selectedEvent?.id === event.id;

                        return (
                          <motion.div
                            key={event.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.08 }}
                            className="relative flex items-start gap-4 pl-0"
                          >
                            <div
                              className={`relative z-10 w-10 h-10 rounded-full ${config.bg} ${config.border} border flex items-center justify-center flex-shrink-0 ring-4 ring-bio-base transition-transform duration-300`}
                            >
                              <Icon className={`w-4 h-4 ${config.color}`} strokeWidth={1.6} />
                            </div>

                            <button
                              type="button"
                              onClick={() => setSelectedEvent(isSelected ? null : event)}
                              className={`lab-card lab-card-accent flex-1 p-4 text-left cursor-magnetic transition-all duration-300 hover:translate-x-1 ${
                                isSelected ? "border-trust-400/60 glow-primary" : ""
                              }`}
                            >
                              <div className="flex items-start justify-between mb-2 gap-2 flex-wrap">
                                <div>
                                  <p className="data-figure text-[10px] text-muted-foreground tracking-widest">
                                    {displayDate}
                                  </p>
                                  <h3 className="text-sm font-bold tracking-tight-x mt-0.5">
                                    {event.title}
                                  </h3>
                                </div>
                                <span
                                  className={`data-figure text-[10px] font-semibold tracking-widest px-2 py-1 rounded-md border ${config.bg} ${config.border} ${config.color}`}
                                >
                                  {config.label}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {event.description}
                              </p>
                            </button>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

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
                              <div
                                key={`${doc.id}-${fact.field}-${fact.value}`}
                                className="rounded-md bg-bio-base/50 border border-trust-500/15 p-2.5"
                              >
                                <p className="data-figure text-[10px] font-bold tracking-widest text-muted-foreground">
                                  {fact.field}
                                </p>
                                <p className="text-sm text-foreground mt-0.5">{fact.value}</p>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              No clinically dated facts were extracted.
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="lab-card lab-card-accent p-10">
              <EmptyState
                variant="timeline"
                title="No dated clinical events yet"
                description="Upload a prescription or lab report to populate your medical timeline. The OCR engine extracts clinical dates automatically."
                primaryAction={{
                  label: "Upload Document",
                  onClick: () => navigate("/patient/document"),
                  icon: <Upload className="w-4 h-4" />,
                }}
                secondaryAction={{
                  label: "Add Manual Event",
                  onClick: () => navigate("/patient/document"),
                  icon: <Plus className="w-4 h-4" />,
                }}
              />
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